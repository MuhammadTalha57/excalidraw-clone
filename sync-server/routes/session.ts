import { Router } from "express";
import { Session } from "../db/Session.js";
import { generateSessionId, generateHostToken } from "../utils/id.js";
import { CanvasElementSchema, CanvasElementsSchema } from "@excalidraw/shared/schema";
import { CanvasElement, CanvasElements, SessionType } from "@excalidraw/shared/types";
import { parse } from "path";
import {logger} from "../utils/logger.js"
import { getActiveSession } from "../services/session.service.js";

export const sessionRouter = Router();


sessionRouter.post("/", async (req, res) => {
  try {
    const { elements, hostName }: {elements: CanvasElements, hostName: string} = req.body;

    const parsedElements = CanvasElementsSchema.parse(elements);

    const sessionId = generateSessionId();
    const hostToken = generateHostToken();

    const session: SessionType = {
      _id: sessionId,
      elements: parsedElements,
      hostName: hostName,
      hostToken: hostToken,
      hostSocketId: null,
      active: true,
    }

    await Session.create({
      ...session
    });
    
    logger.info(`${hostName} created new session`);
    res.status(201).json({ sessionId, hostToken });
  } catch (err) {
    console.error("[POST /api/sessions] error:", err);
    res.status(500).json({ error: "Failed to create session" });
  }
});

sessionRouter.get("/:id", async (req, res) => {
  try {
    const session = await getActiveSession(req.params.id);

    if (!session) {
      return res.status(404).json({ error: "Session not found or expired" });
    }

    res.json({
      session
    });
  } catch (err) {
    console.error("[GET /api/sessions/:id] error:", err);
    res.status(500).json({ error: "Failed to fetch session" });
  }
});
