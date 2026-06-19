type element = {
    id: string;
    strokeColor: string;
    fillColor: string;
};

type Rectangle = element & {
    // Top Left
    x: number;
    y: number;
    width: number;
    height: number;
};
