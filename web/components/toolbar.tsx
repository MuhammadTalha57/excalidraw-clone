"use client";

import { useSelectedToolStore } from "@/stores/useSelectedTool";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";

export type ToolbarItem = {
    name: string;
    icon: ReactNode;
    selectedIcon?: ReactNode;
    className?: string;
    selectedClassName?: string;
};

export const defaultToolbarItems: ToolbarItem[] = [
    {
        name: "select",
        icon: <SelectIcon />,
        selectedIcon: <SelectIcon active />,
    },
    {
        name: "hand",
        icon: <HandIcon />,
        selectedIcon: <HandIcon active />,
    },
    {
        name: "rectangle",
        icon: <RectangleIcon />,
        selectedIcon: <RectangleIcon active />,
    },
    {
        name: "diamond",
        icon: <DiamondIcon />,
        selectedIcon: <DiamondIcon active />,
    },
    {
        name: "ellipse",
        icon: <EllipseIcon />,
        selectedIcon: <EllipseIcon active />,
    },
    {
        name: "arrow",
        icon: <ArrowIcon />,
        selectedIcon: <ArrowIcon active />,
    },
    {
        name: "line",
        icon: <LineIcon />,
        selectedIcon: <LineIcon active />,
    },
    {
        name: "draw",
        icon: <DrawIcon />,
        selectedIcon: <DrawIcon active />,
    },
    {
        name: "text",
        icon: <TextIcon />,
        selectedIcon: <TextIcon active />,
    },
    {
        name: "image",
        icon: <ImageIcon />,
        selectedIcon: <ImageIcon active />,
    },
    {
        name: "eraser",
        icon: <EraserIcon />,
        selectedIcon: <EraserIcon active />,
    },
];

const ITEM_SIZE = 44;
const ITEM_GAP = 6;
const GROUP_GAP = 14;
const OUTER_PADDING = 8;

const TOOL_GROUPS = new Map<string, number>([
    ["select", 0],
    ["hand", 0],
    ["rectangle", 1],
    ["diamond", 1],
    ["ellipse", 1],
    ["arrow", 1],
    ["line", 1],
    ["draw", 2],
    ["text", 2],
    ["image", 2],
    ["eraser", 2],
]);

