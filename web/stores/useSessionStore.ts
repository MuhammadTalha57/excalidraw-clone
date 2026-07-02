import { create } from "zustand";

export type SessionRole = "host" | "guest" | null;

type SessionStore = {
    isSessionDialogOpen: boolean;
    sessionId: string | null;
    sessionRole: SessionRole;
    sessionError: string | null;
    isSessionPending: boolean;

    openSessionDialog: () => void;
    closeSessionDialog: () => void;
    toggleSessionDialog: () => void;

    setSessionState: (sessionId: string, sessionRole: SessionRole) => void;
    setSessionError: (error: string | null) => void;
    setSessionPending: (isPending: boolean) => void;
    clearSessionState: () => void;
};

export const useSessionStore = create<SessionStore>((set) => ({
    isSessionDialogOpen: false,
    sessionId: null,
    sessionRole: null,
    sessionError: null,
    isSessionPending: false,

    openSessionDialog: () => set({ isSessionDialogOpen: true }),
    closeSessionDialog: () => set({ isSessionDialogOpen: false }),
    toggleSessionDialog: () =>
        set((state) => ({ isSessionDialogOpen: !state.isSessionDialogOpen })),

    setSessionState: (sessionId, sessionRole) =>
        set({ sessionId, sessionRole, sessionError: null }),
    setSessionError: (sessionError) => set({ sessionError }),
    setSessionPending: (isSessionPending) => set({ isSessionPending }),
    clearSessionState: () =>
        set({
            sessionId: null,
            sessionRole: null,
            sessionError: null,
            isSessionPending: false,
        }),
}));