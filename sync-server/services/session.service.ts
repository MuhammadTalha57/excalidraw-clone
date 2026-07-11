import { SessionType } from "@excalidraw/shared/types";
import { getActiveSession as getActiveSessionFromCache, updateSesion as updateSessionFromCache } from "../cache/session.cache.js"
import { getActiveSession as getActiveSessionFromDB } from "../db/session.repository.js"

export async function getActiveSession(sessionId: string): Promise<SessionType | null> {
    // Try Redis
    let session = await getActiveSessionFromCache(sessionId);
    if(session) return session;

    // Try Mongo DB
    session = await getActiveSessionFromDB(sessionId);
    if(session) return session;

    return null;
}

export async function updateSession(sessionId: string, patch: Partial<SessionType>): Promise<SessionType | null> {
    let updatedSession = await updateSessionFromCache(sessionId, patch);

    return updatedSession;
}