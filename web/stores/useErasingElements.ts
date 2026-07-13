import { create } from "zustand";

type ErasingElementsStore = {
    erasingIds: Set<string>;

    addErasingId: (id: string) => void;
    clearErasingIds: () => void;
};

export const useErasingElementsStore = create<ErasingElementsStore>((set) => ({
    erasingIds: new Set(),

    addErasingId: (id) =>
        set((state) => {
            if (state.erasingIds.has(id)) return state;
            const next = new Set(state.erasingIds);
            next.add(id);
            return { erasingIds: next };
        }),

    clearErasingIds: () => set({ erasingIds: new Set() }),
}));