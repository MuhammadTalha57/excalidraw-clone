import { screenToWorld } from "@/utils/coords";
import { handleArrow } from "./arrow";
import { handleDiamond } from "./diamond";
import { handleHandDrawn } from "./draw";
import { handleEllipse } from "./ellipse";
import { handleLine } from "./line";
import { handleRectangle } from "./rectangle";
import { useSelectedToolStore } from "@/stores/useSelectedTool";
import { PointerEvent, WheelEvent } from "react";
import { handleHand } from "./hand";
import { handleZoom } from "./zoom";
import { handleSelect } from "./select";
import { Point } from "@excalidraw/shared/types";
import { handleEraser } from "./eraser";

let handlers: Record<any, any> = {
    rectangle: handleRectangle,
    diamond: handleDiamond,
    ellipse: handleEllipse,
    arrow: handleArrow,
    line: handleLine,
    draw: handleHandDrawn,
    hand: handleHand,
    select: handleSelect,
    eraser: handleEraser,
};
let points: Point[] = [];
let pointerDown = false;

// Clears points on changing tool
useSelectedToolStore.subscribe((state) => {
    points = [];
    pointerDown = false; 
});

function onPointerDown(e: PointerEvent<HTMLCanvasElement>) {
    pointerDown = true;
    let coords = screenToWorld(e.clientX, e.clientY);
    points.push(coords);

    const tool = useSelectedToolStore.getState().selectedTool;
    handlers[tool](points, "DOWN", pointerDown);
}
function onPointerUp(e: PointerEvent<HTMLCanvasElement>) {
    pointerDown = false;
    const tool = useSelectedToolStore.getState().selectedTool;
    handlers[tool](points, "UP", pointerDown);
    // points = [];
}

function onPointerMove(e: PointerEvent<HTMLCanvasElement>) {
    // if (!pointerDown) return;
    let coords = screenToWorld(e.clientX, e.clientY);
    points.push(coords);

    const tool = useSelectedToolStore.getState().selectedTool;
    handlers[tool](points, "MOVE", pointerDown);
}

function onWheel(e: WheelEvent<HTMLCanvasElement>) {
    handleZoom(e);
}

export default function pointerHandler() {
    return { onPointerDown, onPointerUp, onPointerMove, onWheel };
}
