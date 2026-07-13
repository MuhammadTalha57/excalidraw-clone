import { screenToWorld } from "@/utils/coords";
import { useCameraStore } from "@/stores/useCamera";
import { WheelEvent } from "react";

const zoomDelta = 0.05;

export function handleZoom(e: WheelEvent<HTMLCanvasElement>) {
  if (!e.ctrlKey) return;
  e.preventDefault();

  const camera = useCameraStore.getState();

  const factor = e.deltaY < 0 ? zoomDelta : -zoomDelta;

  const world = screenToWorld(e.clientX, e.clientY);

  const newZoom = Math.max(0.1, camera.zoom + factor);

  camera.setCamera(
    newZoom,
    world.x - e.clientX / newZoom,
    world.y - e.clientY / newZoom,
  );
}
