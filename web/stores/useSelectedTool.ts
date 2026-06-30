import { Tool } from "@/lib/types";
import { create } from "zustand";

type SelectedToolStore = {
    selectedTool: Tool;

    setSelectedTool: (tool: Tool) => void;
};

export const useSelectedToolStore = create<SelectedToolStore>((set) => ({
    selectedTool: "select",

    setSelectedTool: (tool) => set({ selectedTool: tool }),
}));
