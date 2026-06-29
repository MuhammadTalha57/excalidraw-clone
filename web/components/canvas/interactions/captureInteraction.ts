import { screenToWorld } from "@/lib/coords";
import { handleArrow } from "./arrow";
import { handleDiamond } from "./diamond";
import { handleHandDrawn } from "./draw";
import { handleEllipse } from "./ellipse";
import { handleLine } from "./line";
import { handleRectangle } from "./rectangle";
import { useSelectedToolStore } from "@/stores/useSelectedTool";
import { PointerEvent, WheelEvent } from "react";
import { handleHand } from "./hand";
import { Pointer } from "lucide-react";
import { useCameraStore } from "@/stores/useCamera";
import { handleZoom } from "./zoom";
import { handleSelect } from "./select";


let handlers: Record<any, any> = {
    "rectangle": handleRectangle,
    "diamond": handleDiamond,
    "ellipse": handleEllipse,
    "arrow": handleArrow,
    "line": handleLine,
    "draw": handleHandDrawn,
    "hand": handleHand,
    "select": handleSelect
}
let points: Point[] = [];
let pointerDown = false;

function onPointerDown(e: PointerEvent<HTMLCanvasElement>) {
    pointerDown = true;
    let coords = screenToWorld(e.clientX, e.clientY);
    points.push(coords);

    const tool = useSelectedToolStore.getState().selectedTool;
    handlers[tool](points, "DOWN");

}
function onPointerUp(e: PointerEvent<HTMLCanvasElement>) {
    pointerDown = false;
     const tool = useSelectedToolStore.getState().selectedTool;
    handlers[tool](points, "UP");
    points = [];
}

function onPointerMove(e: PointerEvent<HTMLCanvasElement>) {
    console.log(points);
    if (!pointerDown) return;
    let coords = screenToWorld(e.clientX, e.clientY);
    points.push(coords);

    const tool = useSelectedToolStore.getState().selectedTool;
    handlers[tool](points, "MOVE");

 
}

function onWheel(e: WheelEvent<HTMLCanvasElement>) {
    if(!e.ctrlKey) return;

    handleZoom(e);
}

export default function pointerHandler() {
    return { onPointerDown, onPointerUp, onPointerMove, onWheel};
}
