import {
    CanvasElement,
    SessionMetaType,
    SessionType,
} from "@excalidraw/shared/types";
import {
    getActiveSession as getActiveSessionFromCache,
    updateElement as updateElementFromRedis,
    updateSessionMeta as updateSessionMetaFromRedis,
} from "../cache/session.cache.js";
import { getActiveSession as getActiveSessionFromDB } from "../db/session.repository.js";

export async function getActiveSession(
    sessionId: string,
): Promise<SessionType | null> {
    // Try Redis
    let session = await getActiveSessionFromCache(sessionId);
    if (session) return session;

    // Try Mongo DB
    session = await getActiveSessionFromDB(sessionId);
    if (session) return session;

    return null;
}

export async function updateElement(
    sessionId: string,
    updatedElement: CanvasElement,
): Promise<void> {
    updateElementFromRedis(sessionId, updatedElement);
}

export async function updateSessionMeta(
    sessionId: string,
    updatedMeta: SessionMetaType,
) {
    updateSessionMetaFromRedis(sessionId, updatedMeta);
}

// export async function updateSession(sessionId: string, patch: Partial<SessionType>): Promise<SessionType | null> {
//     let updatedSession = await updateSessionFromCache(sessionId, patch);

//     return updatedSession;
// }
