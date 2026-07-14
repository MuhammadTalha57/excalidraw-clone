import { create } from "zustand";

export type RemoteCursor = {
    socketId: string;
    name: string;
    x: number;
    y: number;
    color: string;
};

type RemoteCursorsStore = {
    cursors: Record<string, RemoteCursor>;
    setCursor: (socketId: string, cursor: RemoteCursor) => void;
    removeCursor: (socketId: string) => void;
    clearCursors: () => void;
};

export const useRemoteCursorStore = create<RemoteCursorsStore>((set) => ({
    cursors: {},

    setCursor: (socketId, cursor) =>
        set((state) => ({
            cursors: { ...state.cursors, [socketId]: cursor },
        })),

    removeCursor: (socketId) =>
        set((state) => {
            const next = { ...state.cursors };
            delete next[socketId];
            return { cursors: next };
        }),

    clearCursors: () => set({ cursors: {} }),
}));