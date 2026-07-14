import React from "react";
import { useRemoteCursorStore } from "@/stores/useRemoteCursor";

export const RemoteCursors = () => {
    const cursors = useRemoteCursorStore((state) => state.cursors);

    return (
        <div style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none", zIndex: 9999 }}>
            {Object.entries(cursors).map(([socketId, cursor]) => (
                <div
                    key={socketId}
                    style={{
                        position: "absolute",
                        left: cursor.x,
                        top: cursor.y,
                        transition: "left 0.1s linear, top 0.1s linear",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <svg width="24" height="36" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M5.65376 2.13815C5.16607 1.2582 3.83393 1.2582 3.34624 2.13815L0.219502 7.7816C-0.342938 8.79685 0.388836 10.0573 1.54585 10.0573H3.01633L4.5 18H8.5L7.43977 10.0573H10.1517C11.3653 10.0573 12.0911 8.70588 11.4468 7.64415L5.65376 2.13815Z"
                            fill={cursor.color}
                            stroke="white"
                            strokeWidth="1.5"
                        />
                    </svg>
                    
                    <div 
                        style={{
                            backgroundColor: "#FF5733",
                            color: "white",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "bold",
                            marginTop: "4px",
                            whiteSpace: "nowrap",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                        }}
                    >
                        {cursor.name}
                    </div>
                </div>
            ))}
        </div>
    );
};