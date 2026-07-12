import {
    SessionSchema,
    SessionMetaSchema,
    CanvasElementSchema,
} from "@excalidraw/shared/schema";
import { getClient } from "./connect.js";
import {
    CanvasElement,
    CanvasElements,
    SessionMetaType,
    SessionType,
} from "@excalidraw/shared/types";
import { logger } from "../utils/logger.js";

const SESSION_TTL_SECONDS = Number(process.env.SESSION_TTL_SECONDS || 86400 * 7);
const DIRTY_SESSIONS_KEY = "dirty-sessions";

export async function getActiveSession(
    sessionId: string,
): Promise<SessionType | null> {
    try {
        const redisClient = getClient();

        let sessionMeta = await redisClient.get(`session:${sessionId}:meta`);
        if (!sessionMeta) return null;

        sessionMeta = JSON.parse(sessionMeta);
        const parsedSessionMeta = SessionMetaSchema.parse(sessionMeta);

        if (!parsedSessionMeta.active) return null;

        let rawSessionElements = await redisClient.hgetall(
            `session:${sessionId}:elements`,
        );
        let sessionElements: CanvasElements = {};
        for (const [id, json] of Object.entries(rawSessionElements)) {
            sessionElements[id] = CanvasElementSchema.parse(JSON.parse(json));
        }

        const session = {
            ...parsedSessionMeta,
            elements: sessionElements,
        };

        logger.info(`Retrieved Session:${sessionId} From Redis`);

        return session;
    } catch (error) {
        logger.error(`Error Getting Session From Redis: ${sessionId}`);
        return null;
    }
}

/**
 * Same as getActiveSession, but ignores the `active` flag. Used by the
 * flush job / end-session so an ended (inactive) session's final state
 * can still be read out of Redis and persisted to Mongo.
 */
export async function getRawSessionFromCache(
    sessionId: string,
): Promise<SessionType | null> {
    try {
        const redisClient = getClient();

        const rawMeta = await redisClient.get(`session:${sessionId}:meta`);
        if (!rawMeta) return null;

        const parsedMeta = SessionMetaSchema.parse(JSON.parse(rawMeta));

        const rawElements = await redisClient.hgetall(
            `session:${sessionId}:elements`,
        );
        const elements: CanvasElements = {};
        for (const [id, json] of Object.entries(rawElements)) {
            elements[id] = CanvasElementSchema.parse(JSON.parse(json));
        }

        return { ...parsedMeta, elements };
    } catch (error) {
        logger.error(
            `Error Reading Raw Session From Redis: ${sessionId} - ${error}`,
        );
        return null;
    }
}

/**
 * Cache-warms Redis with a FULL session (meta + elements), e.g. right
 * after creation or on a Mongo fallback read. This matters: without it,
 * a session whose meta gets cached (e.g. via updateSessionMeta on join)
 * but whose elements never get individually written would look "dirty"
 * with an EMPTY elements hash — and a later flush would overwrite Mongo's
 * real elements with {}. Always warm meta+elements together.
 */
export async function writeFullSessionToCache(
    session: SessionType,
): Promise<void> {
    try {
        const redisClient = getClient();
        const { elements, ...meta } = session;

        const pipeline = redisClient.pipeline();
        pipeline.set(
            `session:${session._id}:meta`,
            JSON.stringify(meta),
            "EX",
            SESSION_TTL_SECONDS,
        );
        pipeline.del(`session:${session._id}:elements`);
        for (const element of Object.values(elements)) {
            pipeline.hset(
                `session:${session._id}:elements`,
                element.id,
                JSON.stringify(element),
            );
        }
        pipeline.expire(`session:${session._id}:elements`, SESSION_TTL_SECONDS);
        await pipeline.exec();
    } catch (error) {
        logger.error(
            `Error Warming Session Cache: ${session._id} - ${error}`,
        );
    }
}

export async function updateElement(
    sessionId: string,
    updatedElement: CanvasElement,
): Promise<void> {
    try {
        const redisClient = getClient();

        const pipeline = redisClient.pipeline();
        pipeline.hset(
            `session:${sessionId}:elements`,
            updatedElement.id,
            JSON.stringify(updatedElement),
        );
        pipeline.expire(`session:${sessionId}:elements`, SESSION_TTL_SECONDS);
        pipeline.expire(`session:${sessionId}:meta`, SESSION_TTL_SECONDS);
        pipeline.sadd(DIRTY_SESSIONS_KEY, sessionId);
        await pipeline.exec();

        logger.info(
            `Updated Element From Redis: ${sessionId} - ${updatedElement}`,
        );
    } catch (error) {
        logger.error(
            `Error Updating Element From Redis: ${sessionId} - ${updatedElement}`,
        );
        return;
    }
}

export async function updateSessionMeta(
    sessionId: string,
    updatedSessionMeta: SessionMetaType,
): Promise<void> {
    try {
        const redisClient = getClient();

        const pipeline = redisClient.pipeline();
        pipeline.set(
            `session:${sessionId}:meta`,
            JSON.stringify(updatedSessionMeta),
            "EX",
            SESSION_TTL_SECONDS,
        );
        pipeline.expire(`session:${sessionId}:elements`, SESSION_TTL_SECONDS);
        pipeline.sadd(DIRTY_SESSIONS_KEY, sessionId);
        await pipeline.exec();

        logger.info(
            `Updated Session Meta From Redis: ${sessionId} - ${updatedSessionMeta}`,
        );
    } catch (error) {
        logger.error(
            `Error Updating Session Meta From Redis: ${sessionId} - ${updatedSessionMeta}`,
        );
        return;
    }
}

export async function markSessionDirty(sessionId: string): Promise<void> {
    try {
        await getClient().sadd(DIRTY_SESSIONS_KEY, sessionId);
    } catch (error) {
        logger.error(`Error Marking Session Dirty: ${sessionId} - ${error}`);
    }
}

export async function clearSessionDirty(sessionId: string): Promise<void> {
    try {
        await getClient().srem(DIRTY_SESSIONS_KEY, sessionId);
    } catch (error) {
        logger.error(`Error Clearing Session Dirty Flag: ${sessionId} - ${error}`);
    }
}

export async function getDirtySessionIds(): Promise<string[]> {
    return getClient().smembers(DIRTY_SESSIONS_KEY);
}