"use client";

import { useLayoutEffect, useRef, useState } from "react";
import renderElement from "./renderElement";
import pointerHandler from "./interactions/captureInteraction";
import { usePreviewElementStore } from "@/stores/usePreviewElement";
import { useCanvasElementsStore } from "@/stores/useCanvasElements";

export default function Canvas() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const handler = pointerHandler();

    const canvasElements = useCanvasElementsStore(
        (state) => state.canvasElements,
    );
    const previewElement = usePreviewElementStore(
        (state) => state.previewElement,
    );

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
        ctx.scale(dpr, dpr);

        for (const e of canvasElements) {
            renderElement(ctx, e);
        }
        if (previewElement) renderElement(ctx, previewElement);
    }, [previewElement, canvasElements]);
    return (
        <canvas
            ref={canvasRef}
            className={`bg-[#ffffff]`}
            onPointerMove={handler.onPointerMove}
            onPointerUp={handler.onPointerUp}
            onPointerDown={handler.onPointerDown}
        />
    );
}