export default function Toolbar({
    items = defaultToolbarItems,
    className = "",
}: {
    items?: ToolbarItem[];
    className?: string;
}) {
    const [isScrollable, setIsScrollable] = useState(false);
    const toolbarRef = useRef<HTMLDivElement | null>(null);

    const selectedTool = useSelectedToolStore().selectedTool;
    const setSelectedTool = useSelectedToolStore().setSelectedTool;
    const naturalWidth = useMemo(() => {
        if (items.length === 0) return 0;

        let width = OUTER_PADDING * 2;

        items.forEach((item, index) => {
            width += ITEM_SIZE;

            if (index < items.length - 1) {
                const currentGroup = TOOL_GROUPS.get(item.name) ?? 0;
                const nextGroup = TOOL_GROUPS.get(items[index + 1].name) ?? 0;
                width += currentGroup === nextGroup ? ITEM_GAP : GROUP_GAP;
            }
        });

        return width;
    }, [items]);

    useEffect(() => {
        const updateMode = () => {
            const availableWidth = window.innerWidth;
            setIsScrollable(naturalWidth > availableWidth);
        };

        updateMode();
        window.addEventListener("resize", updateMode);

        return () => window.removeEventListener("resize", updateMode);
    }, [naturalWidth]);

    return (
        <div
            className={`pointer-events-auto hover:cursor-pointer ${className}`}
            ref={toolbarRef}
        >
            <div
                className="rounded-full border border-[#d5cec2] bg-[#f6f1e8] px-2 py-2 shadow-[0_16px_40px_rgba(15,23,42,0.16)] backdrop-blur"
                style={{
                    width: isScrollable ? "80vw" : "fit-content",
                    maxWidth: isScrollable ? "80vw" : "100%",
                    overflowX: isScrollable ? "auto" : "visible",
                    scrollbarWidth: "none",
                }}
            >
                <div className="flex items-center whitespace-nowrap">
                    {items.map((item, index) => {
                        const isSelected = selectedTool === item.name;
                        const group = TOOL_GROUPS.get(item.name) ?? 0;
                        const prevGroup =
                            index > 0
                                ? (TOOL_GROUPS.get(items[index - 1].name) ?? 0)
                                : group;
                        const needsDivider = index > 0 && group !== prevGroup;
                        const icon =
                            isSelected && item.selectedIcon
                                ? item.selectedIcon
                                : item.icon;

                        return (
                            <div key={item.name} className="flex items-center">
                                {needsDivider ? (
                                    <span
                                        aria-hidden="true"
                                        className="mx-1 h-7 w-px bg-[#ddd5c7]"
                                    />
                                ) : null}
                                <button
                                    type="button"
                                    aria-label={item.name}
                                    aria-pressed={isSelected}
                                    title={item.name}
                                    onClick={() =>
                                        setSelectedTool(item.name as Tool)
                                    }
                                    className={`hover:cursor-pointer flex h-11 w-11 items-center justify-center rounded-full border border-transparent text-[#5e564b] transition-all duration-150 hover:-translate-y-px hover:bg-white/80 hover:text-[#1f1b16] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c77a1f]/35 ${
                                        isSelected
                                            ? "border-[#d7b18a] bg-white text-[#1f1b16] shadow-[0_6px_18px_rgba(15,23,42,0.08)]"
                                            : "bg-transparent"
                                    } ${isSelected ? (item.selectedClassName ?? "") : (item.className ?? "")}`}
                                >
                                    {icon}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function SelectIcon({ active = false }: { active?: boolean }) {
    return (
        <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path
                d="M5 4l6.5 14 2-6 6-2-14.5-6z"
                fill={active ? "currentColor" : "none"}
                opacity={active ? 0.14 : 1}
            />
            <path d="M5 4l6.5 14 2-6 6-2-14.5-6z" />
        </svg>
    );
}

function HandIcon({ active = false }: { active?: boolean }) {
    return (
        <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M8.5 11.2V6.9a1.5 1.5 0 0 1 3 0v4.2" />
            <path d="M11.5 10.9V5.8a1.5 1.5 0 0 1 3 0v5.1" />
            <path d="M14.5 11V7.8a1.5 1.5 0 0 1 3 0V13" />
            <path
                d="M7 12.5V9.8a1.5 1.5 0 0 0-3 0v5.2c0 3.5 2.6 6 6.4 6h2.7c3.7 0 6.8-2.9 6.8-6.8V11"
                fill={active ? "currentColor" : "none"}
                opacity={active ? 0.14 : 1}
            />
            <path d="M7 12.5V9.8a1.5 1.5 0 0 0-3 0v5.2c0 3.5 2.6 6 6.4 6h2.7c3.7 0 6.8-2.9 6.8-6.8V11" />
        </svg>
    );
}

function RectangleIcon({ active = false }: { active?: boolean }) {
    return (
        <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
        >
            <rect
                x="5"
                y="6"
                width="14"
                height="12"
                rx="1.5"
                fill={active ? "currentColor" : "none"}
                opacity={active ? 0.14 : 1}
            />
            <rect x="5" y="6" width="14" height="12" rx="1.5" />
        </svg>
    );
}

function DiamondIcon({ active = false }: { active?: boolean }) {
    return (
        <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
        >
            <path
                d="M12 4.5 19 12l-7 7.5L5 12l7-7.5Z"
                fill={active ? "currentColor" : "none"}
                opacity={active ? 0.14 : 1}
            />
            <path d="M12 4.5 19 12l-7 7.5L5 12l7-7.5Z" />
        </svg>
    );
}

function EllipseIcon({ active = false }: { active?: boolean }) {
    return (
        <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <ellipse
                cx="12"
                cy="12"
                rx="7"
                ry="5.5"
                fill={active ? "currentColor" : "none"}
                opacity={active ? 0.14 : 1}
            />
            <ellipse cx="12" cy="12" rx="7" ry="5.5" />
        </svg>
    );
}

function ArrowIcon({ active = false }: { active?: boolean }) {
    return (
        <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path
                d="M6 18 18 6"
                fill={active ? "currentColor" : "none"}
                opacity={active ? 0.14 : 1}
            />
            <path d="M13 6h5v5" />
            <path d="M6 18 18 6" />
        </svg>
    );
}

function LineIcon({ active = false }: { active?: boolean }) {
    return (
        <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
        >
            <path
                d="M6 18 18 6"
                fill={active ? "currentColor" : "none"}
                opacity={active ? 0.14 : 1}
            />
            <path d="M6 18 18 6" />
        </svg>
    );
}

function DrawIcon({ active = false }: { active?: boolean }) {
    return (
        <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path
                d="M5 19l2-.5 9-9a1.7 1.7 0 0 0 0-2.4 1.7 1.7 0 0 0-2.4 0l-9 9L4 19z"
                fill={active ? "currentColor" : "none"}
                opacity={active ? 0.14 : 1}
            />
            <path d="M5 19l2-.5 9-9a1.7 1.7 0 0 0 0-2.4 1.7 1.7 0 0 0-2.4 0l-9 9L4 19z" />
        </svg>
    );
}

function TextIcon({ active = false }: { active?: boolean }) {
    return (
        <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 7h14" />
            <path d="M12 7v10" />
            <path
                d="M9 17h6"
                fill={active ? "currentColor" : "none"}
                opacity={active ? 0.14 : 1}
            />
            <path d="M9 17h6" />
        </svg>
    );
}

function ImageIcon({ active = false }: { active?: boolean }) {
    return (
        <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect
                x="5"
                y="5"
                width="14"
                height="14"
                rx="2"
                fill={active ? "currentColor" : "none"}
                opacity={active ? 0.14 : 1}
            />
            <circle cx="9" cy="9" r="1.3" />
            <path d="m8 15 2.2-2.2a1 1 0 0 1 1.4 0L14 15l1.2-1.2a1 1 0 0 1 1.4 0L19 16.2" />
        </svg>
    );
}

function EraserIcon({ active = false }: { active?: boolean }) {
    return (
        <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path
                d="m8 17 9-9a1.8 1.8 0 0 1 2.5 0l1.2 1.2a1.8 1.8 0 0 1 0 2.5l-9 9H7l-3.5-3.5a1.8 1.8 0 0 1 0-2.5L6.3 12"
                fill={active ? "currentColor" : "none"}
                opacity={active ? 0.14 : 1}
            />
            <path d="m8 17 9-9" />
        </svg>
    );
}
