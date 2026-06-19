import { useState, useEffect } from "react";

export function usePointerTracker() {
    const [pointer, setPointer] = useState({
        x: 0,
        y: 0,
        isDown: false,
    });

    useEffect(() => {
        // 1. Handle pointer downward press
        const handlePointerDown = (e: PointerEvent) => {
            setPointer((prev) => ({
                ...prev,
                isDown: true,
                x: e.clientX,
                y: e.clientY,
            }));
        };

        // 2. Handle pointer movement
        const handlePointerMove = (e: PointerEvent) => {
            setPointer((prev) => ({ ...prev, x: e.clientX, y: e.clientY }));
        };

        // 3. Handle pointer release
        const handlePointerUp = () => {
            setPointer((prev) => ({ ...prev, isDown: false }));
        };

        // Attach global listeners
        window.addEventListener("pointerdown", handlePointerDown);
        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", handlePointerUp);

        // Clean up all listeners on unmount
        return () => {
            window.removeEventListener("pointerdown", handlePointerDown);
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", handlePointerUp);
        };
    }, []);

    return pointer;
}
