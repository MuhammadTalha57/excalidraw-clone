import { Tool } from "@/lib/types";
import { useSelectedToolStore } from "@/stores/useSelectedTool";

const keyMapping: Record<string, Tool> = {
    "1": "select",
    "2": "rectangle",
    "3": "diamond",
    "4": "ellipse",
    "5": "arrow",
    "6": "line",
    "7": "draw",
    "0": "eraser",
}

export default function handleKeyboardShortcut(key: string) {

    if(Object.keys(keyMapping).includes(key)) {
        useSelectedToolStore.getState().setSelectedTool(keyMapping[key]);
    }
}