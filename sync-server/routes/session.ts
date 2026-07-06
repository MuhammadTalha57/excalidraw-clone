import { Router } from "express";
import { Session } from "../db/Session.js";
import { generateSessionId, generateHostToken } from "../utils/id.js";

export const sessionRouter = Router();


sessionRouter.post("/", async (req, res) => {
  try {
    const { elements, hostName } = req.body;

     if (!elements || typeof elements !== "object" || Array.isArray(elements)) {
      return res.status(400).json({ error: "elements must be a valid key-value object" });
    }

    const sessionId = generateSessionId();
    const hostToken = generateHostToken();

    await Session.create({
      _id: sessionId,
      elements,
      hostToken,
      hostName: typeof hostName === "string" && hostName.trim() ? hostName.trim() : "Host",
      updatedAt: new Date(),
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
