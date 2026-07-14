"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useCursorStore } from "@/stores/useCursorStore";
import { HandleName } from "@/lib/types";
import renderElement, {
    renderSelectedElementsOverlay,
} from "../lib/canvas/renderElement";
import pointerHandler from "../lib/canvas/interactions/captureInteraction";
import { usePreviewElementStore } from "@/stores/usePreviewElement";
import { useCanvasElementsStore } from "@/stores/useCanvasElements";
import { useCameraStore } from "@/stores/useCamera";
import { useSelectionBoxStore } from "@/stores/useSelectionBox";
import { useSelectedElementsOverlayStore } from "@/stores/useSelectedElementsBox";
import { useSelectedToolStore } from "@/stores/useSelectedTool";
import { useErasingElementsStore } from "@/stores/useErasingElements";
import { RemoteCursors } from "./remoteCursors";
import { useEmitCursorMove } from "@/hooks/useEmitCursorMove";

export default function Canvas() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const handler = pointerHandler();

    const canvasElements = useCanvasElementsStore(
        (state) => state.canvasElements,
    );
    const previewElement = usePreviewElementStore(
        (state) => state.previewElement,
    );

    const selectionBox = useSelectionBoxStore((state) => state.selectionBox);

    const selectedElementsOverlay = useSelectedElementsOverlayStore(
        (state) => state.selectedElementsOverlay,
    );

    const selectedTool = useSelectedToolStore((state) => state.selectedTool);
    const dragMode = useCursorStore((state) => state.dragMode);
    const dragHandle = useCursorStore((state) => state.dragHandle);
    const hoverHandle = useCursorStore((state) => state.hoverHandle);
    const hoverBody = useCursorStore((state) => state.hoverBody);

    const cursorClass = useMemo(() => {
        if (selectedTool === "hand") return "grab";

        if (selectedTool === "select") {
            const activeHandle =
                dragMode === "resize" ? dragHandle : hoverHandle;
            if (activeHandle) return handleCursor(activeHandle);
            if (dragMode === "move" || hoverBody) return "move";
            return "default";
        }

        return "crosshair";
    }, [selectedTool, dragMode, dragHandle, hoverHandle, hoverBody]);

    const erasingIds = useErasingElementsStore((state) => state.erasingIds);

    const camera = useCameraStore((state) => state);

    // Prevents Screnn Scroll while Zooming
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !handler.onWheel) return;

        const handleWheel = (e: WheelEvent) => {
            // This stops the whole page from bouncing or scrolling up and down
            e.preventDefault();
            handler.onWheel(e as any);
        };

        canvas.addEventListener("wheel", handleWheel, { passive: false });

        return () => {
            canvas.removeEventListener("wheel", handleWheel);
        };
    }, [handler.onWheel]);

    useEmitCursorMove();

    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const cssWidth = window.innerWidth;
        const cssHeight = window.innerHeight;

        canvas.style.width = `${cssWidth}px`;
        canvas.style.height = `${cssHeight}px`;
        canvas.width = Math.round(cssWidth * dpr);
        canvas.height = Math.round(cssHeight * dpr);

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.scale(camera.zoom, camera.zoom);
        ctx.translate(-camera.offsetX, -camera.offsetY);

        for (const [id, e] of Object.entries(canvasElements)) {
            renderElement(ctx, e, erasingIds.has(id));
        }
        if (previewElement) renderElement(ctx, previewElement);

        if (selectionBox) renderElement(ctx, selectionBox);

        if (selectedElementsOverlay)
            renderSelectedElementsOverlay(ctx, selectedElementsOverlay);
    }, [
        previewElement,
        canvasElements,
        camera,
        selectionBox,
        selectedElementsOverlay,
        erasingIds,
    ]);
    return (
        <>
        <canvas
            ref={canvasRef}
            style={{ cursor: cursorClass, touchAction: "none" }}
            className={`bg-[#ffffff]`}
            onPointerMove={handler.onPointerMove}
            onPointerUp={handler.onPointerUp}
            onPointerDown={handler.onPointerDown}
            onKeyDown={handler.onKeyDown}
            tabIndex={0}
        />
        <RemoteCursors/>
        </>
    );
}

function handleCursor(handle: HandleName): string {
    switch (handle) {
        case "n":
        case "s":
            return "ns-resize";
        case "e":
        case "w":
            return "ew-resize";
        case "ne":
        case "sw":
            return "nesw-resize";
        case "nw":
        case "se":
            return "nwse-resize";
        case "p1":
        case "p2":
            return "crosshair";
        default:
            return "default";
    }
}