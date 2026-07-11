import { SessionSchema } from "@excalidraw/shared/schema";
import { getClient } from "./connect.js";
import { SessionType } from "@excalidraw/shared/types";
import { parse } from "path";

export async function getActiveSession(
    sessionId: string,
): Promise<SessionType | null> {
    try {
        const redisClient = getClient();

        let session = await redisClient.get(`session:${sessionId}`);
        if (!session) return null;

        session = JSON.parse(session);
        const parsedSession = SessionSchema.parse(session);

        if (parsedSession.active) return parsedSession;
        else return null;
    } catch (error) {
        console.error(error);
        return null;
    }
}
