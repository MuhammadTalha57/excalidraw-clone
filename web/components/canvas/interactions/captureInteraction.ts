import { getBoundingRectangle } from "@/utils/boundingRectangle";
import { PointerEvent } from "react";
import { usePreviewElementStore } from "@/stores/usePreviewElement";

let tool = "rectangle";
let x = 0;
let y = 0;
let pointerDown = false;

function onPointerDown(e: PointerEvent<HTMLCanvasElement>) {
    pointerDown = true;
    console.log(e.clientX, e.clientY);
    x = e.clientX;
    y = e.clientY;
}
function onPointerUp(e: PointerEvent<HTMLCanvasElement>) {
    pointerDown = false;
    console.log(x, y, e.clientX, e.clientY);
}

function onPointerMove(e: PointerEvent<HTMLCanvasElement>) {
    let currentX = e.clientX;
    let currentY = e.clientY;
    const setPreviewElement =
        usePreviewElementStore.getState().setPreviewElement;
    if (pointerDown) {
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
}

export default function pointerHandler() {
    return { onPointerDown, onPointerUp, onPointerMove };
}
