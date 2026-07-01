import { Line, Rectangle } from "@/lib/types";
import { create } from "zustand";

type SelectedElementsOverlayStore = {
    selectedElementsOverlay: Rectangle | Line | null;

    setSelectedElementsOverlay: (element: Rectangle | Line | null) => void;

    clearSelectedElementsOverlay: () => void;
};

export const useSelectedElementsOverlayStore = create<SelectedElementsOverlayStore>((set) => ({
    selectedElementsOverlay: null,

    setSelectedElementsOverlay: (element) => set({ selectedElementsOverlay: element }),

    clearSelectedElementsOverlay: () => set({ selectedElementsOverlay: null }),
}));
