import { SessionSchema, SessionMetaSchema, CanvasElementSchema, CanvasBaseElementSchema } from "@excalidraw/shared/schema";
import { getClient } from "./connect.js";
import { CanvasElement, CanvasElements, SessionMetaType, SessionType } from "@excalidraw/shared/types";

export async function getActiveSession(
    sessionId: string,
): Promise<SessionType | null> {
    try {
        const redisClient = getClient();

        let sessionMeta = await redisClient.get(`session:${sessionId}:meta`);
        if (!sessionMeta) return null;

        sessionMeta = JSON.parse(sessionMeta);
        // console.log("JSON META", sessionMeta);
        const parsedSessionMeta = SessionMetaSchema.parse(sessionMeta);

        if (!parsedSessionMeta.active) return null;
        
        let rawSessionElements = await redisClient.hgetall(`session:${sessionId}:elements`);
        let sessionElements: CanvasElements = {};
        for(const [id, json] of Object.entries(rawSessionElements)) {
            sessionElements[id] = CanvasElementSchema.parse(JSON.parse(json));
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

export async function updateElement(
    sessionId: string,
    updatedElement: CanvasElement
): Promise<void> {
    try {
        const redisClient = getClient();
        await redisClient.hset(`session:${sessionId}:elements`, updatedElement.id, JSON.stringify(updatedElement));

    } catch (error) {
        console.error(error);
        return;
    }
}

export async function updateSessionMeta(
    sessionId: string,
    updatedSessionMeta: SessionMetaType,
): Promise<void> {
    try {
        const redisClient = getClient();

        redisClient.set(`session:${sessionId}:meta`, JSON.stringify(updatedSessionMeta));
    } catch (error) {
        console.error(error);
        return;
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
