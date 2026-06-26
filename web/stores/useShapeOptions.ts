import { create } from "zustand";

type ShapeOptionsStore = {
    strokeColor: string;
    fillColor: string;
    strokeWidth: number;

    setStrokeColor: (color: string) => void;
    setFillColor: (color: string) => void;
    setStrokeWidth: (width: number) => void;
};

export const useShapeOptionsStore = create<ShapeOptionsStore>((set) => ({
    strokeColor: "#1e1e1e",
    fillColor: "transparent",
    strokeWidth: 2,

    setStrokeColor: (strokeColor) => set({ strokeColor }),
    setFillColor: (fillColor) => set({ fillColor }),
    setStrokeWidth: (strokeWidth) => set({ strokeWidth }),
}));
