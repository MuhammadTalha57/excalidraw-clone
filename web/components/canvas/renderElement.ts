"use client";

import { worldToScreen } from "@/lib/coords";

export default function renderElement(
  ctx: CanvasRenderingContext2D,
  element: CanvasElement,
) {
  ctx.save();

  ctx.lineWidth = element.strokeWidth;
  ctx.strokeStyle = element.strokeColor;
  ctx.fillStyle = "rgba(0, 0, 0, 0)";
  if ("fillColor" in element) {
    ctx.fillStyle =
      element.fillColor === "transparent" ? "rgba(0,0,0,0)" : element.fillColor;
  }

  if (!element.isSelected) {
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

      case "handdrawn":
        renderDraw(ctx, element);
        break;
    }
  }

  ctx.restore();
}

function renderRectangle(ctx: CanvasRenderingContext2D, e: Rectangle) {
  ctx.save();

  ctx.lineJoin = "round";

  ctx.beginPath();
  // console.log("rect: ", e.x, e.y, e.width, e.height);
  ctx.roundRect(e.x, e.y, e.width, e.height, 15);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

function renderDiamond(ctx: CanvasRenderingContext2D, e: Diamond) {
  ctx.save();

  ctx.lineJoin = "round";

  const cx = e.x + e.width / 2;
  const cy = e.y + e.height / 2;

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

function renderEllipse(ctx: CanvasRenderingContext2D, e: Ellipse) {
  ctx.save();

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

function renderLine(ctx: CanvasRenderingContext2D, e: Line) {
  ctx.save();

  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(e.p1.x, e.p1.y);
  ctx.lineTo(e.p2.x, e.p2.y);
  ctx.stroke();

  ctx.restore();
}

function renderArrow(ctx: CanvasRenderingContext2D, e: Arrow) {
  ctx.save();

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const startX = e.p1.x;
  const startY = e.p1.y;
  const endX = e.p2.x;
  const endY = e.p2.y;

  // Shaft
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();

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

function renderDraw(ctx: CanvasRenderingContext2D, e: HandDrawn) {
  ctx.save();

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const points = e.points;

  if (!points || points.length === 0) {
    ctx.restore();
    return;
  }

  // Single click with no movement -> draw a tiny dot
  console.log(points.length);
  if (points.length === 1) {
    const p = points[0];
    ctx.beginPath();
    ctx.arc(p.x, p.y, (ctx.lineWidth || 1) / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  // Smooth the path by curving through midpoints instead of
  // drawing straight segments point-to-point. This is what gives
  // freehand strokes their soft, hand-drawn feel like Excalidraw's
  // pencil tool, without needing a separate stroke-smoothing library.
  for (let i = 1; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    const midX = (curr.x + next.x) / 2;
    const midY = (curr.y + next.y) / 2;

    ctx.quadraticCurveTo(curr.x, curr.y, midX, midY);
  }

  // Final segment to the last actual point so the stroke doesn't
  // stop short of where the pointer was released.
  const last = points[points.length - 1];
  ctx.lineTo(last.x, last.y);

  ctx.stroke();

  ctx.restore();
}
