import { useCanvasElementsStore } from "@/stores/useCanvasElements";
import { usePreviewElementStore } from "@/stores/usePreviewElement";
import { useShapeOptionsStore } from "@/stores/useShapeOptions";

const setPreviewElement = usePreviewElementStore.getState().setPreviewElement;

const addCanvasElement = useCanvasElementsStore.getState().addCanvasElement;

export function handleLine(points: Point[], e: "UP" | "DOWN" | "MOVE") {
  if (e === "UP") onPointerUp(points);
  else if (e === "MOVE") onPointerMove(points);
  else if (e === "DOWN") onPointerDown(points);
}

function onPointerDown(points: Point[]) {
  // Nothing
}

function onPointerMove(points: Point[]) {
  // Assuming Only calls when Pointer is down
  if (points.length < 2) return;

  // Create a Preview element for Line 

  const previewElement: Line = {
    type: "line",
    strokeWidth: useShapeOptionsStore.getState().strokeWidth,
    strokeColor: useShapeOptionsStore.getState().strokeColor,

    top: Math.min(points[0].y, points[points.length - 1].y),
    bottom: Math.max(points[0].y, points[points.length - 1].y),
    right: Math.min(points[0].x, points[points.length - 1].x),
    left: Math.max(points[0].x, points[points.length - 1].x),

    p1: points[0],
    p2: points[points.length - 1],

    isSelected: false,
  };


  // Set Preview Element
  setPreviewElement(previewElement);
}

function onPointerUp(points: Point[]) {
    const previewElemet = usePreviewElementStore.getState().previewElement;
    if(previewElemet) {
        addCanvasElement(previewElemet);
        setPreviewElement(null);
    }
    points = [];
}
