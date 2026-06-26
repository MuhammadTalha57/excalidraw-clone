import { create } from "zustand";

type CameraStore = {
    offsetX: number;
    offsetY: number;
    zoom: number;

    setOffsetX: (x: number) => void;
    setOffsetY: (y: number) => void;
    setZoom: (z: number) => void;
};

export const useCameraStore = create<CameraStore>((set) => ({
    offsetX: 0,
    offsetY: 0,
    zoom: 1,

    setOffsetX: (offsetX) => set({ offsetX }),
    setOffsetY: (offsetY) => set({ offsetY }),
    setZoom: (zoom) => set({ zoom }),
}));
