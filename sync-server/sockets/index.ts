import { Session } from "../db/Session.js";
import {Server, Socket} from "socket.io";
import { CanvasElement } from "../lib/types.js";

const SAVE_DEBOUNCE_MS = 1000;


const activeSessions = new Map();

async function loadSessionIntoMemory(sessionId: string) {
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

function scheduleSave(sessionId: string) {
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

export function registerSocketHandlers(io: Server) {
  io.on("connection", (socket: Socket) => {
    // Per-connection state: which room this socket is in, and their display name.
    let currentSessionId: string | null = null;
    let currentName: string | null = null;

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


    socket.on("element-update", (payload: any) => {
      if (!currentSessionId || !payload || !payload.element || payload.id ) return;
      const elementPatch = payload.element as Partial<CanvasElement>;

      const state = activeSessions.get(currentSessionId);
      if (!state) return;

      const existing = state.elements.get(payload.id);
      if(!existing) return;

      const updatedElement = {
        ...existing,
        ...elementPatch,
      } as CanvasElement;

      state.elements.set(payload.id, updatedElement);

      socket.to(currentSessionId).emit("element-update", { id: payload.id, element: payload.element });
      scheduleSave(currentSessionId);
    });

    socket.on("element-add", ({ element } = {}) => {
      if (!currentSessionId) return;

      const state = activeSessions.get(currentSessionId);
      if (!state) return;

      state.elements.set(element.id, element);
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
