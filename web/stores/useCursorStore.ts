import { create } from "zustand";
import { HandleName } from "@/lib/types";

type DragMode = "none" | "move" | "resize";

type CursorStore = {
    dragMode: DragMode;
    dragHandle: HandleName | null;
    hoverHandle: HandleName | null;
    hoverBody: boolean;

    setDragState: (mode: DragMode, handle: HandleName | null) => void;
    setHoverState: (handle: HandleName | null, body: boolean) => void;
    clearHoverState: () => void;
};

export const useCursorStore = create<CursorStore>((set) => ({
    dragMode: "none",
    dragHandle: null,
    hoverHandle: null,
    hoverBody: false,

    setDragState: (dragMode, dragHandle) => set({ dragMode, dragHandle }),
    setHoverState: (hoverHandle, hoverBody) => set({ hoverHandle, hoverBody }),
    clearHoverState: () => set({ hoverHandle: null, hoverBody: false }),
}));