// hitTest.ts... (unchanged header)
import { useCanvasElementsStore } from "@/stores/useCanvasElements";
import { useSelectionBoxStore } from "@/stores/useSelectionBox";
import { getBoundingRectangle } from "@/utils/boundingRectangle";
import { moveElement } from "../../../utils/move";
import {
    CanvasElement,
    Line,
    Arrow,
    Point,
    Rectangle,
    CanvasElements,
} from "@excalidraw/shared/types";
import { HandleName } from "@/lib/types";
import { hitTest } from "@/lib/selectionHitTest";
import { useSelectedElementsOverlayStore } from "@/stores/useSelectedElementsBox";
import { generateId } from "@/lib/id";
import { useCursorStore } from "@/stores/useCursorStore";

const setSelectionBox = useSelectionBoxStore.getState().setSelectionBox;
const setSelectedElementsOverlay =
    useSelectedElementsOverlayStore.getState().setSelectedElementsOverlay;

let dragMode: "none" | "move" | "resize" = "none";
let dragStartPoint: Point | null = null;
let dragHandle: HandleName | null = null;
let selectedElements: CanvasElements = {};
let selectedElementsOverlayStart: Rectangle | Line | null = null;

// Captured once when a resize begins, so every subsequent move computes a
// TOTAL delta from the original pointer position / bounding box, rather
// than accumulating small per-frame deltas (which drifts).
let resizeStartPointerPos: Point | null = null;
let resizeStartBounds: {
    left: number;
    top: number;
    right: number;
    bottom: number;
} | null = null;

export function handleSelect(
    points: Point[],
    e: "UP" | "DOWN" | "MOVE",
    pointerDown: boolean,
) {
    if (e === "UP") onPointerUp(points);
    else if (e === "MOVE" && pointerDown) onPointerMove(points);
    else if (e === "DOWN") onPointerDown(points);
}

// Hover-only hit test — called on every pointer move regardless of button
// state, purely to drive cursor styling before a drag actually starts.
export function updateHoverCursor(point: Point) {
    if (dragMode !== "none") return; // an active drag owns the cursor

    const hit = hitTest(point);

    if (hit.type === "handle") {
        useCursorStore.getState().setHoverState(hit.handle, false);
    } else if (hit.type === "body") {
        useCursorStore.getState().setHoverState(null, true);
    } else {
        useCursorStore.getState().clearHoverState();
    }
}

