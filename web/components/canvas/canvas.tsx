"use client";

import { useLayoutEffect, useEffect, useRef, useState } from "react";
import renderElement, { renderSelectedElementsOverlay } from "../../lib/canvas/renderElement";
import pointerHandler from "../../lib/canvas/interactions/captureInteraction";
import { usePreviewElementStore } from "@/stores/usePreviewElement";
import { useCanvasElementsStore } from "@/stores/useCanvasElements";
import { useCameraStore } from "@/stores/useCamera";
import { useSelectionBoxStore } from "@/stores/useSelectionBox";
import { useSelectedElementsOverlayStore } from "@/stores/useSelectedElementsBox";

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handler = pointerHandler();

  const canvasElements = useCanvasElementsStore(
    (state) => state.canvasElements,
  );
  const previewElement = usePreviewElementStore(
    (state) => state.previewElement,
  );

  const selectionBox = useSelectionBoxStore((state) => state.selectionBox,);

  const selectedElementsOverlay = useSelectedElementsOverlayStore((state) => state.selectedElementsOverlay);

  const camera = useCameraStore((state) => state);

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

    for (const e of canvasElements) {
      renderElement(ctx, e);
    }
    if (previewElement) renderElement(ctx, previewElement);

    if(selectionBox) renderElement(ctx, selectionBox);

    if(selectedElementsOverlay) renderSelectedElementsOverlay(ctx, selectedElementsOverlay);

  }, [previewElement, canvasElements, camera, selectionBox, selectedElementsOverlay]);
  return (
    <canvas
      ref={canvasRef}
      className={`bg-[#ffffff]`}
      onPointerMove={handler.onPointerMove}
      onPointerUp={handler.onPointerUp}
      onPointerDown={handler.onPointerDown}
      onWheel={handler.onWheel}
    />
  );
}
