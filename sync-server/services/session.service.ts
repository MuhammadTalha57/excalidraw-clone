import {
    CanvasElement,
    SessionMetaType,
    SessionType,
} from "@excalidraw/shared/types";
import {
    getActiveSession as getActiveSessionFromCache,
    getRawSessionFromCache,
    writeFullSessionToCache,
    updateElement as updateElementFromRedis,
    deleteElements as deleteElementsFromRedis,
    updateSessionMeta as updateSessionMetaFromRedis,
    markSessionDirty,
    clearSessionDirty,
    getDirtySessionIds,
} from "../cache/session.cache.js";
import { getActiveSession as getActiveSessionFromDB } from "../db/session.repository.js";
import { Session } from "../db/Session.js";
import { logger } from "../utils/logger.js";

export async function getActiveSession(
    sessionId: string,
): Promise<SessionType | null> {
    // Try Redis
    let session = await getActiveSessionFromCache(sessionId);
    if (session) return session;

    // Try Mongo DB
    session = await getActiveSessionFromDB(sessionId);
    if (session) {

        await writeFullSessionToCache(session);
        return session;
    }

    return null;
}

export async function updateElement(
    sessionId: string,
    updatedElement: CanvasElement,
): Promise<void> {
    return updateElementFromRedis(sessionId, updatedElement);
}

export async function updateSessionMeta(
    sessionId: string,
    updatedMeta: SessionMetaType,
): Promise<void> {
    return updateSessionMetaFromRedis(sessionId, updatedMeta);
}

export async function deleteElements(
    sessionId: string,
    ids: string[],
): Promise<void> {
    return deleteElementsFromRedis(sessionId, ids);
}

export async function flushSessionToDB(sessionId: string): Promise<boolean> {
    await clearSessionDirty(sessionId);

    const state = await getRawSessionFromCache(sessionId);
    if (!state) return false; 

    const { elements, ...meta } = state;

    await Session.findByIdAndUpdate(
        sessionId,
        { $set: { ...meta, elements } },
        { upsert: true },
    );

    return true;
}

export async function flushAllDirtySessions(): Promise<{
    total: number;
    flushed: number;
    failed: number;
}> {
    const sessionIds = await getDirtySessionIds();

    let flushed = 0;
    let failed = 0;

    for (const sessionId of sessionIds) {
        try {
            const didFlush = await flushSessionToDB(sessionId);
            if (didFlush) flushed++;
        } catch (error) {
            failed++;
            logger.error(
                `[flushAllDirtySessions] failed for ${sessionId}: ${error}`,
            );
            await markSessionDirty(sessionId); // retry next run
        }
    }

    return { total: sessionIds.length, flushed, failed };
}
