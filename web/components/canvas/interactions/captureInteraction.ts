import { PointerEvent } from "react";

let x = 0;
let y = 0;
let pointerDown = false;

function onPointerDown(e: PointerEvent<HTMLCanvasElement>) {
    pointerDown = true;
    console.log(e.clientX, e.clientY);
    x = e.clientX;
    y = e.clientY;
}
function onPointerUp(e: PointerEvent<HTMLCanvasElement>) {
    pointerDown = false;
    console.log(x, y, e.clientX, e.clientY);
}

function onPointerMove(e: PointerEvent<HTMLCanvasElement>) {
    if (pointerDown) {
        console.log("MOVE");
    }
}

export default function pointerHandler() {
    return { onPointerDown, onPointerUp, onPointerMove };
}
