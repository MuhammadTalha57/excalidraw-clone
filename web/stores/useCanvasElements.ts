import { CanvasElement } from "@/lib/types";
import { create } from "zustand";

type CanvasElementsStore = {
  canvasElements: CanvasElement[];

  addCanvasElement: (element: CanvasElement) => void;

  updateCanvasElement: (index: number, newElement: CanvasElement) => void;
};

export const useCanvasElementsStore = create<CanvasElementsStore>((set) => ({
  canvasElements: [],

  addCanvasElement: (element) =>
    set((state) => ({
      canvasElements: [...state.canvasElements, element],
    })),

  updateCanvasElement: (ind, e) =>
    set((state) => ({
      canvasElements: state.canvasElements.map((item, index) =>
        index === ind ? e : item,
      ),
    })),
}));
