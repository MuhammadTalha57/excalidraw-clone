"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import renderElement, {
    renderSelectedElementsOverlay,
} from "../../lib/canvas/renderElement";
import pointerHandler from "../../lib/canvas/interactions/captureInteraction";
import { usePreviewElementStore } from "@/stores/usePreviewElement";
import { useCanvasElementsStore } from "@/stores/useCanvasElements";
import { useCameraStore } from "@/stores/useCamera";
import { useSelectionBoxStore } from "@/stores/useSelectionBox";
import { useSelectedElementsOverlayStore } from "@/stores/useSelectedElementsBox";
import { useSelectedToolStore } from "@/stores/useSelectedTool";
import { useErasingElementsStore } from "@/stores/useErasingElements";

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
    const cursorClass =
        selectedTool === "hand"
            ? "grab"
            : selectedTool === "select"
              ? "default"
              : "crosshair";

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
        <canvas
            ref={canvasRef}
            style={{ cursor: cursorClass, touchAction: "none" }}
            className={`bg-[#ffffff]`}
            onPointerMove={handler.onPointerMove}
            onPointerUp={handler.onPointerUp}
            onPointerDown={handler.onPointerDown}
        />
    );
}
