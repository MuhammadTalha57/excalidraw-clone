import { cancel as cancelSelect} from "@/lib/canvas/interactions/select";
import { cancel as cancelRectangle } from "@/lib/canvas/interactions/rectangle";
import { cancel as cancelDiamond } from "@/lib/canvas/interactions/diamond";
import { cancel as cancelEllipse } from "@/lib/canvas/interactions/ellipse";
import { cancel as cancelArrow } from "@/lib/canvas/interactions/arrow";
import { cancel as cancelLine } from "@/lib/canvas/interactions/line";
import { cancel as cancelEraser } from "@/lib/canvas/interactions/eraser";
import { cancel as cancelDraw } from "@/lib/canvas/interactions/draw";
import { Tool } from "@/lib/types";
// import {cancel} from "@/lib/canvas/interactions/arrow"
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
    "Escape": "select",
}

const closeMapping: Record<Tool, () => void> = {
    "select": cancelSelect,
    "rectangle": cancelRectangle,
    "diamond": cancelDiamond,
    "ellipse": cancelEllipse,
    "arrow": cancelArrow,
    "line": cancelLine,
    "draw": cancelDraw,
    "eraser": cancelEraser,
    "hand": () => {}
};

export default function handleKeyboardShortcut(key: string) {

    
    if(Object.keys(keyMapping).includes(key)) {
        // Cancel current tool ongoing interaction
        const currTool = useSelectedToolStore.getState().selectedTool;
        if(Object.keys(closeMapping).includes(currTool)) {
            closeMapping[currTool]();
        }
        

        useSelectedToolStore.getState().setSelectedTool(keyMapping[key]);
    }
}