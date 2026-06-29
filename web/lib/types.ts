type Point = {
    x: number;
    y: number;
};

// type CanvasElement = {
//     id: string;
//     type: string;
//     strokeWidth: number;
//     strokeColor: string;
//     fillColor: string;
//     x1: number;
//     y1: number;
//     x2: number;
//     y2: number;
//     x: number;
//     y: number;
//     width: number;
//     height: number;
//     points?: Point[];
// };

type CanvasBaseElement = {
    // type: string;
    strokeWidth: number;
    strokeColor: string;
};

type Rectangle = CanvasBaseElement & {
    type: "rectangle",
    fillColor: string;
    x: number;
    y: number;
    width: number;
    height: number;
};

type Diamond = Omit<Rectangle, "type"> & { type: "diamond" };
type Ellipse = Omit<Rectangle, "type"> & { type: "ellipse" };

type Line = CanvasBaseElement & {
    type: "line",
    p1: Point,
    p2: Point,
};

type Arrow = Omit<Line, "type"> & { type: "arrow" };

type HandDrawn = CanvasBaseElement & {
    type: "handdrawn",
    points: Point[],
};


type CanvasElement = Rectangle | Diamond | Ellipse | Line | Arrow | HandDrawn;

type Tool =
    | "select"
    | "rectangle"
    | "diamond"
    | "ellipse"
    | "line"
    | "arrow"
    | "text"
    | "draw"
    | "hand";

// type PreviewElementStore = {
//     previewElement: CanvasBaseElement | null;

//     setPreviewElement: (element: CanvasBaseElement | null) => void;

//     clearPreviewElement: () => void;
// };
