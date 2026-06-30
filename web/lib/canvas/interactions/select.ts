import { useCanvasElementsStore } from "@/stores/useCanvasElements";
import { useSelectionBoxStore } from "@/stores/useSelectionBox";
import { getBoundingRectangle } from "@/utils/boundingRectangle";

const setSelectionBox = useSelectionBoxStore.getState().setSelectionBox;

export function handleSelect(points: Point[], e: "UP" | "DOWN" | "MOVE") {
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

  // Create a Selection box

  const boundingRect = getBoundingRectangle(
    points[0].x,
    points[0].y,
    points[points.length - 1].x,
    points[points.length - 1].y,
  );

  const selectionBox: Rectangle = {
    type: "rectangle",
    strokeWidth: 1,
    strokeColor: "#4C6FFF",
    fillColor: "rgba(76, 111, 255, 0.10)",

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

  markSelectedElements(selectionBox);

  // Set Selection Box
  setSelectionBox(selectionBox);
}

function onPointerUp(points: Point[]) {
  const selectionBox = useSelectionBoxStore.getState().selectionBox;
  if (selectionBox) {
    setSelectionBox(null);
  }
  points = [];
}

function markSelectedElements(selectionBox: Rectangle) {
  const canvasElements = useCanvasElementsStore.getState().canvasElements;

  for (const e of canvasElements) {
    if (
      selectionBox.top <= e.top &&
      selectionBox.bottom >= e.bottom &&
      selectionBox.left <= e.left &&
      selectionBox.right >= e.right
    ) {
      e.isSelected = true;
    } else e.isSelected = false;
  }
}
