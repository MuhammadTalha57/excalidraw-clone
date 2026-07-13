import { useCanvasElementsStore } from "@/stores/useCanvasElements";
import { useSelectionBoxStore } from "@/stores/useSelectionBox";
import { getBoundingRectangle } from "@/utils/boundingRectangle";
import { moveElement } from "./move";
import { CanvasElement, HandleName, Line, Point, Rectangle } from "@/lib/types";
import { hitTest } from "@/lib/selectionHitTest";
import { useSelectedElementsOverlayStore } from "@/stores/useSelectedElementsBox";
import { generateId } from "@/lib/id";
import { CanvasElements } from "@excalidraw/shared/types";

const setSelectionBox = useSelectionBoxStore.getState().setSelectionBox;
const setSelectedElementsOverlay =
    useSelectedElementsOverlayStore.getState().setSelectedElementsOverlay;

let dragMode: "none" | "move" | "resize" = "none";
let dragStartPoint: Point | null = null;
let dragHandle: HandleName | null = null;
let selectedElements: CanvasElements = {};
let selectedElementsOverlayStart: Rectangle | Line | null = null;

export function handleSelect(points: Point[], e: "UP" | "DOWN" | "MOVE") {
    if (e === "UP") onPointerUp(points);
    else if (e === "MOVE") onPointerMove(points);
    else if (e === "DOWN") onPointerDown(points);
}

function onPointerDown(points: Point[]) {
    selectedElements = {};
    const point = points[0];
    const selected = Object.values(
        useCanvasElementsStore.getState().canvasElements,
    ).filter((e) => e.isSelected);

    // Hit Test
    const hit = hitTest(point);

    if (hit.type === "none") {
        dragMode = "none";
        return;
    }

    dragMode = hit.type === "handle" ? "resize" : "move";
    dragHandle = hit.type === "handle" ? hit.handle : null;
    dragStartPoint = point;
    for (const e of selected) selectedElements[e.id] = e;
    selectedElementsOverlayStart =
        useSelectedElementsOverlayStore.getState().selectedElementsOverlay;
}