function onPointerDown(points: Point[]) {
    setSelectionBox(null);

    selectedElements = {};
    const point = points[points.length - 1];
    points.length = 0;
    points.push(point);
    const selected = Object.values(
        useCanvasElementsStore.getState().canvasElements,
    ).filter((e) => e.isSelected);

    // Hit Test
    const hit = hitTest(point);

    if (hit.type === "none") {
        dragMode = "none";
        setSelectedElementsOverlay(null);
        for (const e of Object.values(
            useCanvasElementsStore.getState().canvasElements,
        )) {
            e.isSelected = false;
        }
        resizeStartPointerPos = null;
        resizeStartBounds = null;
        useCursorStore.getState().setDragState("none", null);
        return;
    }

    dragMode = hit.type === "handle" ? "resize" : "move";
    dragHandle = hit.type === "handle" ? hit.handle : null;
    dragStartPoint = point;
    for (const e of selected) selectedElements[e.id] = e;
    selectedElementsOverlayStart =
        useSelectedElementsOverlayStore.getState().selectedElementsOverlay;

    if (dragMode === "resize" && dragHandle) {
        resizeStartPointerPos = point;
        resizeStartBounds =
            dragHandle === "p1" || dragHandle === "p2"
                ? null
                : computeSelectionBounds(selectedElements);
    } else {
        resizeStartPointerPos = null;
        resizeStartBounds = null;
    }

    useCursorStore.getState().setDragState(dragMode, dragHandle);
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
        setSelectionBox(selectionBox);
        return;
    }

    if (dragMode === "move") {
        let dx = points[points.length - 1].x - dragStartPoint!.x;
        let dy = points[points.length - 1].y - dragStartPoint!.y;

        const updateElement =
            useCanvasElementsStore.getState().updateCanvasElement;
        const liveCanvasElements =
            useCanvasElementsStore.getState().canvasElements;

        for (const id of Object.keys(selectedElements)) {
            if (liveCanvasElements[id])
                updateElement(id, moveElement(liveCanvasElements[id], dx, dy));
        }

        dragStartPoint = points[points.length - 1];

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
        }
        return;
    }

    // dragMode === "resize"
    if (!dragHandle || !resizeStartPointerPos) {
        dragStartPoint = points[points.length - 1];
        return;
    }

    const currentPoint = points[points.length - 1];
    const totalDx = currentPoint.x - resizeStartPointerPos.x;
    const totalDy = currentPoint.y - resizeStartPointerPos.y;

    const updateElement = useCanvasElementsStore.getState().updateCanvasElement;
    const ids = Object.keys(selectedElements);

    if (dragHandle === "p1" || dragHandle === "p2") {
        // Single line/arrow endpoint drag.
        if (ids.length === 1) {
            const id = ids[0];
            const original = selectedElements[id];

            if (
                original &&
                (original.type === "line" || original.type === "arrow")
            ) {
                const resized = resizeLineEndpoint(
                    original,
                    dragHandle,
                    totalDx,
                    totalDy,
                );
                updateElement(id, resized);

                useSelectedElementsOverlayStore.getState().setSelectedElementsOverlay({
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
            }
        }
    } else if (resizeStartBounds) {
        // Box-handle resize — scales the WHOLE selection (any number of
        // elements, including handdrawn strokes) relative to its
        // original bounding box.
        let { left, top, right, bottom } = resizeStartBounds;

        if (dragHandle.includes("n")) top += totalDy;
        if (dragHandle.includes("s")) bottom += totalDy;
        if (dragHandle.includes("w")) left += totalDx;
        if (dragHandle.includes("e")) right += totalDx;

        const MIN_SIZE = 4;
        if (right - left < MIN_SIZE) {
            if (dragHandle.includes("w")) left = right - MIN_SIZE;
            else right = left + MIN_SIZE;
        }
        if (bottom - top < MIN_SIZE) {
            if (dragHandle.includes("n")) top = bottom - MIN_SIZE;
            else bottom = top + MIN_SIZE;
        }

        const origW = resizeStartBounds.right - resizeStartBounds.left;
        const origH = resizeStartBounds.bottom - resizeStartBounds.top;

        const scalesX = dragHandle.includes("e") || dragHandle.includes("w");
        const scalesY = dragHandle.includes("n") || dragHandle.includes("s");

        const sx = scalesX && origW !== 0 ? (right - left) / origW : 1;
        const sy = scalesY && origH !== 0 ? (bottom - top) / origH : 1;

        const originLeft = resizeStartBounds.left;
        const originTop = resizeStartBounds.top;

        const transform = (x: number, y: number): Point => ({
            x: left + (x - originLeft) * sx,
            y: top + (y - originTop) * sy,
        });

        for (const id of ids) {
            const original = selectedElements[id];
            if (!original) continue;
            updateElement(id, scaleElement(original, transform));
        }

        useSelectedElementsOverlayStore.getState().setSelectedElementsOverlay({
            id: generateId(),
            type: "rectangle",
            strokeWidth: 1,
            strokeColor: "#4C6FFF",
            fillColor: "rgba(76, 111, 255, 0.10)",
            top,
            bottom,
            left,
            right,
            x: left,
            y: top,
            width: right - left,
            height: bottom - top,
            isSelected: false,
        });
    }

    dragStartPoint = currentPoint;
}

function onPointerUp(points: Point[]) {
    const selectionBox = useSelectionBoxStore.getState().selectionBox;
    if (selectionBox) {
        setSelectionBox(null);
        if (Object.keys(selectedElements).length > 0) {
            createSelectedElementsOverlay();
        }
    }
    points.length = 0;

    dragMode = "none";
    dragStartPoint = null;
    dragHandle = null;
    selectedElements = {};
    resizeStartPointerPos = null;
    resizeStartBounds = null;

    useCursorStore.getState().setDragState("none", null);
}

function computeSelectionBounds(elements: CanvasElements) {
    const values = Object.values(elements);
    if (values.length === 0) return { left: 0, top: 0, right: 0, bottom: 0 };

    return values.reduce(
        (acc, e) => ({
            top: Math.min(acc.top, e.top),
            bottom: Math.max(acc.bottom, e.bottom),
            left: Math.min(acc.left, e.left),
            right: Math.max(acc.right, e.right),
        }),
        { top: Infinity, bottom: -Infinity, left: Infinity, right: -Infinity },
    );
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

    const temp = computeSelectionBounds(selectedElements);

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

// Moves a single line/arrow endpoint. dx/dy are the TOTAL delta from drag
// start, applied to the ORIGINAL (pre-drag) endpoint — no accumulation.
function resizeLineEndpoint(
    original: Line | Arrow,
    handle: "p1" | "p2",
    dx: number,
    dy: number,
): Line | Arrow {
    if (handle === "p1") {
        const newP1 = { x: original.p1.x + dx, y: original.p1.y + dy };
        return {
            ...original,
            p1: newP1,
            top: Math.min(newP1.y, original.p2.y),
            bottom: Math.max(newP1.y, original.p2.y),
            left: Math.min(newP1.x, original.p2.x),
            right: Math.max(newP1.x, original.p2.x),
        };
    }

    const newP2 = { x: original.p2.x + dx, y: original.p2.y + dy };
    return {
        ...original,
        p2: newP2,
        top: Math.min(original.p1.y, newP2.y),
        bottom: Math.max(original.p1.y, newP2.y),
        left: Math.min(original.p1.x, newP2.x),
        right: Math.max(original.p1.x, newP2.x),
    };
}

// Applies an affine (scale + translate) transform to every point defining
// an element's geometry, then recomputes its bounding box. Works
// uniformly for boxy shapes, lines/arrows, AND handdrawn strokes.
function scaleElement(
    el: CanvasElement,
    transform: (x: number, y: number) => Point,
): CanvasElement {
    if (el.type === "line" || el.type === "arrow") {
        const p1 = transform(el.p1.x, el.p1.y);
        const p2 = transform(el.p2.x, el.p2.y);
        return {
            ...el,
            p1,
            p2,
            top: Math.min(p1.y, p2.y),
            bottom: Math.max(p1.y, p2.y),
            left: Math.min(p1.x, p2.x),
            right: Math.max(p1.x, p2.x),
        };
    }

    if (el.type === "handdrawn") {
        const points = el.points.map((p) => transform(p.x, p.y));
        const bounds = points.reduce(
            (acc, p) => ({
                minX: Math.min(acc.minX, p.x),
                maxX: Math.max(acc.maxX, p.x),
                minY: Math.min(acc.minY, p.y),
                maxY: Math.max(acc.maxY, p.y),
            }),
            { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity },
        );

        return {
            ...el,
            points,
            top: bounds.minY,
            bottom: bounds.maxY,
            left: bounds.minX,
            right: bounds.maxX,
        };
    }

    // rectangle | diamond | ellipse
    const corner1 = transform(el.left, el.top);
    const corner2 = transform(el.right, el.bottom);

    const left = Math.min(corner1.x, corner2.x);
    const right = Math.max(corner1.x, corner2.x);
    const top = Math.min(corner1.y, corner2.y);
    const bottom = Math.max(corner1.y, corner2.y);

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

export function cancel() {
    setSelectionBox(null);
    setSelectedElementsOverlay(null);
    for (const e of Object.values(
        useCanvasElementsStore.getState().canvasElements,
    )) {
        e.isSelected = false;
    }
    dragMode = "none";
    dragHandle = null;
    dragStartPoint = null;
    resizeStartPointerPos = null;
    resizeStartBounds = null;
    useCursorStore.getState().setDragState("none", null);
    useCursorStore.getState().clearHoverState();
}