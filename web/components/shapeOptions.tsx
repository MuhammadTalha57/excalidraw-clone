"use client";

import { useState, useRef, useEffect } from "react";
import { useShapeOptionsStore } from "@/stores/useShapeOptions";
import { Minus, Palette, X } from "lucide-react";

import { ColorPickerSwatch } from "@/components/colorPickerSwatch";

/* ─── Palette ─────────────────────────────────────────────────────────────── */

const strokeColors = [
    "#1e1e1e",
    "#e03131",
    "#2f9e44",
    "#1971c2",
    "#f08c00",
    "#862e9c",
];

/**
 * Light pastel counterparts that correspond 1-to-1 with strokeColors,
 * prefixed by a "no-fill" transparent option
 */
const fillColors = [
    "transparent",
    "#ffffff",   // ↔ #1e1e1e  (dark → white)
    "#ffc9c9",   // ↔ #e03131  (red → blush)
    "#b2f2bb",   // ↔ #2f9e44  (green → mint)
    "#a5d8ff",   // ↔ #1971c2  (blue → sky)
    "#ffec99",   // ↔ #f08c00  (orange → lemon)
    "#eebefa",   // ↔ #862e9c  (purple → lavender)
];

const strokeWidths = [1, 2, 4, 8];

/* ─── Transparent swatch — white/grey checkerboard ───────────────────────── */

const transparentBg: React.CSSProperties = {
    backgroundImage: `
        linear-gradient(45deg,  #c0c0c0 25%, transparent 25%),
        linear-gradient(-45deg, #c0c0c0 25%, transparent 25%),
        linear-gradient(45deg,  transparent 75%, #c0c0c0 75%),
        linear-gradient(-45deg, transparent 75%, #c0c0c0 75%)
    `,
    backgroundSize: "8px 8px",
    backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
    backgroundColor: "white",
};

/* ─── Shared panel content ────────────────────────────────────────────────── */

function PanelContent() {
    const {
        strokeWidth,
        strokeColor,
        fillColor,
        setStrokeWidth,
        setStrokeColor,
        setFillColor,
    } = useShapeOptionsStore();

    return (
        <div className="space-y-5">
            {/* Stroke Width */}
            <section className="space-y-2">
                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
                    Stroke Width
                </h3>
                <div className="flex gap-2">
                    {strokeWidths.map((w) => (
                        <button
                            key={w}
                            onClick={() => setStrokeWidth(w)}
                            className={`
                                flex h-9 w-9 items-center justify-center
                                rounded-lg border transition-all duration-150
                                ${strokeWidth === w
                                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                                    : "border-neutral-200 bg-white hover:bg-neutral-50"
                                }
                            `}
                        >
                            <Minus size={18} strokeWidth={w} color="#000000" />
                        </button>
                    ))}
                </div>
            </section>

            {/* Stroke Color */}
            <section className="space-y-2">
                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
                    Stroke
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                    {strokeColors.map((color) => (
                        <button
                            key={color}
                            onClick={() => setStrokeColor(color)}
                            title={color}
                            className={`
                                relative h-7 w-7 rounded-full border transition-all duration-150
                                ${strokeColor === color
                                    ? "ring-2 ring-blue-500 ring-offset-2"
                                    : "hover:scale-110"
                                }
                            `}
                            style={{
                                backgroundColor: color,
                                borderColor:
                                    color === "#1e1e1e"
                                        ? "rgba(0,0,0,0.4)"
                                        : "rgba(0,0,0,0.12)",
                            }}
                        >
                            {strokeColor === color && (
                                <span className="absolute inset-0 flex items-center justify-center">
                                    <span className="h-2 w-2 rounded-full bg-white shadow ring-1 ring-black/20" />
                                </span>
                            )}
                        </button>
                    ))}
                    <span className="mx-1 h-7 w-px bg-neutral-200" aria-hidden="true" />
                    <ColorPickerSwatch
                        value={strokeColor}
                        onChange={setStrokeColor}
                        onChangeEnd={setStrokeColor}
                        label="Custom stroke color"
                    />
                </div>
            </section>

            {/* Fill Color */}
            <section className="space-y-2">
                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
                    Fill
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                    {fillColors.map((color) => {
                        const isTransparent = color === "transparent";
                        const isWhite = color === "#ffffff";
                        const isSelected = fillColor === color;

                        return (
                            <button
                                key={color}
                                onClick={() => setFillColor(color)}
                                title={isTransparent ? "None" : color}
                                className={`
                                    relative h-7 w-7 overflow-hidden rounded-full border transition-all duration-150
                                    ${isSelected
                                        ? "ring-2 ring-blue-500 ring-offset-2"
                                        : "hover:scale-110"
                                    }
                                `}
                                style={
                                    isTransparent
                                        ? {
                                              ...transparentBg,
                                              borderColor: "#d1d5db",
                                          }
                                        : {
                                              backgroundColor: color,
                                              borderColor: isWhite
                                                  ? "#d1d5db"
                                                  : `${color}cc`,
                                          }
                                }
                            >
                                {isSelected && (
                                    <span className="absolute inset-0 flex items-center justify-center">
                                        <span
                                            className={`h-2 w-2 rounded-full ${
                                                isTransparent || isWhite
                                                    ? "bg-neutral-500"
                                                    : "bg-black/40"
                                            }`}
                                        />
                                    </span>
                                )}
                            </button>
                        );
                    })}
                    <span className="mx-1 h-7 w-px bg-neutral-200" aria-hidden="true" />
                    <ColorPickerSwatch
                        value={fillColor}
                        onChange={setFillColor}
                        onChangeEnd={setFillColor}
                        label="Custom fill color"
                    />
                </div>
            </section>
        </div>
    );
}

