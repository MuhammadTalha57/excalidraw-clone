import { getSocket } from "@/lib/socket";
import { CanvasElement } from "@/lib/types";
import { create } from "zustand";

type CanvasElementsStore = {
    canvasElements: Record<string, CanvasElement>;

    addCanvasElement: (element: CanvasElement, broadcast?: boolean) => void;

    updateCanvasElement: (
        id: string,
        patch: Partial<CanvasElement>,
        broadcast?: boolean,
    ) => void;

    setCanvasElements: (elements: Record<string, CanvasElement>) => void;
};

export const useCanvasElementsStore = create<CanvasElementsStore>((set) => ({
    canvasElements: {},

    addCanvasElement: (element, broadcast = true) =>
        set((state) => {
            let newElements = { ...state.canvasElements };
            newElements[element.id] = element;
            if (broadcast)
                getSocket().emit("element-add", { element: element });
            return {
                canvasElements: newElements,
            };
        }),

    updateCanvasElement: (id, patch, broadcast = true) =>
        set((state) => {
          console.log("UPDATING ELEMENT");
            let newElements = { ...state.canvasElements };
            const existing = state.canvasElements[id];
            const updated = { ...existing, ...patch } as CanvasElement;
            newElements[id] = updated;
            if (broadcast) {
              console.log("BROADCASTING ELEMENT UPDATE");
                getSocket().emit("element-update", { id: id, patch: patch, senderId: getSocket().id });
            }

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
