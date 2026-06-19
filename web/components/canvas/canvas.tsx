"use client";

import { useLayoutEffect, useRef, useState } from "react";
import renderElement from "./renderElement";
import { usePointerTracker } from "./usePointerTracker";
export default function Canvas() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const toolRef = useRef<Tool>("select");
    const [interaction, setInteraction] = useState<Interaction>({
        type: "idle",
    });
    const pointer = usePointerTracker();

    const [canvasElements, setCanvasElements] = useState<CanvasElement[]>([
        {
            id: "1",
            strokeColor: "#000000",
            fillColor: "#000000",
            x: 5,
            y: 100,
            width: 100,
            height: 100,
            type: "rectangle",
        },
    ]);

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

        for (const e of canvasElements) {
            renderElement(ctx, e);
        }
    }, []);
    return <canvas ref={canvasRef} className={`bg-[#ffffff]`} />;
}
