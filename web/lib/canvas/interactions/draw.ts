import { generateId } from "@/lib/id";
import { HandDrawn, Point } from "@/lib/types";
import { useCanvasElementsStore } from "@/stores/useCanvasElements";
import { usePreviewElementStore } from "@/stores/usePreviewElement";
import { useShapeOptionsStore } from "@/stores/useShapeOptions";

const setPreviewElement = usePreviewElementStore.getState().setPreviewElement;

const addCanvasElement = useCanvasElementsStore.getState().addCanvasElement;

export function handleHandDrawn(
    points: Point[],
    e: "UP" | "DOWN" | "MOVE",
    pointerDown: boolean,
) {
    if (e === "UP") onPointerUp(points);
    else if (e === "MOVE" && pointerDown) onPointerMove(points);
    else if (e === "DOWN") onPointerDown(points);
}

let selectedP1: Point | null = null;
let clicked = false;

function onPointerDown(points: Point[]) {
    clicked = true;
    selectedP1 = points[points.length - 1];
    points.length = 0;
    points.push(selectedP1);
    // const bounds = points.reduce(
    //     (acc, p) => ({
    //         minX: Math.min(acc.minX, p.x),
    //         maxX: Math.max(acc.maxX, p.x),
    //         minY: Math.min(acc.minY, p.y),
    //         maxY: Math.max(acc.maxY, p.y),
    //     }),
    //     {
    //         minX: Infinity,
    //         maxX: -Infinity,
    //         minY: Infinity,
    //         maxY: -Infinity,
    //     },
    // );

    // const previewElement: HandDrawn = {
    //     id: generateId(),
    //     type: "handdrawn",
    //     strokeWidth: useShapeOptionsStore.getState().strokeWidth,
    //     strokeColor: useShapeOptionsStore.getState().strokeColor,

    //     top: bounds.minY,
    //     bottom: bounds.maxY,
    //     left: bounds.minX,
    //     right: bounds.maxX,

    //     points: points,

    //     isSelected: false,
    // };
    // setPreviewElement(previewElement);
}

function onPointerMove(points: Point[]) {
    // Assuming Only calls when Pointer is down
    clicked = false;
    if (!selectedP1) return;

    // Create a Preview element for Hand drawn
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
        id: generateId(),
        type: "handdrawn",
        strokeWidth: useShapeOptionsStore.getState().strokeWidth,
        strokeColor: useShapeOptionsStore.getState().strokeColor,

        top: bounds.minY,
        bottom: bounds.maxY,
        left: bounds.minX,
        right: bounds.maxX,

        points: [...points],

        isSelected: false,
    };

    // Set Preview Element
    setPreviewElement(previewElement);
}

function onPointerUp(points: Point[]) {
    if (selectedP1) {
        if (clicked) {
            // Dot
            const dotElement: HandDrawn = {
                id: generateId(),
                type: "handdrawn",
                strokeWidth: useShapeOptionsStore.getState().strokeWidth,
                strokeColor: useShapeOptionsStore.getState().strokeColor,

                top: selectedP1.y,
                bottom: selectedP1.y,
                left: selectedP1.x,
                right: selectedP1.x,

                points: [selectedP1],

                isSelected: false,
            };

            addCanvasElement(dotElement);
        } else {
            const previewElemet =
                usePreviewElementStore.getState().previewElement;
            if (previewElemet) {
                addCanvasElement(previewElemet);
                setPreviewElement(null);
            }
        }
    }
    selectedP1 = null;
    clicked = false;
    points.length = 0;
}
