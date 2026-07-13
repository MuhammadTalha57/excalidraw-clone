import { Point } from "@/lib/types";
import { useCanvasElementsStore } from "@/stores/useCanvasElements";
import { useErasingElementsStore } from "@/stores/useErasingElements";
import { hitTestEraser } from "@/lib/canvas/eraserHitTest";

export function handleEraser(points: Point[], e: "UP" | "DOWN" | "MOVE") {
  if (e === "UP") onPointerUp(points);
  else if (e === "MOVE") onPointerMove(points);
  else if (e === "DOWN") onPointerDown(points);
}

function onPointerDown(points: Point[]) {
  if (points.length === 0) return;
  eraseAtPoint(points[points.length - 1]);
}

function onPointerMove(points: Point[]) {
  if (points.length === 0) return;
  eraseAtPoint(points[points.length - 1]);
}

function onPointerUp(points: Point[]) {
  const { erasingIds, clearErasingIds } = useErasingElementsStore.getState();

  if (erasingIds.size > 0) {
    useCanvasElementsStore.getState().deleteCanvasElements(Array.from(erasingIds));
  }

  clearErasingIds();
  points = [];
}

function eraseAtPoint(point: Point) {
  const canvasElements = useCanvasElementsStore.getState().canvasElements;
  const addErasingId = useErasingElementsStore.getState().addErasingId;

  for (const element of Object.values(canvasElements)) {
    if (hitTestEraser(point, element)) {
      addErasingId(element.id);
    }
  }
}
