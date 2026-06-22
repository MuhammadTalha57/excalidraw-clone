type CanvasElement = {
    id: string;
    type: string;
    strokeColor: string;
    fillColor: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    x: number;
    y: number;
    width: number;
    height: number;
};

type Tool =
    | "select"
    | "rectangle"
    | "diamond"
    | "ellipse"
    | "line"
    | "arrow"
    | "text"
    | "hand";

type PreviewElementStore = {
    previewElement: CanvasElement | null;

    setPreviewElement: (element: CanvasElement | null) => void;

    clearPreviewElement: () => void;
};
