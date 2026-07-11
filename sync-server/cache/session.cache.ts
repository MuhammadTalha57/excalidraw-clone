import { SessionSchema, SessionMetaSchema, CanvasElementSchema } from "@excalidraw/shared/schema";
import { getClient } from "./connect.js";
import { CanvasElement, SessionType } from "@excalidraw/shared/types";

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
        
        let rawSessionElements = await redisClient.hgetall(`session:${sessionId}:elements`);
        let sessionElements = new Map<string, CanvasElement>();
        for(const [id, json] of Object.entries(rawSessionElements)) {
            sessionElements.set(id, CanvasElementSchema.parse(json));
        }

        const session = {
            ...parsedSessionMeta, 
            elements: sessionElements,
        };

        return session;

    } catch (error) {
        
        console.error(error);
        return null;
    }
}

export async function updateSesion(
    sessionId: string,
    patch: Partial<SessionType>,
): Promise<SessionType | null> {
    try {
        const redisClient = getClient();

        let session = await redisClient.get(`session:${sessionId}`);
        if (!session) return null;

        session = JSON.parse(session);
        const parsedSession = SessionSchema.parse(session);

        const updatedSession = {
            ...parsedSession,
            ...patch,
        };

        redisClient.set(`session:${sessionId}`, JSON.stringify(updatedSession));

        return updatedSession;
    } catch (error) {
        console.error(error);
        return null;
    }
}
