"use client";

import SessionManager from "@/components/sessionManager";
import Toolbar from "@/components/toolbar";
import ShapeOptions from "@/components/shapeOptions";
import Canvas from "./canvas";

export default function Whiteboard() {
    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-[#f1ece4]">
            <Canvas />
            <div
                className="
                    pointer-events-none absolute z-20 flex justify-center
                    /* mobile */
                    bottom-4 left-14 right-2
                    /* desktop */
                    md:bottom-auto md:top-6 md:left-0 md:right-0 md:px-4
                "
            >
                <div
                    className="pointer-events-auto w-full overflow-x-auto md:w-auto"
                    style={
                        {
                            scrollbarWidth: "none",
                            msOverflowStyle: "none",
                            WebkitOverflowScrolling: "touch",
                        } as React.CSSProperties
                    }
                >
                    <Toolbar />
                </div>
            </div>

            <div className="pointer-events-none absolute right-4 top-4 z-30 sm:right-6 sm:top-6">
                <SessionManager />
            </div>

            <div
                className="
                    pointer-events-auto absolute z-30 left-4
                    bottom-20 md:bottom-auto md:top-24
                "
            >
                <ShapeOptions />
            </div>
        </div>
    );
}
