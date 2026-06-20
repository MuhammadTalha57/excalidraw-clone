"use client";

import Toolbar from "@/components/toolbar";
import { useLayoutEffect, useRef, useState } from "react";
import Canvas from "./canvas/canvas";
import { useSelectedToolStore } from "@/stores/useSelectedTool";
export default function Whiteboard() {
    const selectedTool = useSelectedToolStore().selectedTool;
    const cursorClass =
        selectedTool === "hand"
            ? "cursor-grab"
            : selectedTool === "select"
              ? "cursor-default"
              : "cursor-crosshair";

    return (
        <div
            className={`relative min-h-screen w-full overflow-hidden bg-[#f1ece4] ${cursorClass}`}
        >
            <Canvas></Canvas>

            <div className="pointer-events-none absolute inset-x-0 top-4 z-10 flex justify-center px-4 sm:top-6">
                <Toolbar />
            </div>
        </div>
    );
}
