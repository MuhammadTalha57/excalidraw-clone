import { useCameraStore } from "@/stores/useCamera";


const setOffsetX = useCameraStore.getState().setOffsetX;
const setOffsetY = useCameraStore.getState().setOffsetY;

const PAN_SPEED = 1.0;

export function handleHand(points: Point[], e: "UP" | "DOWN" | "MOVE") {
  if (e === "MOVE") {
    onPointerMove(points);
  }
}

function onPointerMove(points: Point[]) {
  // Assuming Only calls when Pointer is down
  if (points.length < 2) return;

  // Calculate current delta
  let deltaX = points[points.length - 1].x - points[points.length - 2].x;
  let deltaY = points[points.length - 1].y - points[points.length - 2].y;

  setOffsetX(useCameraStore.getState().offsetX + deltaX * PAN_SPEED);
  setOffsetY(useCameraStore.getState().offsetY - deltaY * PAN_SPEED);
}
