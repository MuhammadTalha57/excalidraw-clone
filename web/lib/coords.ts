import { useCameraStore } from "@/stores/useCamera";

export function screenToWorld(x: number, y: number) {
    const camera = useCameraStore.getState();
    console.log(camera, "COORDS");
    return {
        x: (x + camera.offsetX) / camera.zoom,
        y: (y + camera.offsetY) / camera.zoom,
    };
}

export function worldToScreen(x: number, y: number) {
    const camera = useCameraStore.getState();
    return {
        x: x * camera.zoom - camera.offsetX,
        y: y * camera.zoom - camera.offsetY,
    };
}
