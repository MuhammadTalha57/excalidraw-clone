import { screenToWorld } from "@/lib/coords";
import { useCameraStore } from "@/stores/useCamera";
import { WheelEvent } from "react";

const zoomDelta = 0.01;

export function handleZoom(e: WheelEvent<HTMLCanvasElement>) {
  if (!e.ctrlKey) return;
  e.preventDefault();

  const camera = useCameraStore.getState();

  const worldCoords = screenToWorld(e.clientX, e.clientY);

  const factor = e.deltaY < 0 ? zoomDelta : -zoomDelta;
  const newZoom = camera.zoom + factor;
  camera.setCamera(
    newZoom,
    e.clientX - worldCoords.x * newZoom,
    e.clientY - worldCoords.y * newZoom,
  );
}
