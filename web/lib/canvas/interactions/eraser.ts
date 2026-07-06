import { Point } from "@/lib/types";


export function handleEraser(points:Point[], e: "UP" | "DOWN" | "MOVE") {
  if (e === "UP") onPointerUp(points);
  else if (e === "MOVE") onPointerMove(points);
  else if (e === "DOWN") onPointerDown(points);
}

function onPointerDown(points: Point[]) {
  // Nothing
}

function onPointerMove(points: Point[]) {
  
}

function onPointerUp(points: Point[]) {

}
