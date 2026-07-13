import { CanvasElement, Point } from "@/lib/types";

const ERASER_HIT_RADIUS = 10;

export function hitTestEraser(point: Point, element: CanvasElement): boolean {
    switch (element.type) {
        case "rectangle":
        case "diamond":
        case "ellipse":
            return (
                point.x >= element.left - ERASER_HIT_RADIUS &&
                point.x <= element.right + ERASER_HIT_RADIUS &&
                point.y >= element.top - ERASER_HIT_RADIUS &&
                point.y <= element.bottom + ERASER_HIT_RADIUS
            );
        case "line":
        case "arrow":
            return distToSegment(point, element.p1, element.p2) <= ERASER_HIT_RADIUS;
        case "handdrawn": {
            if (element.points.length === 1) {
                return dist(point, element.points[0]) <= ERASER_HIT_RADIUS;
            }
            for (let i = 0; i < element.points.length - 1; i++) {
                if (
                    distToSegment(point, element.points[i], element.points[i + 1]) <=
                    ERASER_HIT_RADIUS
                ) {
                    return true;
                }
            }
            return false;
        }
        default:
            return false;
    }
}

function dist(a: Point, b: Point) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

function distToSegment(p: Point, a: Point, b: Point): number {
    const l2 = (b.x - a.x) ** 2 + (b.y - a.y) ** 2;
    if (l2 === 0) return dist(p, a);
    let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return dist(p, { x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) });
}