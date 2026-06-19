"use client";

import { useLayoutEffect, useRef, useState } from "react";
import renderElement from "./renderElement";
export default function Canvas() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

        // ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        // ctx.clearRect(0, 0, cssWidth, cssHeight);

        // ctx.beginPath();
        // ctx.moveTo(0, 0);
        // ctx.lineTo(200, 100);
        // ctx.lineWidth = 3;
        // ctx.stroke();
    }, []);
    return <canvas ref={canvasRef} className={`bg-[#ffffff]`} />;
}
