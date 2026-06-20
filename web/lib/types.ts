type BaseElement = {
    id: string;
    type: string;
    strokeColor: string;
    fillColor: string;
    x: number;
    y: number;
    width: number;
    height: number;
};

type Rectangle = BaseElement & {
    // Top Left
    x: number;
    y: number;
    width: number;
    height: number;
};

type CanvasElement = BaseElement;

type Interaction =
    | "idle"
    | "drawing"
    | "selecting"
    | "dragging"
    | "resizing"
    | "panning";
// | { type: "dragging"; elementId: string; offsetX: number; offsetY: number }
// | { type: "resizing"; elementId: string; handle: ResizeHandle }
// | { type: "panning"; startX: number; startY: number };

type Tool = "select" | "rectangle" | "ellipse" | "line" | "text" | "hand";
