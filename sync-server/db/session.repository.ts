import { SessionSchema } from "@excalidraw/shared/schema";
import { SessionType } from "@excalidraw/shared/types";
import { Session } from "./Session.js";

export async function getActiveSession(
    sessionId: string,
): Promise<SessionType | null> {
    try {
        let session = await Session.findById(sessionId).lean();
        if (!session) return null;

        console.log("Got this", session);
        const parsedSession = SessionSchema.parse(session);
        if (parsedSession.active) return parsedSession;
        else return null;
    } catch (error) {
        console.error(error);
        return null;
    }
}
