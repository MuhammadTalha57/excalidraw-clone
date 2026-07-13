import { generateId } from "@/lib/id";
import { Line, Point } from "@excalidraw/shared/types";
import { useCanvasElementsStore } from "@/stores/useCanvasElements";
import { usePreviewElementStore } from "@/stores/usePreviewElement";
import { useShapeOptionsStore } from "@/stores/useShapeOptions";

const setPreviewElement = usePreviewElementStore.getState().setPreviewElement;

const addCanvasElement = useCanvasElementsStore.getState().addCanvasElement;

export function handleLine(points: Point[], e: "UP" | "DOWN" | "MOVE", pointerDown: boolean) {
    if (e === "UP") onPointerUp(points);
    else if (e === "MOVE") onPointerMove(points);
    else if (e === "DOWN") onPointerDown(points);
}

let selectedP1: Point | null = null;

function onPointerDown(points: Point[]) {
    // Draw Line if starting point is selected.
    if (selectedP1) {
        const previewElemet = usePreviewElementStore.getState().previewElement;
        if (previewElemet) {
            addCanvasElement(previewElemet);
            setPreviewElement(null);
        }
        points.length = 0;
        selectedP1 = null;
    } else if (points.length >= 1) {
        selectedP1 = points[points.length - 1];
        points.length = 0;
        points.push(selectedP1);
    }
}

function onPointerMove(points: Point[]) {
    // Assuming Only calls when Pointer is down
    if (!selectedP1) return;

    // Create a Preview element for Line

    const previewElement: Line = {
        id: generateId(),
        type: "line",
        strokeWidth: useShapeOptionsStore.getState().strokeWidth,
        strokeColor: useShapeOptionsStore.getState().strokeColor,

        top: Math.min(points[0].y, points[points.length - 1].y),
        bottom: Math.max(points[0].y, points[points.length - 1].y),
        right: Math.max(points[0].x, points[points.length - 1].x),
        left: Math.min(points[0].x, points[points.length - 1].x),

        p1: points[0],
        p2: points[points.length - 1],

        isSelected: false,
    };

    // Set Preview Element
    setPreviewElement(previewElement);
}

function onPointerUp(points: Point[]) {
    // Do Nothing
}

export function cancel() {
    // Cancel ongoing interaction
    setPreviewElement(null);
    selectedP1 = null;
}