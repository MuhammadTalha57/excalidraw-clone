import { Tool } from "@/lib/types";
import { create } from "zustand";
import { useSelectedElementsOverlayStore } from "./useSelectedElementsBox";

type SelectedToolStore = {
  selectedTool: Tool;

  setSelectedTool: (tool: Tool) => void;
};

export const useSelectedToolStore = create<SelectedToolStore>((set) => ({
  selectedTool: "select",

  setSelectedTool: (tool) => {
    useSelectedElementsOverlayStore.getState().clearSelectedElementsOverlay();
    return set({ selectedTool: tool });
  },
}));
