import { HandDrawn, Point } from "@/lib/types";
import { useCanvasElementsStore } from "@/stores/useCanvasElements";
import { usePreviewElementStore } from "@/stores/usePreviewElement";
import { useShapeOptionsStore } from "@/stores/useShapeOptions";

const setPreviewElement = usePreviewElementStore.getState().setPreviewElement;

const addCanvasElement = useCanvasElementsStore.getState().addCanvasElement;

export function handleHandDrawn(points: Point[], e: "UP" | "DOWN" | "MOVE") {
  if (e === "UP") onPointerUp(points);
  else if (e === "MOVE") onPointerMove(points);
  else if (e === "DOWN") onPointerDown(points);
}

function onPointerDown(points: Point[]) {
  const bounds = points.reduce(
    (acc, p) => ({
      minX: Math.min(acc.minX, p.x),
      maxX: Math.max(acc.maxX, p.x),
      minY: Math.min(acc.minY, p.y),
      maxY: Math.max(acc.maxY, p.y),
    }),
    {
      minX: Infinity,
      maxX: -Infinity,
      minY: Infinity,
      maxY: -Infinity,
    },
  );

  const previewElement: HandDrawn = {
    type: "handdrawn",
    strokeWidth: useShapeOptionsStore.getState().strokeWidth,
    strokeColor: useShapeOptionsStore.getState().strokeColor,

    top: bounds.minY,
    bottom: bounds.maxY,
    left: bounds.minX,
    right: bounds.maxX,

    points: points,

    isSelected: false,
  };
  setPreviewElement(previewElement);
}

function onPointerMove(points: Point[]) {
  // Assuming Only calls when Pointer is down
  if (points.length < 2) return;

  // Create a Preview element for Line
  const bounds = points.reduce(
    (acc, p) => ({
      minX: Math.min(acc.minX, p.x),
      maxX: Math.max(acc.maxX, p.x),
      minY: Math.min(acc.minY, p.y),
      maxY: Math.max(acc.maxY, p.y),
    }),
    {
      minX: Infinity,
      maxX: -Infinity,
      minY: Infinity,
      maxY: -Infinity,
    },
  );

  const previewElement: HandDrawn = {
    type: "handdrawn",
    strokeWidth: useShapeOptionsStore.getState().strokeWidth,
    strokeColor: useShapeOptionsStore.getState().strokeColor,

    top: bounds.minY,
    bottom: bounds.maxY,
    left: bounds.minX,
    right: bounds.maxX,

    points: points,

    isSelected: false,
  };

  // Set Preview Element
  setPreviewElement(previewElement);
}

function onPointerUp(points: Point[]) {
  const previewElemet = usePreviewElementStore.getState().previewElement;
  if (previewElemet) {
    addCanvasElement(previewElemet);
    setPreviewElement(null);
  }
  points = [];
}
