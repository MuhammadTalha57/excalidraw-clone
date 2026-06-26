"use client";

import Toolbar from "@/components/toolbar";
import ShapeOptions from "@/components/shapeOptions";
import Canvas from "./canvas/canvas";

export default function Whiteboard() {
    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-[#f1ece4]">
            <Canvas />

            {/* Toolbar */}
            <div className="pointer-events-none absolute inset-x-0 top-4 z-20 flex justify-center px-4 sm:top-6">
                <Toolbar />
            </div>

            {/* Shape Options */}
            <div
                className="
                    absolute
                    left-4
                    top-24
                    z-20
                    pointer-events-auto

                    hidden
                    md:block
                "
            >
                <ShapeOptions />
            </div>
        </div>
    );
}
