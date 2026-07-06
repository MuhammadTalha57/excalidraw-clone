export type Point = {
    x: number;
    y: number;
};

export type CanvasBaseElement = {
    strokeWidth: number;
    strokeColor: string;

    top: number,
    bottom: number,
    left: number,
    right: number,

    isSelected: boolean;
    id: string;
};

export type Rectangle = CanvasBaseElement & {
    type: "rectangle",
    fillColor: string;
    x: number;
    y: number;
    width: number;
    height: number;
};

export type Diamond = Omit<Rectangle, "type"> & { type: "diamond" };
export type Ellipse = Omit<Rectangle, "type"> & { type: "ellipse" };

export type Line = CanvasBaseElement & {
    type: "line",
    p1: Point,
    p2: Point,
};

export type Arrow = Omit<Line, "type"> & { type: "arrow" };

export type HandDrawn = CanvasBaseElement & {
    type: "handdrawn",
    points: Point[],
};


export type CanvasElement = Rectangle | Diamond | Ellipse | Line | Arrow | HandDrawn;