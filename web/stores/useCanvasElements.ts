import { getSocket } from "@/lib/socket";
import { CanvasElement } from "@/lib/types";
import { create } from "zustand";

type CanvasElementsStore = {
  canvasElements: Map<string, CanvasElement>;

  addCanvasElement: (element: CanvasElement) => void;

  updateCanvasElement: (id: string, newElement: Partial<CanvasElement>) => void;

  setCanvasElements: (elements: Map<string, CanvasElement>) => void;
};

export const useCanvasElementsStore = create<CanvasElementsStore>((set) => ({
  canvasElements: new Map(),

  addCanvasElement: (element) =>
    set((state) => {
      let newElements = new Map(state.canvasElements);
      newElements.set(element.id, element);

      getSocket().emit("element-add", { element: element });
      return {
        canvasElements: newElements,
      };
    }),

  updateCanvasElement: (id, e) =>
    set((state) => {
      let newElements = new Map(state.canvasElements);
      const existing = state.canvasElements.get(id);
      const updated = {...existing, ...e} as CanvasElement;
      newElements.set(id ,updated);
      getSocket().emit("element-update", { id: id, element: e });

      return {
        canvasElements: newElements,
      };
    }),

  setCanvasElements: (elements) => {
    set((state) => ({
      canvasElements: elements,
    }));
  },
}));
