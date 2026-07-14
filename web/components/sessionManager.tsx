"use client";

import { endSession, joinSession, leaveSession, startSession } from "@/lib/socket";
import { useCanvasElementsStore } from "@/stores/useCanvasElements";
import { useSessionStore } from "@/stores/useSessionStore";
import { ChevronDown, LogIn, Play, Square, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function SessionManager() {
    const [sessionInput, setSessionInput] = useState("");
    const panelRef = useRef<HTMLDivElement | null>(null);

    const canvasElements = useCanvasElementsStore((state) => state.canvasElements);
    const isOpen = useSessionStore((state) => state.isSessionDialogOpen);
    const sessionId = useSessionStore((state) => state.sessionId);
    const sessionRole = useSessionStore((state) => state.sessionRole);
    const sessionError = useSessionStore((state) => state.sessionError);
    const isPending = useSessionStore((state) => state.isSessionPending);
    const toggleSessionDialog = useSessionStore((state) => state.toggleSessionDialog);
    const closeSessionDialog = useSessionStore((state) => state.closeSessionDialog);
    const setSessionError = useSessionStore((state) => state.setSessionError);

    const isHost = sessionRole === "host";
    const isGuest = sessionRole === "guest";

    const startButtonLabel = isHost ? "End session" : "Start session";
    const joinButtonLabel = isGuest ? "Leave session" : "Join session";

    useEffect(() => {
        const handlePointerDown = (event: MouseEvent | TouchEvent) => {
            if (!isOpen) return;

            const target = event.target as Node | null;
            if (target && panelRef.current?.contains(target)) return;

            closeSessionDialog();
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                closeSessionDialog();
            }
        };

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [closeSessionDialog, isOpen]);

    const handleStartClick = async () => {
        setSessionError(null);

        if (isHost) {
            try {
                await endSession();
            } catch {
                // Error already stored in session state.
            }
            return;
        }

        if (isGuest) {
            setSessionError("Leave the current session before starting a new one.");
            return;
        }

        try {
            await startSession(canvasElements, "Host");
        } catch {
            // Error already stored in session state.
        }
    };

    const handleJoinClick = async () => {
        setSessionError(null);

        if (isGuest) {
            leaveSession();
            return;
        }

        if (isHost) {
            setSessionError("End the current session before joining another one.");
            return;
        }

        const trimmedSessionId = sessionInput.trim();
        if (!trimmedSessionId) {
            setSessionError("Enter a session ID first.");
            return;
        }

        try {
            await joinSession(trimmedSessionId, "Guest");
        } catch {
            // Error already stored in session state.
        }
    };

    return (
        <div ref={panelRef} className="pointer-events-auto relative flex justify-end">
            <div className="flex flex-col items-end gap-3">
                <button
                    type="button"
                    onClick={toggleSessionDialog}
                    aria-expanded={isOpen}
                    className="group inline-flex items-center gap-2 rounded-full border border-[#d5cec2]  px-4 py-2 text-sm font-medium text-[#1f1b16] shadow-[0_16px_40px_rgba(15,23,42,0.16)] backdrop-blur transition-all hover:-translate-y-px hover:bg-white/95 hover:shadow-[0_18px_44px_rgba(15,23,42,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c77a1f]/35"
                >
                    <Users className="h-4 w-4 text-[#8b735b] transition-transform group-hover:scale-105" />
                    <span>Session</span>
                    <ChevronDown
                        className={`h-4 w-4 text-[#8b735b] transition-transform duration-200 ${
                            isOpen ? "rotate-180" : ""
                        }`}
                    />
                </button>

                {isOpen ? (
                    <div className="w-[min(92vw,22rem)] rounded-3xl border border-[#ddd5c7]  p-4 shadow-[0_24px_60px_rgba(15,23,42,0.18)] backdrop-blur sm:w-88">
                        <div className="mb-4 flex items-start justify-between gap-3">
                            <div>
                                <h2 className="text-sm font-semibold text-[#1f1b16]">
                                    Session management
                                </h2>
                                <p className="mt-1 text-xs leading-5 text-[#6d6254]">
                                    Create a shared board or join an existing session.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <section className="rounded-2xl border border-[#e7dfd2] bg-white/80 p-3">
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <div>
                                        <h3 className="text-sm font-medium text-[#1f1b16]">
                                            Start Session
                                        </h3>
                                        <p className="text-xs text-[#7a6f60]">
                                            Create a new session and share the ID.
                                        </p>
                                    </div>
                                    <Play className="h-4 w-4 text-[#8b735b]" />
                                </div>

                                <button
                                    type="button"
                                    onClick={handleStartClick}
                                    disabled={isPending}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1f1b16] px-4 py-2.5 text-sm font-medium text-[#f7f2ea] transition-all hover:-translate-y-px hover:bg-[#2a241d] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isHost ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                    <span>{isHost ? "End session" : "Start session"}</span>
                                </button>

                                <label className="mt-3 block text-xs font-medium uppercase tracking-[0.16em] text-[#867865]">
                                    Session ID
                                </label>
                                <input
                                    type="text"
                                    readOnly
                                    value={sessionId || ""}
                                    placeholder="No active session"
                                    className="mt-1 w-full rounded-2xl border border-[#e2d8c7]  px-3 py-2 text-sm text-[#342d24] outline-none placeholder:text-[#a49786]"
                                />
                            </section>

                            <section className="rounded-2xl border border-[#e7dfd2] p-3">
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <div>
                                        <h3 className="text-sm font-medium text-[#1f1b16]">
                                            Join Session
                                        </h3>
                                        <p className="text-xs text-[#7a6f60]">
                                            Enter a session ID to connect.
                                        </p>
                                    </div>
                                    <LogIn className="h-4 w-4 text-[#8b735b]" />
                                </div>

                                <label className="block text-xs font-medium uppercase tracking-[0.16em] text-[#867865]">
                                    Session ID
                                </label>
                                <input
                                    type="text"
                                    value={sessionInput}
                                    onChange={(event) => setSessionInput(event.target.value)}
                                    placeholder="Paste session ID"
                                    className="mt-1 w-full rounded-2xl border border-[#e2d8c7]  px-3 py-2 text-sm text-[#342d24] outline-none placeholder:text-[#a49786] focus:border-[#c77a1f]/40 focus:ring-2 focus:ring-[#c77a1f]/15"
                                />

                                <button
                                    type="button"
                                    onClick={handleJoinClick}
                                    disabled={isPending}
                                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#d5cec2]  px-4 py-2.5 text-sm font-medium text-[#1f1b16] transition-all hover:-translate-y-px hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isGuest ? (
                                        <Square className="h-4 w-4" />
                                    ) : (
                                        <LogIn className="h-4 w-4" />
                                    )}
                                    <span>{joinButtonLabel}</span>
                                </button>

                                {sessionError ? (
                                    <p className="mt-2 text-xs leading-5 text-[#b42318]">
                                        {sessionError}
                                    </p>
                                ) : null}
                            </section>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}