/* ─── Main component ──────────────────────────────────────────────────────── */

const panelShell =
    "rounded-2xl border border-neutral-200 bg-white/95 shadow-xl backdrop-blur-sm p-4";

export default function ShapeOptions() {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    /* Close popup when clicking outside (mobile only) */
    useEffect(() => {
        if (!isOpen) return;
        const onPointerDown = (e: PointerEvent) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("pointerdown", onPointerDown);
        return () => document.removeEventListener("pointerdown", onPointerDown);
    }, [isOpen]);

    return (
        <>
            {/* ── Desktop: static panel ─────────────────────────────────── */}
            <div className={`hidden md:block w-64 ${panelShell}`}>
                <PanelContent />
            </div>

            {/* ── Mobile: FAB + slide-up popup ──────────────────────────── */}
            <div ref={wrapperRef} className="relative md:hidden">
                {/* Toggle button */}
                <button
                    onClick={() => setIsOpen((v) => !v)}
                    aria-label="Toggle shape options"
                    aria-expanded={isOpen}
                    className={`
                        pointer-events-auto flex h-11 w-11 items-center justify-center
                        rounded-2xl border border-neutral-200 bg-white/95
                        shadow-lg backdrop-blur-sm transition-all duration-150 active:scale-95
                        ${isOpen
                            ? "border-blue-300 ring-2 ring-blue-400 ring-offset-1"
                            : "hover:bg-neutral-50"
                        }
                    `}
                >
                    <Palette size={20} className="text-neutral-700" />
                </button>

                {/* Popup panel — opens upward */}
                {isOpen && (
                    <div
                        className={`
                            pointer-events-auto
                            absolute bottom-[calc(100%+10px)] left-0
                            w-72 max-w-[calc(100vw-2rem)]
                            ${panelShell}
                        `}
                    >
                        {/* Header */}
                        <div className="mb-4 flex items-center justify-between">
                            <span className="text-sm font-semibold text-neutral-800">
                                Style
                            </span>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="rounded-lg p-1 text-neutral-500 transition-colors hover:bg-neutral-100"
                            >
                                <X size={15} />
                            </button>
                        </div>

                        <PanelContent />
                    </div>
                )}
            </div>
        </>
    );
}