"use client";

import SessionManager from "@/components/sessionManager";
import Toolbar from "@/components/toolbar";
import ShapeOptions from "@/components/shapeOptions";
import Canvas from "./canvas/canvas";

export default function Whiteboard() {
    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-[#f1ece4]">
            <Canvas />

            {/*
             * ── Toolbar ──────────────────────────────────────────────────────
             * Desktop (md+):  centred at the top, full-width with px padding.
             * Mobile  (<md):  pinned at the bottom; leaves a ~56 px gap on the
             *                 left so the ShapeOptions FAB is never covered.
             *                 Horizontally scrollable (scrollbar hidden) if the
             *                 toolbar's content overflows the available width.
             */}
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
                    /* hide the native scrollbar while keeping scroll-ability */
                    style={{
                        scrollbarWidth: "none",        /* Firefox */
                        msOverflowStyle: "none",       /* IE / Edge */
                        WebkitOverflowScrolling: "touch",
                    } as React.CSSProperties}
                >
                    <Toolbar />
                </div>
            </div>

            {/*
             * ── Session Management ───────────────────────────────────────────
             * Always top-right; unchanged from original.
             */}
            <div className="pointer-events-none absolute right-4 top-4 z-30 sm:right-6 sm:top-6">
                <SessionManager />
            </div>

            {/*
             * ── Shape Options ────────────────────────────────────────────────
             * Desktop:  left-4, just below the top toolbar (top-24).
             * Mobile:   left-4, floating above the bottom toolbar.
             *           ShapeOptions renders a compact FAB on small screens and
             *           opens a popup panel on tap — all handled internally.
             *
             * bottom-20 (5 rem = 80 px) gives comfortable clearance above a
             * ~56 px toolbar sitting at bottom-4 (16 px from the edge).
             */}
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