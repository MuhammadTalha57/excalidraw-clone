import { io, Socket } from "socket.io-client";

import { CanvasElement } from "@excalidraw/shared/types";
import { useCanvasElementsStore } from "@/stores/useCanvasElements";
import { useSessionStore } from "@/stores/useSessionStore";
import {CanvasElements} from "@excalidraw/shared/types"

type JoinAck = {
    elements?: CanvasElements;
    isHost?: boolean;
    error?: string;
};

type CreateSessionResponse = {
    sessionId: string;
    hostToken: string;
    error?: string;
};

let socket: Socket | null = null;
let socketListenersBound = false;

const syncServerUrl = process.env.NEXT_PUBLIC_SYNC_SERVER_URL;

const setCanvasElements = useCanvasElementsStore.getState().setCanvasElements;
const addCanvasElement = useCanvasElementsStore.getState().addCanvasElement;
const updateCanvasElement = useCanvasElementsStore.getState().updateCanvasElement;
const {
    clearSessionState,
    setSessionError,
    setSessionPending,
    setSessionState,
} = useSessionStore.getState();

function getSyncServerUrl(): string {
    if (!syncServerUrl) {
        throw new Error("Missing NEXT_PUBLIC_SYNC_SERVER_URL environment variable");
    }

    return syncServerUrl;
}

export function getSocket(): Socket {
    if (!socket) {
        // socket = io(getSyncServerUrl(), { autoConnect: false });
        socket = io(getSyncServerUrl(), {
  path: "/api/socket/socket.io",   // must match the function's route path
  transports: ["websocket"],       // required — skip long-polling, it doesn't play well with Vercel functions
});
    }

    return socket;
}

function bindSocketListeners() {
    if (socketListenersBound) return;

    const currentSocket = getSocket();

    currentSocket.on("element-update", ({ id, patch, senderId }: { id: string, patch: Partial<CanvasElement>, senderId: any }) => {
        console.log("Received Element Update");
    //     if (senderId === currentSocket.id) {
    //     console.log("Ignored self-echo packet");
    //     return; 
    // }
        updateCanvasElement(id, patch, false);
    });

    currentSocket.on("element-add", ({ element }: { element?: CanvasElement }) => {
        console.log("Received Element Addition");
        if (element) {
            addCanvasElement(element, false);
        }
    });

    currentSocket.on("element-delete", ({ids}: {ids: string[]}) => {
        useCanvasElementsStore.getState().deleteCanvasElements(ids, false);
    })

    currentSocket.on("session-ended", () => {
        restoreLocalBoard();
        clearSessionState();
        currentSocket.disconnect();
    });

    socketListenersBound = true;
}

function storeLocalBoard(elements: CanvasElements) {
    localStorage.setItem("local-board", JSON.stringify(elements));
}

function restoreLocalBoard() {
    const local: Record<string, CanvasElement> = JSON.parse(localStorage.getItem("local-board") ?? "{}");

    setCanvasElements(local);
}

function emitJoinSession(
    sessionId: string,
    name: string,
    hostToken: string | undefined
): Promise<JoinAck> {
    return new Promise((resolve) => {
        const currentSocket = getSocket();

        currentSocket.emit(
            "join-session",
            { sessionId, name, hostToken },
            (ack: JoinAck = {}) => resolve(ack)
        );
    });
}

export async function startSession(elements: CanvasElements, name: string) {
    setSessionError(null);
    setSessionPending(true);
    storeLocalBoard(elements);

    try {
        const response = await fetch(`${getSyncServerUrl()}/api/sessions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ elements:elements, hostName: name }),
        });

        const payload: CreateSessionResponse = await response.json();

        if (!response.ok) {
            throw new Error(payload.error || "Failed to create session");
        }

        localStorage.setItem(`hostToken:${payload.sessionId}`, payload.hostToken);
        bindSocketListeners();

        const currentSocket = getSocket();
        currentSocket.connect();

        const ack = await emitJoinSession(payload.sessionId, name, payload.hostToken);
        
        if (ack.error) {
            throw new Error(ack.error);
        }

        setCanvasElements(ack.elements ?? {});
        // if (Array.isArray(ack.elements)) {
        // }

        setSessionState(payload.sessionId, "host");
        return payload.sessionId;
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to start session";
        setSessionError(message);
        throw error;
    } finally {
        setSessionPending(false);
    }
}

export async function joinSession(sessionId: string, name: string) {
    setSessionError(null);
    setSessionPending(true);

    console.log("JOINING SESSION");

    try {
        const response = await fetch(`${getSyncServerUrl()}/api/sessions/${sessionId}`);

        if (!response.ok) {
            const payload: { error?: string } = await response.json().catch(() => ({}));
            throw new Error(payload.error || "Session not found or expired");
        }

        const payload = await response.json();
        // console.log(payload)
        storeLocalBoard(useCanvasElementsStore.getState().canvasElements);
        setCanvasElements(payload.session.elements ?? {});

        const hostToken = localStorage.getItem(`hostToken:${sessionId}`) || undefined;

        bindSocketListeners();

        const currentSocket = getSocket();
        currentSocket.connect();

        const ack = await emitJoinSession(sessionId, name, hostToken);

        if (ack.error) {
            throw new Error(ack.error);
        }

        // if (Array.isArray(ack.elements)) {
        //     setCanvasElements(ack.elements);
        // }

        setSessionState(sessionId, hostToken ? "host" : "guest");

        console.log("JOINED SESSION");
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to join session";
        setSessionError(message);
        throw error;
    } finally {
        setSessionPending(false);
    }
}

export async function endSession() {
    const { sessionId, sessionRole } = useSessionStore.getState();

    if (!sessionId || sessionRole !== "host") {
        return;
    }

    setSessionError(null);
    setSessionPending(true);

    try {
        const currentSocket = getSocket();

        await new Promise<void>((resolve, reject) => {
            currentSocket.emit(
                "end-session",
                { sessionId },
                (ack: { ok?: boolean; error?: string } = {}) => {
                    if (ack.error) {
                        reject(new Error(ack.error));
                        return;
                    }

                    resolve();
                }
            );
        });

        currentSocket.disconnect();
        restoreLocalBoard();
        localStorage.removeItem(`hostToken:${sessionId}`);
        clearSessionState();
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to end session";
        setSessionError(message);
        throw error;
    } finally {
        setSessionPending(false);
    }
}

export function leaveSession() {
    const { sessionId, sessionRole } = useSessionStore.getState();

    if (!sessionId || sessionRole !== "guest") {
        return;
    }

    setSessionError(null);
    const currentSocket = getSocket();
    currentSocket.disconnect();
    restoreLocalBoard();
    clearSessionState();
}