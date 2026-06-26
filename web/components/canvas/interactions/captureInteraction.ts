import { getBoundingRectangle } from "@/utils/boundingRectangle";
import { PointerEvent } from "react";
import { usePreviewElementStore } from "@/stores/usePreviewElement";
import { useSelectedToolStore } from "@/stores/useSelectedTool";
import { useCanvasElementsStore } from "@/stores/useCanvasElements";
import { useShapeOptionsStore } from "@/stores/useShapeOptions";

const setPreviewElement = usePreviewElementStore.getState().setPreviewElement;

const addCanvasElement = useCanvasElementsStore.getState().addCanvasElement;

let x = 0;
let y = 0;
let pointerDown = false;
let points = [];

function onPointerDown(e: PointerEvent<HTMLCanvasElement>) {
    pointerDown = true;
    x = e.clientX;
    y = e.clientY;
}
function onPointerUp(e: PointerEvent<HTMLCanvasElement>) {
    const previewElement = usePreviewElementStore.getState().previewElement;
    pointerDown = false;
    if (previewElement) {
        // Create new Canvas Element
        addCanvasElement(previewElement);
        setPreviewElement(null);
    }
    points = [];
}

function onPointerMove(e: PointerEvent<HTMLCanvasElement>) {
    if (!pointerDown) return;
    let currentX = e.clientX;
    let currentY = e.clientY;

    const boundingRect = getBoundingRectangle(x, y, currentX, currentY);
    console.log("MOVE: ", currentX, currentY, boundingRect.x, boundingRect.y);

    const prev = usePreviewElementStore.getState().previewElement;
    const tool = useSelectedToolStore.getState().selectedTool;

    let points = prev?.points;
    if (tool === "draw") {
        points = prev?.points
            ? [...prev.points, { x: currentX, y: currentY }]
            : [
                  { x: x, y: y },
                  { x: currentX, y: currentY },
              ];
    }

    const previewElement: CanvasElement = {
        id: "2",
        type: "none",
        strokeWidth: useShapeOptionsStore.getState().strokeWidth,
        strokeColor: useShapeOptionsStore.getState().strokeColor,
        fillColor: useShapeOptionsStore.getState().fillColor,
        x1: x,
        y1: y,
        x2: currentX,
        y2: currentY,
        x: boundingRect.x,
        y: boundingRect.y,
        width: boundingRect.width,
        height: boundingRect.height,
        points: tool === "draw" ? points : [],
    };

    // previewElement.x2 = currentX;
    // previewElement.y2 = currentY;
    // previewElement.x = boundingRect.x;
    // previewElement.y = boundingRect.y;
    // previewElement.width = boundingRect.width;
    // previewElement.height = boundingRect.height;

    console.log(tool);
    if (tool === "rectangle") {
        previewElement.type = "rectangle";
    } else if (tool === "diamond") {
        previewElement.type = "diamond";
    } else if (tool === "ellipse") {
        previewElement.type = "ellipse";
    } else if (tool === "arrow") {
        previewElement.type = "arrow";
    } else if (tool === "line") {
        previewElement.type = "line";
    } else if (tool === "draw") {
        previewElement.type = "draw";
    }

    setPreviewElement(previewElement);
}

export default function pointerHandler() {
    return { onPointerDown, onPointerUp, onPointerMove };
}
