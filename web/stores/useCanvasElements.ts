import { getSocket } from "@/lib/socket";
import { CanvasElement } from "@/lib/types";
import { create } from "zustand";

type CanvasElementsStore = {
  canvasElements: CanvasElement[];

  addCanvasElement: (element: CanvasElement) => void;

  updateCanvasElement: (index: number, newElement: CanvasElement) => void;

  setCanvasElements: (elements: CanvasElement[]) => void;
};

export const useCanvasElementsStore = create<CanvasElementsStore>((set) => ({
  canvasElements: [],

  addCanvasElement: (element) =>
    set((state) => {
      const nextElements = [...state.canvasElements, element];
      getSocket().emit("element-add", { element: element });
      return {
        canvasElements: nextElements,
      };
    }),

  updateCanvasElement: (ind, e) =>
    set((state) => {
      const nextElements = state.canvasElements.map((item, index) =>
        index === ind ? e : item,
      );
      getSocket().emit("element-update", { elements: nextElements });

      return {
        canvasElements: state.canvasElements.map((item, index) =>
          index === ind ? e : item,
        ),
      };
    }),

  setCanvasElements: (elements) => {
    set((state) => ({
      canvasElements: elements,
    }));
  },
}));
