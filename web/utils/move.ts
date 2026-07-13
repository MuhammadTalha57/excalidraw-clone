import { CanvasElement } from "@excalidraw/shared/types";

export function moveElement(original: CanvasElement, dx: number, dy: number): CanvasElement {
  if (original.type === "line" || original.type === "arrow") {
    return {
      ...original,
      p1: { x: original.p1.x + dx, y: original.p1.y + dy },
      p2: { x: original.p2.x + dx, y: original.p2.y + dy },
      top: original.top + dy, bottom: original.bottom + dy,
      left: original.left + dx, right: original.right + dx,
    };
  }
  if (original.type === "handdrawn") {
    return {
      ...original,
      points: original.points.map(p => ({ x: p.x + dx, y: p.y + dy })),
      top: original.top + dy, bottom: original.bottom + dy,
      left: original.left + dx, right: original.right + dx,
    };
  }
  // rectangle | diamond | ellipse
  return {
    ...original,
    x: original.x + dx, y: original.y + dy,
    top: original.top + dy, bottom: original.bottom + dy,
    left: original.left + dx, right: original.right + dx,
  };
}