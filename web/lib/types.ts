import { generateId } from "./id";

export type Point = {
    x: number;
    y: number;
};

export type CanvasBaseElement = {
    // type: string;
    strokeWidth: number;
    strokeColor: string;

    top: number,
    bottom: number,
    left: number,
    right: number,

    isSelected: boolean;
    // isErased: boolean;
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

export type Tool =
    | "select"
    | "rectangle"
    | "diamond"
    | "ellipse"
    | "line"
    | "arrow"
    | "draw"
    | "eraser"
    | "hand";


export type HandleName = "nw" | "n" | "ne" | "w" | "e" | "sw" | "s" | "se" | "p1" | "p2";

export type SelectionHitTarget =
  | { type: "handle"; handle: HandleName; element: CanvasElement }
  | { type: "body"; element: CanvasElement }
  | { type: "none" };

  