import { useEffect } from "react";
import { getSocket } from "@/lib/socket";
import throttle from "lodash.throttle"; // npm install lodash.throttle
import { screenToWorld } from "@/utils/coords";

export function useEmitCursorMove() {
    useEffect(() => {
        const socket = getSocket();

        const handlePointerMove = throttle((e: PointerEvent) => {
            console.log("GOT MOVE");
            if (socket && socket.connected) {
                socket.emit("cursor-move", {
                    ...screenToWorld(e.clientX, e.clientY)
                });
            }
        }, 50);

        window.addEventListener("pointermove", handlePointerMove);

        return () => {
            window.removeEventListener("pointermove", handlePointerMove);
            handlePointerMove.cancel();
        };
    }, []);
}
