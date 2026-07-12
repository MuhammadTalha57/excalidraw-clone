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

export async function updateElement(
    sessionId: string,
    updatedElement: CanvasElement,
): Promise<void> {
    try {
        const redisClient = getClient();
        await redisClient.hset(
            `session:${sessionId}:elements`,
            updatedElement.id,
            JSON.stringify(updatedElement),
        );

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

        redisClient.set(
            `session:${sessionId}:meta`,
            JSON.stringify(updatedSessionMeta),
        );

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

// export async function updateSesion(
//     sessionId: string,
//     patch: Partial<SessionType>,
// ): Promise<SessionType | null> {
//     try {
//         const redisClient = getClient();

//         let session = await redisClient.get(`session:${sessionId}`);
//         if (!session) return null;

//         session = JSON.parse(session);
//         const parsedSession = SessionSchema.parse(session);

//         const updatedSession = {
//             ...parsedSession,
//             ...patch,
//         };

//         redisClient.set(`session:${sessionId}`, JSON.stringify(updatedSession));

//         return updatedSession;
//     } catch (error) {
//         console.error(error);
//         return null;
//     }
// }
