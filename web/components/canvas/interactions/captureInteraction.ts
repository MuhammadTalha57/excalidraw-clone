import { getBoundingRectangle } from "@/utils/boundingRectangle";
import { PointerEvent } from "react";
import { usePreviewElementStore } from "@/stores/usePreviewElement";
import { useSelectedToolStore } from "@/stores/useSelectedTool";
import { useCanvasElementsStore } from "@/stores/useCanvasElements";

let x = 0;
let y = 0;
let pointerDown = false;

function onPointerDown(e: PointerEvent<HTMLCanvasElement>) {
    pointerDown = true;
    x = e.clientX;
    y = e.clientY;
}
function onPointerUp(e: PointerEvent<HTMLCanvasElement>) {
    pointerDown = false;
    const previewElement = usePreviewElementStore.getState().previewElement;
    const setPreviewElement =
        usePreviewElementStore.getState().setPreviewElement;
    if (previewElement) {
        // Create new Canvas Element
        const addCanvasElement =
            useCanvasElementsStore.getState().addCanvasElement;
        addCanvasElement(previewElement);
        setPreviewElement(null);
    }
}

function onPointerMove(e: PointerEvent<HTMLCanvasElement>) {
    if (!pointerDown) return;
    let currentX = e.clientX;
    let currentY = e.clientY;
    let tool = useSelectedToolStore.getState().selectedTool;
    const setPreviewElement =
        usePreviewElementStore.getState().setPreviewElement;
    const boundingRect = getBoundingRectangle(x, y, currentX, currentY);
    const previewElement: CanvasElement = {
        id: "2",
        type: "rectangle",
        strokeColor: "#000000",
        fillColor: "#000000",
        x: boundingRect.x,
        y: boundingRect.y,
        width: boundingRect.width,
        height: boundingRect.height,
    };
    if (tool === "rectangle") {
        // Drawing Rectangle
        setPreviewElement(previewElement);
    }
}

export default function pointerHandler() {
    return { onPointerDown, onPointerUp, onPointerMove };
}
