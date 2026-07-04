"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { X } from "lucide-react";
import { HexAlphaColorPicker } from "react-colorful";

type ColorPickerSwatchProps = {
    value: string;
    onChange: (color: string) => void;
    onChangeEnd?: (color: string) => void;
    label: string;
    className?: string;
};

const transparentBg: CSSProperties = {
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

const HEX_3 = /^#([0-9a-fA-F]{3})$/;
const HEX_4 = /^#([0-9a-fA-F]{4})$/;
const HEX_6 = /^#([0-9a-fA-F]{6})$/;
const HEX_8 = /^#([0-9a-fA-F]{8})$/;

function expandHex(value: string) {
    return value
        .split("")
        .map((character) => character + character)
        .join("");
}

function toPickerColor(value: string) {
    if (value === "transparent") {
        return "#00000000";
    }

    if (HEX_8.test(value)) {
        return value.toLowerCase();
    }

    if (HEX_6.test(value)) {
        return `${value.toLowerCase()}ff`;
    }

    if (HEX_4.test(value)) {
        return `#${expandHex(value.slice(1).toLowerCase())}`;
    }

    if (HEX_3.test(value)) {
        return `#${expandHex(value.slice(1).toLowerCase())}ff`;
    }

    return "#000000ff";
}

function toTextValue(value: string) {
    if (value === "transparent") {
        return value;
    }

    if (HEX_8.test(value) || HEX_6.test(value)) {
        return value.toLowerCase();
    }

    if (HEX_4.test(value) || HEX_3.test(value)) {
        return `#${expandHex(value.slice(1).toLowerCase())}`;
    }

    return "#000000";
}

function parseInput(value: string) {
    const trimmed = value.trim();

    if (trimmed === "transparent") {
        return { color: "transparent", valid: true };
    }

    if (HEX_3.test(trimmed) || HEX_4.test(trimmed)) {
        return { color: `#${expandHex(trimmed.slice(1).toLowerCase())}`, valid: true };
    }

    if (HEX_6.test(trimmed) || HEX_8.test(trimmed)) {
        return { color: trimmed.toLowerCase(), valid: true };
    }

    return { color: trimmed, valid: false };
}

function isTransparentValue(value: string) {
    return value === "transparent" || toPickerColor(value).endsWith("00");
}

export function ColorPickerSwatch({
    value,
    onChange,
    onChangeEnd,
    label,
    className,
}: ColorPickerSwatchProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [draftValue, setDraftValue] = useState(toTextValue(value));
    const [committedValue, setCommittedValue] = useState(value);
    const rootRef = useRef<HTMLDivElement>(null);

    const pickerColor = useMemo(() => toPickerColor(draftValue), [draftValue]);

    useEffect(() => {
        if (isOpen) return;
        setDraftValue(toTextValue(value));
        setCommittedValue(value);
    }, [value, isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        const handlePointerDown = (event: PointerEvent) => {
            if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                onChangeEnd?.(committedValue);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsOpen(false);
                onChangeEnd?.(committedValue);
            }
        };

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [committedValue, isOpen, onChangeEnd]);

    const commitValue = (nextValue: string) => {
        const normalized = parseInput(nextValue);

        if (!normalized.valid) {
            setDraftValue(toTextValue(committedValue));
            return;
        }

        setDraftValue(toTextValue(normalized.color));
        setCommittedValue(normalized.color);
        onChange(normalized.color);
        onChangeEnd?.(normalized.color);
    };

    const handlePickerChange = (nextValue: string) => {
        setDraftValue(nextValue);
        setCommittedValue(nextValue);
        onChange(nextValue);
    };

    const handleClose = () => {
        setIsOpen(false);
        setDraftValue(toTextValue(committedValue));
        onChangeEnd?.(committedValue);
    };

    const transparent = isTransparentValue(draftValue);

    return (
        <div ref={rootRef} className={`relative inline-flex ${className ?? ""}`}>
            <button
                type="button"
                title={label}
                aria-label={label}
                aria-expanded={isOpen}
                onClick={() => setIsOpen((current) => !current)}
                className={
                    `
                        relative h-7 w-7 overflow-hidden rounded-full border transition-all duration-150
                        ${isOpen ? "ring-2 ring-blue-500 ring-offset-2" : "hover:scale-110"}
                    `
                }
                style={
                    transparent
                        ? {
                              ...transparentBg,
                              borderColor: "#d1d5db",
                          }
                        : {
                              backgroundColor: pickerColor,
                              borderColor: "rgba(0,0,0,0.12)",
                          }
                }
            >
                <span className="absolute inset-0 flex items-center justify-center">
                    <span className="h-2.5 w-2.5 rounded-full bg-white/90 shadow-sm ring-1 ring-black/10" />
                </span>
            </button>

            {isOpen && (
                <div className="absolute left-0 top-full z-50 mt-3 w-72 rounded-2xl border border-neutral-200 bg-white p-3 shadow-2xl">
                    <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                            <div className="text-sm font-semibold text-neutral-900">Custom color</div>
                            <div className="text-[11px] text-neutral-500">Pick a color or type its hex value</div>
                        </div>
                        <button
                            type="button"
                            onClick={handleClose}
                            aria-label="Close color picker"
                            className="rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div
                        className="rounded-xl border border-neutral-200 p-2"
                        onPointerUpCapture={() => onChangeEnd?.(committedValue)}
                    >
                        <HexAlphaColorPicker
                            color={pickerColor}
                            onChange={handlePickerChange}
                            style={{ width: "100%" }}
                        />
                    </div>

                    <div className="mt-3 space-y-2">
                        <label className="block text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
                            Hex value
                        </label>
                        <input
                            type="text"
                            value={draftValue}
                            onChange={(event) => setDraftValue(event.target.value)}
                            onBlur={(event) => commitValue(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    commitValue(event.currentTarget.value);
                                    event.currentTarget.blur();
                                }
                            }}
                            spellCheck={false}
                            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-mono text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                            placeholder="#000000"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
