export function getBoundingRectangle(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
) {
    const width = Math.abs(x1 - x2);
    const height = Math.abs(y1 - y2);
    const x = Math.min(x1, x2);
    const y = Math.min(y1, y2);

    return { x, y, width, height };
}
