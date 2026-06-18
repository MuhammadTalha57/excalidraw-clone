"use client";

import Toolbar from "@/components/toolbar";
import { useLayoutEffect, useRef, useState } from "react";
export default function Whiteboard() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [selectedTool, setSelectedTool] = useState("selection");

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
        ctx.clearRect(0, 0, cssWidth, cssHeight);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(200, 100);
        ctx.lineWidth = 3;
        ctx.stroke();
    }, []);
    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-[#f1ece4]">
            <canvas
                ref={canvasRef}
                width={500}
                height={500}
                className="absolute inset-0 h-full w-full bg-[#f1ece4]"
            />

            <div className="pointer-events-none absolute inset-x-0 top-4 z-10 flex justify-center px-4 sm:top-6">
                <Toolbar
                    selectedTool={selectedTool}
                    setSelectedTool={setSelectedTool}
                />
            </div>
        </div>
    );
}
