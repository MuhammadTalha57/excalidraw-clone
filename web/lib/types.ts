type BaseElement = {
    id: string;
    type: string;
    strokeColor: string;
    fillColor: string;
};

type Rectangle = BaseElement & {
    // Top Left
    x: number;
    y: number;
    width: number;
    height: number;
};

type CanvasElement = Rectangle;