function onPointerMove(points: Point[]) {
    if (dragMode === "none") {
        useSelectedElementsOverlayStore
            .getState()
            .clearSelectedElementsOverlay();
        const selected = Object.values(
            useCanvasElementsStore.getState().canvasElements,
        ).filter((e) => e.isSelected);

        for (const e of selected) selectedElements[e.id] = e;
        if (points.length < 2) return;

        // Create a Selection box

        const boundingRect = getBoundingRectangle(
            points[0].x,
            points[0].y,
            points[points.length - 1].x,
            points[points.length - 1].y,
        );

        const selectionBox: Rectangle = {
            id: generateId(),
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

    if (dragMode === "move") {
        let dx = points[points.length - 1].x - dragStartPoint!.x;
        let dy = points[points.length - 1].y - dragStartPoint!.y;

        // Move Elements
        const updateElement =
            useCanvasElementsStore.getState().updateCanvasElement;

        const liveCanvasElements =
            useCanvasElementsStore.getState().canvasElements;

        for (const id of Object.keys(selectedElements)) {
            if (liveCanvasElements[id])
                updateElement(id, moveElement(liveCanvasElements[id], dx, dy));
        }

        dragStartPoint = points[points.length - 1];

        // Move Selection Box and update selection box
        const currentOverlay =
            useSelectedElementsOverlayStore.getState().selectedElementsOverlay;
        if (currentOverlay) {
            if (currentOverlay.type === "rectangle") {
                useSelectedElementsOverlayStore
                    .getState()
                    .setSelectedElementsOverlay({
                        ...currentOverlay,
                        x: currentOverlay.x + dx,
                        y: currentOverlay.y + dy,
                        top: currentOverlay.top + dy,
                        bottom: currentOverlay.bottom + dy,
                        left: currentOverlay.left + dx,
                        right: currentOverlay.right + dx,
                    });
            } else {
                useSelectedElementsOverlayStore
                    .getState()
                    .setSelectedElementsOverlay({
                        ...currentOverlay,
                        p1: {
                            x: currentOverlay.p1.x + dx,
                            y: currentOverlay.p1.y + dy,
                        },
                        p2: {
                            x: currentOverlay.p2.x + dx,
                            y: currentOverlay.p2.y + dy,
                        },
                        top: currentOverlay.top + dy,
                        bottom: currentOverlay.bottom + dy,
                        left: currentOverlay.left + dx,
                        right: currentOverlay.right + dx,
                    });
            }
            // if (selectedElementsOverlayStart) {
            //   if(selectedElementsOverlayStart.type === "rectangle") {

            //     useSelectedElementsOverlayStore.getState().setSelectedElementsOverlay({
            //       ...selectedElementsOverlayStart,
            //       x: selectedElementsOverlayStart.x + dx,
            //       y: selectedElementsOverlayStart.y + dy,
            //       top: selectedElementsOverlayStart.top + dy,
            //       bottom: selectedElementsOverlayStart.bottom + dy,
            //       left: selectedElementsOverlayStart.left + dx,
            //       right: selectedElementsOverlayStart.right + dx,
            //     });
            //   } else {
            //     useSelectedElementsOverlayStore.getState().setSelectedElementsOverlay({
            //       ...selectedElementsOverlayStart,
            //       p1: {x: selectedElementsOverlayStart.p1.x + dx, y: selectedElementsOverlayStart.p1.y + dy},
            //       p2: {x: selectedElementsOverlayStart.p2.x + dx, y: selectedElementsOverlayStart.p2.y + dy},
            //       top: selectedElementsOverlayStart.top + dy,
            //       bottom: selectedElementsOverlayStart.bottom + dy,
            //       left: selectedElementsOverlayStart.left + dx,
            //       right: selectedElementsOverlayStart.right + dx,
            //     });
            //   }
        }
    } else {
        // Resize
        let dx = points[points.length - 1].x - dragStartPoint!.x;
        let dy = points[points.length - 1].y - dragStartPoint!.y;

        const updateElement =
            useCanvasElementsStore.getState().updateCanvasElement;
        const liveCanvasElements =
            useCanvasElementsStore.getState().canvasElements;

        const ids = Object.keys(selectedElements);
        if (ids.length === 1 && dragHandle) {
            const id = ids[0];
            const current = liveCanvasElements[id];

            if (current) {
                const resized = resizeElement(current, dragHandle, dx, dy);
                updateElement(id, resized);

                if (resized.type === "line" || resized.type === "arrow") {
                    useSelectedElementsOverlayStore
                        .getState()
                        .setSelectedElementsOverlay({
                            id: generateId(),
                            type: "line",
                            strokeWidth: 1,
                            strokeColor: "#4C6FFF",
                            top: resized.top,
                            bottom: resized.bottom,
                            left: resized.left,
                            right: resized.right,
                            p1: resized.p1,
                            p2: resized.p2,
                            isSelected: false,
                        });
                } else {
                    useSelectedElementsOverlayStore
                        .getState()
                        .setSelectedElementsOverlay({
                            id: generateId(),
                            type: "rectangle",
                            strokeWidth: 1,
                            strokeColor: "#4C6FFF",
                            fillColor: "rgba(76, 111, 255, 0.10)",
                            top: resized.top,
                            bottom: resized.bottom,
                            left: resized.left,
                            right: resized.right,
                            x: resized.left,
                            y: resized.top,
                            width: resized.right - resized.left,
                            height: resized.bottom - resized.top,
                            isSelected: false,
                        });
                }
            }
        }

        dragStartPoint = points[points.length - 1];
    }
}

function onPointerUp(points: Point[]) {
    const selectionBox = useSelectionBoxStore.getState().selectionBox;
    if (selectionBox) {
        setSelectionBox(null);

        // Create Selected Elements Overlay
        if (Object.keys(selectedElements).length > 0) {
            createSelectedElementsOverlay();
        }
    }
    points = [];

    dragMode = "none";
    dragStartPoint = null;
    selectedElements = {};
    // selectedElements.clear();
}

function markSelectedElements(selectionBox: Rectangle) {
    const canvasElements = useCanvasElementsStore.getState().canvasElements;

    for (const e of Object.values(canvasElements)) {
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

function createSelectedElementsOverlay() {
    let selectedElementsOverlay: Rectangle | Line | null = null;
    if (Object.keys(selectedElements).length === 1) {
        const e = Object.values(selectedElements)[0];

        if (e.type === "line" || e.type === "arrow") {
            // Create selected elements overlay
            selectedElementsOverlay = {
                id: generateId(),
                type: "line",
                strokeWidth: 1,
                strokeColor: "#4C6FFF",

                top: e.top,
                bottom: e.bottom,
                right: e.right,
                left: e.left,

                p1: e.p1,
                p2: e.p2,

                isSelected: false,
            };

            setSelectedElementsOverlay(selectedElementsOverlay);

            return;
        }
    }

    // Calculate bounds
    let temp = Object.values(selectedElements).reduce(
        (acc, e) => ({
            top: Math.min(acc.top, e.top),
            bottom: Math.max(acc.bottom, e.bottom),
            left: Math.min(acc.left, e.left),
            right: Math.max(acc.right, e.right),
        }),
        { top: Infinity, bottom: -Infinity, left: Infinity, right: -Infinity },
    );

    // Create selected elements overlay
    selectedElementsOverlay = {
        id: generateId(),
        type: "rectangle",
        strokeWidth: 1,
        strokeColor: "#4C6FFF",
        fillColor: "rgba(76, 111, 255, 0.10)",

        top: temp.top,
        bottom: temp.bottom,
        right: temp.right,
        left: temp.left,

        x: temp.left,
        y: temp.top,
        width: Math.abs(temp.right - temp.left),
        height: Math.abs(temp.top - temp.bottom),

        isSelected: false,
    };

    setSelectedElementsOverlay(selectedElementsOverlay);
}

function resizeElement(
    el: CanvasElement,
    handle: HandleName,
    dx: number,
    dy: number,
): CanvasElement {
    if (el.type === "line" || el.type === "arrow") {
        if (handle === "p1") {
            const newP1 = { x: el.p1.x + dx, y: el.p1.y + dy };
            return {
                ...el,
                p1: newP1,
                top: Math.min(newP1.y, el.p2.y),
                bottom: Math.max(newP1.y, el.p2.y),
                left: Math.min(newP1.x, el.p2.x),
                right: Math.max(newP1.x, el.p2.x),
            };
        }
        if (handle === "p2") {
            const newP2 = { x: el.p2.x + dx, y: el.p2.y + dy };
            return {
                ...el,
                p2: newP2,
                top: Math.min(el.p1.y, newP2.y),
                bottom: Math.max(el.p1.y, newP2.y),
                left: Math.min(el.p1.x, newP2.x),
                right: Math.max(el.p1.x, newP2.x),
            };
        }
        return el;
    }

    if (el.type === "handdrawn") return el; // skip freehand resize for now

    let { left, top, right, bottom } = el;

    if (handle.includes("n")) top += dy;
    if (handle.includes("s")) bottom += dy;
    if (handle.includes("w")) left += dx;
    if (handle.includes("e")) right += dx;

    const MIN_SIZE = 4;
    if (right - left < MIN_SIZE) {
        if (handle.includes("w")) left = right - MIN_SIZE;
        else right = left + MIN_SIZE;
    }
    if (bottom - top < MIN_SIZE) {
        if (handle.includes("n")) top = bottom - MIN_SIZE;
        else bottom = top + MIN_SIZE;
    }

    return {
        ...el,
        left,
        top,
        right,
        bottom,
        x: left,
        y: top,
        width: right - left,
        height: bottom - top,
    };
}
