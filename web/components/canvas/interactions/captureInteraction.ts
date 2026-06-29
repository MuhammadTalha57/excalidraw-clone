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


let handlers: Record<any, any> = {
    "rectangle": handleRectangle,
    "diamond": handleDiamond,
    "ellipse": handleEllipse,
    "arrow": handleArrow,
    "line": handleLine,
    "draw": handleHandDrawn,
    "hand": handleHand,
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

    // if (tool === "hand") {
    //     // Panning
    //     let currentOffsetX = coords.x - currentX;
    //     let currentOffsetY = coords.y - currentY;
    //     const setOffsetX = useCameraStore.getState().setOffsetX;
    //     const setOffsetY = useCameraStore.getState().setOffsetY;

    //     setOffsetX(
    //         useCameraStore.getState().offsetX + currentOffsetX * PAN_SPEED,
    //     );
    //     setOffsetY(
    //         useCameraStore.getState().offsetY - currentOffsetY * PAN_SPEED,
    //     );
    //     console.log("PANNING");
    //     currentX = coords.x;
    //     currentY = coords.y;
    // } else if (
    //     ["draw", "rectangle", "diamond", "ellipse", "arrow", "line"].includes(
    //         tool,
    //     )
    // ) {
    //     currentX = coords.x;
    //     currentY = coords.y;
    //     const prev = usePreviewElementStore.getState().previewElement;
    //     const boundingRect = getBoundingRectangle(x, y, currentX, currentY);
    //     let points = prev?.points;
    //     points = prev?.points
    //         ? [...prev.points, { x: currentX, y: currentY }]
    //         : [
    //               { x: x, y: y },
    //               { x: currentX, y: currentY },
    //           ];
    //     const previewElement: CanvasElement = {
    //         id: "2",
    //         type: tool,
    //         strokeWidth: useShapeOptionsStore.getState().strokeWidth,
    //         strokeColor: useShapeOptionsStore.getState().strokeColor,
    //         fillColor: useShapeOptionsStore.getState().fillColor,
    //         x1: x,
    //         y1: y,
    //         x2: currentX,
    //         y2: currentY,
    //         x: boundingRect.x,
    //         y: boundingRect.y,
    //         width: boundingRect.width,
    //         height: boundingRect.height,
    //         points: tool === "draw" ? points : [],
    //     };
    //     setPreviewElement(previewElement);
    // }
}

function onWheel(e: WheelEvent<HTMLCanvasElement>) {
    if(!e.ctrlKey) return;

    handleZoom(e);
}

export default function pointerHandler() {
    return { onPointerDown, onPointerUp, onPointerMove, onWheel};
}
