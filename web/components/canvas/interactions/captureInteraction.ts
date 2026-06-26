import { getBoundingRectangle } from "@/utils/boundingRectangle";
import { PointerEvent } from "react";
import { usePreviewElementStore } from "@/stores/usePreviewElement";
import { useSelectedToolStore } from "@/stores/useSelectedTool";
import { useCanvasElementsStore } from "@/stores/useCanvasElements";
import { useShapeOptionsStore } from "@/stores/useShapeOptions";
import { useCameraStore } from "@/stores/useCamera";
import { screenToWorld } from "@/lib/coords";

const setPreviewElement = usePreviewElementStore.getState().setPreviewElement;

const addCanvasElement = useCanvasElementsStore.getState().addCanvasElement;

const PAN_SPEED = 1;

let x = 0;
let y = 0;
let currentX = 0,
    currentY = 0;
let pointerDown = false;
let points = [];

function onPointerDown(e: PointerEvent<HTMLCanvasElement>) {
    pointerDown = true;
    let coords = screenToWorld(e.clientX, e.clientY);
    x = coords.x;
    y = coords.y;
    currentX = x;
    currentY = y;
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
    let coords = screenToWorld(e.clientX, e.clientY);
    // currentX = coords.x;
    // currentY = coords.y;

    const tool = useSelectedToolStore.getState().selectedTool;

    if (tool === "hand") {
        // Panning
        let currentOffsetX = coords.x - currentX;
        let currentOffsetY = coords.y - currentY;
        const setOffsetX = useCameraStore.getState().setOffsetX;
        const setOffsetY = useCameraStore.getState().setOffsetY;

        setOffsetX(
            useCameraStore.getState().offsetX + currentOffsetX * PAN_SPEED,
        );
        setOffsetY(
            useCameraStore.getState().offsetY - currentOffsetY * PAN_SPEED,
        );
        console.log("PANNING");
        currentX = coords.x;
        currentY = coords.y;
    } else if (
        ["draw", "rectangle", "diamond", "ellipse", "arrow", "line"].includes(
            tool,
        )
    ) {
        currentX = coords.x;
        currentY = coords.y;
        const prev = usePreviewElementStore.getState().previewElement;
        const boundingRect = getBoundingRectangle(x, y, currentX, currentY);
        let points = prev?.points;
        points = prev?.points
            ? [...prev.points, { x: currentX, y: currentY }]
            : [
                  { x: x, y: y },
                  { x: currentX, y: currentY },
              ];
        const previewElement: CanvasElement = {
            id: "2",
            type: tool,
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
        setPreviewElement(previewElement);
    }
}

export default function pointerHandler() {
    return { onPointerDown, onPointerUp, onPointerMove };
}
