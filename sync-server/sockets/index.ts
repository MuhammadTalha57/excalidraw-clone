import { Server, Socket } from "socket.io";
import { CanvasElement, PartialCanvasElement } from "@excalidraw/shared/types";
import {
    getActiveSession,
    updateElement,
    updateSessionMeta,
    flushSessionToDB,
    deleteElements,
} from "../services/session.service.js";
import {
    CanvasElementSchema,
    PartialCanvasElementSchema,
} from "@excalidraw/shared/schema";
import { logger } from "../utils/logger.js";

export function registerSocketHandlers(io: Server) {
    io.on("connection", (socket: Socket) => {
        let currentSessionId: string | null = null;
        let currentName: string | null = null;

        socket.on(
            "join-session",
            async (
                {
                    sessionId,
                    name,
                    hostToken,
                }: { sessionId: string; name: string; hostToken: string },
                ack,
            ) => {
                try {
                    if (!sessionId) {
                        return ack?.({ error: "sessionId is required" });
                    }

                    let state = await getActiveSession(sessionId);

                    if (!state) {
                        return ack?.({
                            error: "Session not found or has expired",
                        });
                    }

                    currentSessionId = sessionId;
                    currentName =
                        (typeof name === "string" && name.trim()) || "Guest";
                    socket.join(sessionId);

                    const isHost =
                        Boolean(hostToken) && hostToken === state.hostToken;
                    if (isHost) {
                        state.hostSocketId = socket.id;

                        await updateSessionMeta(sessionId, {
                            _id: state._id,
                            hostToken: state.hostToken,
                            hostName: state.hostName,
                            active: state.active,
                            hostSocketId: state.hostSocketId,
                        });
                    }

                    logger.info(`${currentName} joined session:${sessionId}`);

                    ack?.({ elements: state.elements, isHost });
                    socket
                        .to(sessionId)
                        .emit("peer-joined", { name: currentName });
                } catch (err) {
                    logger.error(`[socket join-session] error: ${err}`);
                    ack?.({ error: "Failed to join session" });
                }
            },
        );

        socket.on(
            "element-update",
            async ({
                id,
                patch,
            }: {
                id: string;
                patch: PartialCanvasElement;
            }) => {
                logger.info(
                    `Received Element Update by ${currentName} on socket:${socket.id}`,
                );
                patch = PartialCanvasElementSchema.parse(patch);
                if (!currentSessionId) return;

                const state = await getActiveSession(currentSessionId);
                if (!state) return;

                const existing = state.elements[id];
                if (!existing) return;

                patch = PartialCanvasElementSchema.parse(patch);

                const updatedElement = {
                    ...existing,
                    ...patch,
                } as CanvasElement;

                // state.elements.set(id, updatedElement);
                updateElement(currentSessionId, updatedElement);

                logger.info(
                    `Emitting Element Update by ${currentName} on socket:${socket.id}`,
                );
                socket
                    .to(currentSessionId)
                    .emit("element-update", { id, patch });
                // scheduleSave(currentSessionId);
            },
        );

        socket.on("element-add", async ({ element } = {}) => {
            logger.info(`Received Element Add by ${currentName}`);
            if (!currentSessionId) return;

            const state = await getActiveSession(currentSessionId);
            if (!state) return;

            element = CanvasElementSchema.parse(element);

            updateElement(currentSessionId, element);
            socket.to(currentSessionId).emit("element-add", { element });
        });

        socket.on("element-delete", async ({ ids }: { ids: string[] }) => {
            logger.info(`Received Element Delete by ${currentName}`);
            if (!currentSessionId) return;

            const state = await getActiveSession(currentSessionId);
            if (!state) return;

            deleteElements(currentSessionId, ids);
            socket.to(currentSessionId).emit("element-delete", { ids });
        });

        socket.on(
            "cursor-move",
            ({
                socketId,
                x,
                y,
                name,
            }: {
                socketId: string;
                x: number;
                y: number;
                name: string;
            }) => {
                logger.info(`Received Cursor Move by ${currentName}`);
                if (!currentSessionId) return;
                socket.to(currentSessionId).emit("cursor-move", {
                    x: x,
                    y: y,
                    socketId: socket.id,
                    name: currentName,
                });
            },
        );

        socket.on("end-session", async ({ sessionId } = {}, ack) => {
            try {
                const state = await getActiveSession(sessionId);

                if (!state) {
                    return ack?.({ error: "Session not found" });
                }
                if (state.hostSocketId !== socket.id) {
                    return ack?.({
                        error: "Only the host can end the session",
                    });
                }

                io.to(sessionId).emit("session-ended");

                await updateSessionMeta(sessionId, {
                    _id: state._id,
                    hostToken: state.hostToken,
                    hostName: state.hostName,
                    hostSocketId: state.hostSocketId,
                    active: false,
                });

                // Force an immediate, synchronous persist rather than waiting for
                // the next scheduled flush — we don't want the final board state
                // (or the active:false flag) resting only on a 24h Redis TTL.
                await flushSessionToDB(sessionId);

                logger.info(`Session Ended: ${currentSessionId}`);

                ack?.({ ok: true });
            } catch (err) {
                logger.error("[socket end-session] error:", err);
                ack?.({ error: "Failed to end session" });
            }
        });

        socket.on("disconnect", () => {
            if (!currentSessionId) return;
            socket
                .to(currentSessionId)
                .emit("peer-left", { name: currentName });

            logger.info(
                `${currentName} Disconnected From Session: ${currentSessionId}`,
            );
            // Deliberately not auto-ending the session if the host disconnects
            // (tab close / network blip). The session just sits there until someone
            // explicitly ends it, or the Mongo TTL index reaps it after inactivity.
        });
    });
}
