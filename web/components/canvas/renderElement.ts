"use client";

export default function renderElement(
    ctx: CanvasRenderingContext2D,
    element: CanvasElement,
) {
    if (!ctx) return;

    switch (element.type) {
        case "rectangle":
            renderRectangle(ctx, element);
            break;
        case "diamond":
            renderDiamond(ctx, element);
            break;
        case "ellipse":
            renderEllipse(ctx, element);
            break;
        case "line":
            renderLine(ctx, element);
            break;
        case "arrow":
            renderArrow(ctx, element);
            break;
    }
}

function renderRectangle(ctx: CanvasRenderingContext2D, e: CanvasElement) {
    ctx.save();

    // ctx.fillStyle = e.fillColor;
    // ctx.strokeStyle = e.strokeColor;
    ctx.lineJoin = "round";

    ctx.beginPath();
    console.log("rect: ", e.x, e.y, e.width, e.height);
    ctx.roundRect(e.x, e.y, e.width, e.height, 15);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
}

function renderDiamond(ctx: CanvasRenderingContext2D, e: CanvasElement) {
    ctx.save();

    // ctx.fillStyle = e.fillColor;
    // ctx.strokeStyle = e.strokeColor;
    ctx.lineJoin = "round";

    const cx = e.x + e.width / 2;
    const cy = e.y + e.height / 2;

    // 4 vertices of the diamond, inscribed in the bounding box
    const points = [
        { x: cx, y: e.y }, // top
        { x: e.x + e.width, y: cy }, // right
        { x: cx, y: e.y + e.height }, // bottom
        { x: e.x, y: cy }, // left
    ];

    drawRoundedPolygon(ctx, points, 12);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
}

function renderEllipse(ctx: CanvasRenderingContext2D, e: CanvasElement) {
    ctx.save();

    // ctx.fillStyle = e.fillColor;
    // ctx.strokeStyle = e.strokeColor;

    const cx = e.x + e.width / 2;
    const cy = e.y + e.height / 2;
    const rx = Math.abs(e.width) / 2;
    const ry = Math.abs(e.height) / 2;

    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
}

function renderLine(ctx: CanvasRenderingContext2D, e: CanvasElement) {
    ctx.save();

    // ctx.strokeStyle = e.strokeColor;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(e.x1, e.y1);
    ctx.lineTo(e.x2, e.y2);
    ctx.stroke();

    ctx.restore();
}

function renderArrow(ctx: CanvasRenderingContext2D, e: CanvasElement) {
    ctx.save();

    // ctx.strokeStyle = e.strokeColor;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const startX = e.x1;
    const startY = e.y1;
    const endX = e.x2;
    const endY = e.y2;

    // Shaft
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Arrowhead (open "V" style, like Excalidraw's default arrow)
    const angle = Math.atan2(endY - startY, endX - startX);
    const headLength = 20;
    const headAngle = Math.PI / 7; // ~25.7deg spread

    ctx.beginPath();
    ctx.moveTo(
        endX - headLength * Math.cos(angle - headAngle),
        endY - headLength * Math.sin(angle - headAngle),
    );
    ctx.lineTo(endX, endY);
    ctx.lineTo(
        endX - headLength * Math.cos(angle + headAngle),
        endY - headLength * Math.sin(angle + headAngle),
    );
    ctx.stroke();

    ctx.restore();
}
/**
 * Draws a closed polygon path with rounded corners by inserting a
 * quadraticCurveTo at each vertex. Used for the diamond so its corners
 * feel soft like Excalidraw's rather than sharp/pointy.
 */
function drawRoundedPolygon(
    ctx: CanvasRenderingContext2D,
    points: { x: number; y: number }[],
    radius: number,
) {
    const len = points.length;

    ctx.beginPath();

    for (let i = 0; i < len; i++) {
        const curr = points[i];
        const prev = points[(i - 1 + len) % len];
        const next = points[(i + 1) % len];

        const toPrev = normalize(curr.x - prev.x, curr.y - prev.y);
        const toNext = normalize(curr.x - next.x, curr.y - next.y);

        const r = Math.min(
            radius,
            distance(curr, prev) / 2,
            distance(curr, next) / 2,
        );

        const start = {
            x: curr.x - toPrev.x * r,
            y: curr.y - toPrev.y * r,
        };
        const end = {
            x: curr.x - toNext.x * r,
            y: curr.y - toNext.y * r,
        };

        if (i === 0) {
            ctx.moveTo(start.x, start.y);
        } else {
            ctx.lineTo(start.x, start.y);
        }

        ctx.quadraticCurveTo(curr.x, curr.y, end.x, end.y);
    }

    ctx.closePath();
}

function normalize(x: number, y: number) {
    const len = Math.hypot(x, y) || 1;
    return { x: x / len, y: y / len };
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}
