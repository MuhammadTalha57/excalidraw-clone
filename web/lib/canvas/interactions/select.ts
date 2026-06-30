import { useCanvasElementsStore } from "@/stores/useCanvasElements";
import { useSelectionBoxStore } from "@/stores/useSelectionBox";
import { getBoundingRectangle } from "@/utils/boundingRectangle";
import { moveElement } from "./move";
import { CanvasElement, HandleName, Point, Rectangle } from "@/lib/types";
import { hitTest } from "@/lib/selectionHitTest";

const setSelectionBox = useSelectionBoxStore.getState().setSelectionBox;

let dragMode: "none" | "move" | "resize" = "none";
let dragStartPoint: Point | null = null;
let dragHandle: HandleName | null  = null;
let selectedElements: Map<number, CanvasElement> = new Map();
let selectionBoxStart: Rectangle | null = null;


export function handleSelect(points: Point[], e: "UP" | "DOWN" | "MOVE") {
  if (e === "UP") onPointerUp(points);
  else if (e === "MOVE") onPointerMove(points);
  else if (e === "DOWN") onPointerDown(points);
}

function onPointerDown(points: Point[]) {
  const point = points[0];
  const selected = useCanvasElementsStore
    .getState()
    .canvasElements.map((e, i) => ({e, i})).filter(({e}) => e.isSelected);

  // Hit Test
  const hit = hitTest(point, selected.map(element => element.e));

  if(hit.type === "none") {
    dragMode = "none";
    return;
  }

  dragMode = hit.type === "handle" ? "resize": "move";
  dragHandle = hit.type === "handle" ? hit.handle: null;
  dragStartPoint = point;
  selectedElements = new Map(selected.map(({e, i}) => [i, {...e}]));
  selectionBoxStart = useSelectionBoxStore.getState().selectionBox;
}

function onPointerMove(points: Point[]) {
  if (dragMode === "none") {
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

    return;
  }


  if(dragMode === "move") {
    let dx = points[points.length - 1].x - dragStartPoint!.x;
    let dy = points[points.length - 1].y - dragStartPoint!.y;
    
    // Move Elements
    const updateElement = useCanvasElementsStore.getState().updateCanvasElement;
    for(const [i, e] of selectedElements) {
      updateElement(i, moveElement(e, dx, dy));
    }

    // Move Selection Box and update selection box
    if(selectionBoxStart) {
      useSelectionBoxStore.getState().setSelectionBox({
        ...selectionBoxStart,
        x: selectionBoxStart.x + dx,
        y: selectionBoxStart.y  + dy,
        top: selectionBoxStart.top + dy,
        bottom: selectionBoxStart.bottom + dy,
        left: selectionBoxStart.left + dx,
        right: selectionBoxStart.right + dx,
      })
      
    }
  } else {
    // Resize
  }
}

function onPointerUp(points: Point[]) {
  const selectionBox = useSelectionBoxStore.getState().selectionBox;
  if (selectionBox) {
    setSelectionBox(null);
  }
  points = [];

  dragMode = "none";
  dragStartPoint = null;
  selectedElements.clear();

  
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
