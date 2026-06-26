"use client";

import { useShapeOptionsStore } from "@/stores/useShapeOptions";
import { Minus, Circle } from "lucide-react";

const strokeColors = [
    "#1e1e1e",
    "#e03131",
    "#2f9e44",
    "#1971c2",
    "#f08c00",
    "#862e9c",
];

const fillColors = [
    "transparent",
    "#ffffff",
    "#ffd8a8",
    "#d3f9d8",
    "#d0ebff",
    "#f3d9fa",
];

const strokeWidths = [1, 2, 4, 8];

export default function ShapeOptions() {
    const {
        strokeWidth,
        strokeColor,
        fillColor,
        setStrokeWidth,
        setStrokeColor,
        setFillColor,
    } = useShapeOptionsStore();

    return (
        <div
            className="
                w-64
                rounded-2xl
                border
                border-neutral-200
                bg-white/95
                shadow-xl
                backdrop-blur
                p-4
                space-y-6
            "
        >
            {/* Stroke Width */}
            <section className="space-y-2">
                <h3 className="text-sm font-medium text-neutral-700">
                    Stroke Width
                </h3>

                <div className="flex gap-2">
                    {strokeWidths.map((width) => (
                        <button
                            key={width}
                            onClick={() => setStrokeWidth(width)}
                            className={`
        flex h-10 w-10 items-center justify-center
        rounded-lg border transition-all

        ${
            strokeWidth === width
                ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                : "border-neutral-200 hover:bg-neutral-100"
        }
    `}
                        >
                            <Minus size={20} strokeWidth={width} />
                        </button>
                    ))}
                </div>
            </section>

            {/* Stroke Color */}
            <section className="space-y-2">
                <h3 className="text-sm font-medium text-neutral-700">
                    Stroke Color
                </h3>

                <div className="flex flex-wrap gap-2">
                    {strokeColors.map((color) => (
                        <button
                            key={color}
                            onClick={() => setStrokeColor(color)}
                            className={`
        relative h-8 w-8 rounded-full transition-all

        ${
            strokeColor === color
                ? "ring-2 ring-blue-500 ring-offset-2"
                : "hover:scale-110"
        }
    `}
                            style={{ backgroundColor: color }}
                        >
                            {strokeColor === color && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="h-2.5 w-2.5 rounded-full bg-white border border-black/20" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </section>

            {/* Fill Color */}
            <section className="space-y-2">
                <h3 className="text-sm font-medium text-neutral-700">
                    Fill Color
                </h3>

                <div className="flex flex-wrap gap-2">
                    {fillColors.map((color) => (
                        <button
                            key={color}
                            onClick={() => setFillColor(color)}
                            className={`
        relative h-8 w-8 rounded-full overflow-hidden transition-all

        ${
            fillColor === color
                ? "ring-2 ring-blue-500 ring-offset-2"
                : "hover:scale-110"
        }
    `}
                            style={{
                                background:
                                    color === "transparent" ? "white" : color,
                            }}
                        >
                            {color === "transparent" && (
                                <svg className="absolute inset-0">
                                    <line
                                        x1="0"
                                        y1="100%"
                                        x2="100%"
                                        y2="0"
                                        stroke="red"
                                        strokeWidth="2"
                                    />
                                </svg>
                            )}

                            {fillColor === color && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="h-2.5 w-2.5 rounded-full bg-black/70" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </section>
        </div>
    );
}
