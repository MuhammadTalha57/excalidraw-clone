import { Session } from "../db/Session.js";
import {Server, Socket} from "socket.io";
import { CanvasElement, PartialCanvasElement } from "@excalidraw/shared/types"
import {getActiveSession, updateElement, updateSession, updateSessionMeta} from "../services/session.service.js"
import { CanvasElementSchema, PartialCanvasElementSchema } from "@excalidraw/shared/schema";
import {logger} from "../utils/logger.js"


const SAVE_DEBOUNCE_MS = 1000;

const activeSessions = new Map();

async function loadSessionIntoMemory(sessionId: string) {
  const doc = await Session.findById(sessionId).lean();
  if (!doc) return null;

  const state = {
    elements: doc.elements,
    hostToken: doc.hostToken, 
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
      logger.error(`[sockets] failed to persist session ${sessionId}:`, err);
    }
  }, SAVE_DEBOUNCE_MS);
}

export function registerSocketHandlers(io: Server) {
  io.on("connection", (socket: Socket) => {
    let currentSessionId: string | null = null;
    let currentName: string | null = null;

    socket.on("join-session", async ({ sessionId, name, hostToken } = {}, ack) => {
      try {
        if (!sessionId) {
          return ack?.({ error: "sessionId is required" });
        }

        let state = await getActiveSession(sessionId);

        if (!state) {
          return ack?.({ error: "Session not found or has expired" });
        }

        currentSessionId = sessionId;
        currentName = (typeof name === "string" && name.trim()) || "Guest";
        socket.join(sessionId);

        const isHost = Boolean(hostToken) && hostToken === state.hostToken;
        if (isHost) {
          state.hostSocketId = socket.id;
          
          // const updatedSession = await updateSession(sessionId, {hostSocketId: socket.id});
          await updateSessionMeta(sessionId, {_id: state._id, hostToken: state.hostToken, hostName: state.hostName, active: state.active, hostSocketId: state.hostSocketId});

          // Session.findByIdAndUpdate(sessionId, { hostSocketId: socket.id }).catch((err) =>
          //   logger.error("[join-session] failed to persist hostSocketId:", err)
          // );
        }

        logger.info(`${currentName} joined session:${sessionId}`);

        ack?.({ elements: state.elements, isHost });
        socket.to(sessionId).emit("peer-joined", { name: currentName });
      } catch (err) {
        logger.error("[socket join-session] error:", err);
        ack?.({ error: "Failed to join session" });
      }
    });


    socket.on("element-update", async ({id, patch, senderId} :{id: string, patch: PartialCanvasElement, senderId: any}) => {
      logger.info(`Received Element Update by ${currentName} on socket:${socket.id}`);
      patch = PartialCanvasElementSchema.parse(patch);
      if (!currentSessionId) return;

      const state = await getActiveSession(currentSessionId);
      if (!state) return;

      const existing = state.elements[id];
      if(!existing) return;


      patch = PartialCanvasElementSchema.parse(patch);

      const updatedElement = {
        ...existing,
        ...patch,
      } as CanvasElement;

      // state.elements.set(id, updatedElement);
      updateElement(currentSessionId, updatedElement);

      logger.info(`Emitting Element Update by ${currentName} on socket:${socket.id}`);
      socket.to(currentSessionId).emit("element-update", { id, patch, senderId });
      scheduleSave(currentSessionId);
    });

    socket.on("element-add", async ({ element } = {}) => {
      logger.info(`Received Element Add by ${currentName}`);
      if (!currentSessionId) return;

      const state = await getActiveSession(currentSessionId);
      if (!state) return;

      element = CanvasElementSchema.parse(element);

      updateElement(currentSessionId, element)
      socket.to(currentSessionId).emit("element-add", { element });
      scheduleSave(currentSessionId);
    });

    // socket.on("cursor-move", (payload = {}) => {
    //   if (!currentSessionId) return;
    //   socket.to(currentSessionId).emit("cursor-move", {
    //     ...payload,
    //     socketId: socket.id,
    //     name: currentName,
    //   });
    // });

    socket.on("end-session", async ({ sessionId } = {}, ack) => {
      try {
        const state = await getActiveSession(sessionId);

        if (!state) {
          return ack?.({ error: "Session not found" });
        }
        if (state.hostSocketId !== socket.id) {
          return ack?.({ error: "Only the host can end the session" });
        }

        // if (state.saveTimer) clearTimeout(state.saveTimer);

        io.to(sessionId).emit("session-ended");
        updateSessionMeta(sessionId, {_id:state._id, hostToken: state.hostToken, hostName: state.hostName, hostSocketId: state.hostSocketId, active: false});
        
        // await Session.findByIdAndDelete(sessionId);

        ack?.({ ok: true });
      } catch (err) {
        logger.error("[socket end-session] error:", err);
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
