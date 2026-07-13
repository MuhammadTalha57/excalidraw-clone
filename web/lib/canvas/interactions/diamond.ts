import { generateId } from "@/lib/id";
import { Diamond, Point } from "@/lib/types";
import { useCanvasElementsStore } from "@/stores/useCanvasElements";
import { usePreviewElementStore } from "@/stores/usePreviewElement";
import { useShapeOptionsStore } from "@/stores/useShapeOptions";
import { getBoundingRectangle } from "@/utils/boundingRectangle";

const setPreviewElement = usePreviewElementStore.getState().setPreviewElement;

const addCanvasElement = useCanvasElementsStore.getState().addCanvasElement;

export function handleDiamond(points: Point[], e: "UP" | "DOWN" | "MOVE", pointerDown: boolean) {
  if (e === "UP") onPointerUp(points);
  else if (e === "MOVE" && pointerDown) onPointerMove(points);
  else if (e === "DOWN") onPointerDown(points);
}

let selectedP1 : Point | null = null;

function onPointerDown(points: Point[]) {
  selectedP1 = points[points.length - 1];
  points.length = 0;
  points.push(selectedP1);
}

function onPointerMove(points: Point[]) {
  // Assuming Only calls when Pointer is down
  if(!selectedP1) return;

  // Create a Preview element for diamond.

  const boundingRect = getBoundingRectangle(
    selectedP1.x,
    selectedP1.y,
    points[points.length - 1].x,
    points[points.length - 1].y,
  );

  const previewElement: Diamond = {
    id: generateId(),
    type: "diamond",
    strokeWidth: useShapeOptionsStore.getState().strokeWidth,
    strokeColor: useShapeOptionsStore.getState().strokeColor,
    fillColor: useShapeOptionsStore.getState().fillColor,

    top: boundingRect.y,
    bottom: boundingRect.y + boundingRect.height,
    right: boundingRect.x + boundingRect.width,
    left: boundingRect.x,

    x: boundingRect.x,
    y: boundingRect.y,
    width: boundingRect.width,
    height: boundingRect.height,

    isSelected: false,
  };


  // Set Preview Elements
  setPreviewElement(previewElement);
}

function onPointerUp(points: Point[]) {
    const previewElemet = usePreviewElementStore.getState().previewElement;
    if(previewElemet) {
        addCanvasElement(previewElemet);
        setPreviewElement(null);
    }
    points.length = 0;
    selectedP1 = null;
}
