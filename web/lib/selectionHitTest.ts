// hitTest.ts
import { useSelectedElementsOverlayStore } from "@/stores/useSelectedElementsBox";
import { SelectionHitTarget, HandleName, Point, CanvasElement, Rectangle, Line, } from "./types";

const HANDLE_HIT_RADIUS = 8;

export function hitTest(
  point: Point,
  selectedElements: CanvasElement[],
): SelectionHitTarget {
  const el = useSelectedElementsOverlayStore.getState().selectedElementsOverlay;
  if(el === null) return {type: "none"};

  // Check handles first — they're small and take priority over body
  const handle = hitTestHandles(point, el);
  if (handle) return { type: "handle", handle, element: el };

  // Then check bodies (so clicking inside a shape starts a move)
  if (isInsideBounds(point, el)) return { type: "body", element: el };

  return { type: "none" };
}

function hitTestHandles(point: Point, el: Rectangle | Line): HandleName | null {
  if (el.type === "line") {
    if (dist(point, el.p1) <= HANDLE_HIT_RADIUS) return "p1";
    if (dist(point, el.p2) <= HANDLE_HIT_RADIUS) return "p2";
    return null;
  }

  const handles = getBoxHandlePositions(el.left, el.top, el.right, el.bottom);
  for (const [name, pos] of Object.entries(handles) as [HandleName, Point][]) {
    if (dist(point, pos) <= HANDLE_HIT_RADIUS) return name;
  }
  return null;
}

function isInsideBounds(point: Point, el: Rectangle | Line): boolean {
  if (el.type === "line") {
    return distToSegment(point, el.p1, el.p2) <= 6; // click near the line
  }
  return point.x >= el.left && point.x <= el.right &&
         point.y >= el.top  && point.y <= el.bottom;
}

function dist(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function distToSegment(p: Point, a: Point, b: Point): number {
  const l2 = (b.x - a.x) ** 2 + (b.y - a.y) ** 2;
  if (l2 === 0) return dist(p, a);
  let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return dist(p, { x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) });
}

export function getBoxHandlePositions(left: number, top: number, right: number, bottom: number) {
  const cx = (left + right) / 2;
  const cy = (top + bottom) / 2;
  return {
    nw: { x: left, y: top }, n: { x: cx, y: top }, ne: { x: right, y: top },
    w:  { x: left, y: cy },                         e:  { x: right, y: cy },
    sw: { x: left, y: bottom }, s: { x: cx, y: bottom }, se: { x: right, y: bottom },
  };
}