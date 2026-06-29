import { create } from "zustand";

type SelectionBoxStore = {
    selectionBox: Rectangle | null;

    setSelectionBox: (element: Rectangle | null) => void;

    clearSelectionBox: () => void;
};

export const useSelectionBoxStore = create<SelectionBoxStore>((set) => ({
    selectionBox: null,

    setSelectionBox: (element) => set({ selectionBox: element }),

    clearSelectionBox: () => set({ selectionBox: null }),
}));
