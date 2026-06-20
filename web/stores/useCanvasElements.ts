import { create } from "zustand";

type CanvasElementsStore = {
    canvasElements: CanvasElement[];

    addCanvasElement: (element: CanvasElement) => void;
};

export const useCanvasElementsStore = create<CanvasElementsStore>((set) => ({
    canvasElements: [],

    addCanvasElement: (element) =>
        set((state) => ({
            canvasElements: [...state.canvasElements, element],
        })),
}));
