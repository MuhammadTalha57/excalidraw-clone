import { getBoundingRectangle } from "@/utils/boundingRectangle";
import { PointerEvent } from "react";
import { usePreviewElementStore } from "@/stores/usePreviewElement";
import { useSelectedToolStore } from "@/stores/useSelectedTool";
import { useCanvasElementsStore } from "@/stores/useCanvasElements";

const setPreviewElement = usePreviewElementStore.getState().setPreviewElement;

const addCanvasElement = useCanvasElementsStore.getState().addCanvasElement;

let x = 0;
let y = 0;
let pointerDown = false;

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
}

function onPointerMove(e: PointerEvent<HTMLCanvasElement>) {
    if (!pointerDown) return;
    let currentX = e.clientX;
    let currentY = e.clientY;

    const boundingRect = getBoundingRectangle(x, y, currentX, currentY);
    console.log("MOVE: ", currentX, currentY, boundingRect.x, boundingRect.y);
    const previewElement: CanvasElement = {
        id: "2",
        type: "none",
        strokeColor: "#000000",
        fillColor: "#000000",
        x1: x,
        y1: y,
        x2: currentX,
        y2: currentY,
        x: boundingRect.x,
        y: boundingRect.y,
        width: boundingRect.width,
        height: boundingRect.height,
    };

    const tool = useSelectedToolStore.getState().selectedTool;
    console.log(tool);
    if (tool === "rectangle") {
        // Drawing Rectangle
        previewElement.type = "rectangle";
    } else if (tool === "diamond") {
        // Drawing Diamond
        previewElement.type = "diamond";
    } else if (tool === "ellipse") {
        previewElement.type = "ellipse";
    } else if (tool === "arrow") {
        previewElement.type = "arrow";
    } else if (tool === "line") {
        previewElement.type = "line";
    }
    setPreviewElement(previewElement);
}

export default function pointerHandler() {
    return { onPointerDown, onPointerUp, onPointerMove };
}
