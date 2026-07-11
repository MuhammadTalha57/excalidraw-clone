import { Router } from "express";
import { Session } from "../db/Session.js";
import { generateSessionId, generateHostToken } from "../utils/id.js";
import { CanvasElementSchema } from "@excalidraw/shared/schema";
import { CanvasElement } from "@excalidraw/shared/types";

export const sessionRouter = Router();


sessionRouter.post("/", async (req, res) => {
  try {
    const { elements, hostName }: {elements: CanvasElement, hostName: string} = req.body;

    const parsedElements = CanvasElementSchema.parse(elements);

    const sessionId = generateSessionId();
    const hostToken = generateHostToken();

    await Session.create({
      _id: sessionId,
      parsedElements,
      hostToken,
      hostName: typeof hostName === "string" && hostName.trim() ? hostName.trim() : "Host",
    });

    res.status(201).json({ sessionId, hostToken });
  } catch (err) {
    console.error("[POST /api/sessions] error:", err);
    res.status(500).json({ error: "Failed to create session" });
  }
});

sessionRouter.get("/:id", async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).lean();

    if (!session) {
      return res.status(404).json({ error: "Session not found or expired" });
    }

    res.json({
      sessionId: session._id,
      elements: session.elements,
      hostName: session.hostName,
    });
  } catch (err) {
    console.error("[GET /api/sessions/:id] error:", err);
    res.status(500).json({ error: "Failed to fetch session" });
  }
});
