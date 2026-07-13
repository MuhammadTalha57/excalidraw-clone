import { generateId } from "@/lib/id";
import { Arrow, Point } from "@/lib/types";
import { useCanvasElementsStore } from "@/stores/useCanvasElements";
import { usePreviewElementStore } from "@/stores/usePreviewElement";
import { useSelectedElementsOverlayStore } from "@/stores/useSelectedElementsBox";
import { useShapeOptionsStore } from "@/stores/useShapeOptions";

const setPreviewElement = usePreviewElementStore.getState().setPreviewElement;

const addCanvasElement = useCanvasElementsStore.getState().addCanvasElement;

export function handleArrow(points: Point[], e: "UP" | "DOWN" | "MOVE", pointerDown: boolean) {
    if (e === "UP") onPointerUp(points);
    else if (e === "MOVE") onPointerMove(points);
    else if (e === "DOWN") onPointerDown(points);
}

let selectedP1: Point | null  = null;

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
    } else if(points.length >= 1) {
      selectedP1 = points[points.length - 1];
      points.length = 0;
      points.push(selectedP1);
    }
}

function onPointerMove(points: Point[]) {
    if (!selectedP1) return;

    // Create a Preview element for Arrow

    const previewElement: Arrow = {
        id: generateId(),
        type: "arrow",
        strokeWidth: useShapeOptionsStore.getState().strokeWidth,
        strokeColor: useShapeOptionsStore.getState().strokeColor,

        top: Math.min(points[0].y, points[points.length - 1].y),
        bottom: Math.max(points[0].y, points[points.length - 1].y),
        right: Math.max(points[0].x, points[points.length - 1].x),
        left: Math.min(points[0].x, points[points.length - 1].x),

        p1: selectedP1,
        p2: points[points.length - 1],

        isSelected: false,
    };

    // Set Preview Element
    setPreviewElement(previewElement);
}

function onPointerUp(points: Point[]) {
  // Do Nothing
}
