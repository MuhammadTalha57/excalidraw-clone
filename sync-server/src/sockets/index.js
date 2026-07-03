import { Session } from "../db/Session.js";

const SAVE_DEBOUNCE_MS = 1000;

/**
 * In-memory cache of currently active sessions, keyed by sessionId.
 * This is the fast path for broadcasting: every element-update is applied
 * here and rebroadcast immediately. MongoDB is only touched on a debounce,
 * so a session survives a server restart / gives a late joiner real state
 * without every single stroke causing a DB write.
 *
 * Shape: { elements, hostToken, hostSocketId, saveTimer }
 */
const activeSessions = new Map();

async function loadSessionIntoMemory(sessionId) {
  const doc = await Session.findById(sessionId).lean();
  if (!doc) return null;

  const state = {
    elements: doc.elements,
    hostToken: doc.hostToken,
    hostSocketId: doc.hostSocketId,
    saveTimer: null,
  };
  activeSessions.set(sessionId, state);
  return state;
}

function scheduleSave(sessionId) {
  const state = activeSessions.get(sessionId);
  if (!state) return;

  if (state.saveTimer) clearTimeout(state.saveTimer);

  state.saveTimer = setTimeout(async () => {
    const current = activeSessions.get(sessionId);
    if (!current) return;

    try {
      await Session.findByIdAndUpdate(sessionId, {
        elements: current.elements,
        updatedAt: new Date(),
      });
    } catch (err) {
      console.error(`[sockets] failed to persist session ${sessionId}:`, err);
    }
  }, SAVE_DEBOUNCE_MS);
}

export function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    // Per-connection state: which room this socket is in, and their display name.
    let currentSessionId = null;
    let currentName = null;

    socket.on("join-session", async ({ sessionId, name, hostToken } = {}, ack) => {
      try {
        if (!sessionId) {
          return ack?.({ error: "sessionId is required" });
        }

        let state = activeSessions.get(sessionId);
        if (!state) {
          state = await loadSessionIntoMemory(sessionId);
        }

        if (!state) {
          return ack?.({ error: "Session not found or has expired" });
        }

        currentSessionId = sessionId;
        currentName = (typeof name === "string" && name.trim()) || "Guest";
        socket.join(sessionId);

        // Only the holder of the matching hostToken (set at creation, stored
        // client-side) is granted host privileges. This also lets the real
        // host reclaim status after a page refresh, since hostSocketId changes
        // on every reconnect but hostToken does not.
        const isHost = Boolean(hostToken) && hostToken === state.hostToken;
        if (isHost) {
          state.hostSocketId = socket.id;
          Session.findByIdAndUpdate(sessionId, { hostSocketId: socket.id }).catch((err) =>
            console.error("[join-session] failed to persist hostSocketId:", err)
          );
        }

        ack?.({ elements: state.elements, isHost });
        socket.to(sessionId).emit("peer-joined", { name: currentName });
      } catch (err) {
        console.error("[socket join-session] error:", err);
        ack?.({ error: "Failed to join session" });
      }
    });

    socket.on("element-update", ({ elements } = {}) => {
      if (!currentSessionId || !Array.isArray(elements)) return;

      const state = activeSessions.get(currentSessionId);
      if (!state) return;

      state.elements = elements;
      socket.to(currentSessionId).emit("element-update", { elements });
      scheduleSave(currentSessionId);
    });

    socket.on("element-add", ({ element } = {}) => {
      if (!currentSessionId) return;

      const state = activeSessions.get(currentSessionId);
      if (!state) return;

      state.elements.push(element);
      socket.to(currentSessionId).emit("element-add", { element });
      scheduleSave(currentSessionId);
    });

    socket.on("cursor-move", (payload = {}) => {
      if (!currentSessionId) return;
      socket.to(currentSessionId).emit("cursor-move", {
        ...payload,
        socketId: socket.id,
        name: currentName,
      });
    });

    socket.on("end-session", async ({ sessionId } = {}, ack) => {
      try {
        const state = activeSessions.get(sessionId);

        if (!state) {
          return ack?.({ error: "Session not found" });
        }
        if (state.hostSocketId !== socket.id) {
          return ack?.({ error: "Only the host can end the session" });
        }

        if (state.saveTimer) clearTimeout(state.saveTimer);

        io.to(sessionId).emit("session-ended");
        activeSessions.delete(sessionId);
        await Session.findByIdAndDelete(sessionId);

        ack?.({ ok: true });
      } catch (err) {
        console.error("[socket end-session] error:", err);
        ack?.({ error: "Failed to end session" });
      }
    });

    socket.on("disconnect", () => {
      if (!currentSessionId) return;
      socket.to(currentSessionId).emit("peer-left", { name: currentName });
      // Deliberately not auto-ending the session if the host disconnects
      // (tab close / network blip). The session just sits there until someone
      // explicitly ends it, or the Mongo TTL index reaps it after inactivity.
    });
  });
}
