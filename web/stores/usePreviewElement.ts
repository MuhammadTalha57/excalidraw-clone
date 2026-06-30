import { CanvasElement } from "@/lib/types";
import { create } from "zustand";

type PreviewElementStore = {
    previewElement: CanvasElement | null;

    setPreviewElement: (element: CanvasElement | null) => void;

    clearPreviewElement: () => void;
};

export const usePreviewElementStore = create<PreviewElementStore>((set) => ({
    previewElement: null,

    setPreviewElement: (element) => set({ previewElement: element }),

    clearPreviewElement: () => set({ previewElement: null }),
}));
