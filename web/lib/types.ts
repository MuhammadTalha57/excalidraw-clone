type Point = {
    x: number;
    y: number;
};

type CanvasBaseElement = {
    // type: string;
    strokeWidth: number;
    strokeColor: string;

    top: number,
    bottom: number,
    left: number,
    right: number,

    isSelected: boolean;
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


