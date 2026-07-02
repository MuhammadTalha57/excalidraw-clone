import { Router } from "express";
import { Session } from "../db/Session.js";
import { generateSessionId, generateHostToken } from "../utils/id.js";

export const sessionRouter = Router();

/**
 * POST /api/sessions
 * Called when the user clicks "Start session" in the Share modal.
 * Body: { elements: Element[], hostName: string }
 * Returns: { sessionId, hostToken }
 *
 * hostToken is only ever sent here, at creation time. The frontend must store
 * it (e.g. localStorage) and send it back when joining the socket room in
 * order to be recognized as host.
 */
sessionRouter.post("/", async (req, res) => {
  try {
    const { elements, hostName } = req.body;

    if (!Array.isArray(elements)) {
      return res.status(400).json({ error: "elements must be an array" });
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

/**
 * GET /api/sessions/:id
 * Called when a browser opens a shared link directly (fresh tab, no socket yet).
 * Returns just enough to render the board before the socket connection takes over.
 * Never includes hostToken.
 */
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
