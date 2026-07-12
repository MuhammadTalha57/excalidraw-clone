import { SessionSchema } from "@excalidraw/shared/schema";
import { SessionType } from "@excalidraw/shared/types";
import { Session } from "./Session.js";
import { logger } from "../utils/logger.js";

export async function getActiveSession(
    sessionId: string,
): Promise<SessionType | null> {
    try {
        let session = await Session.findById(sessionId).lean();
        if (!session) return null;

        const parsedSession = SessionSchema.parse(session);

        logger.info(`Get Active Session From DB: ${sessionId}`);
        if (parsedSession.active) return parsedSession;
        else return null;
    } catch (error) {
        logger.error(
            `Error Getting Active Session From DB: ${sessionId} - ${error}`,
        );
        return null;
    }
}
