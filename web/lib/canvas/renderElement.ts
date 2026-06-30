"use client";

// ─── Constants ───────────────────────────────────────────────────────────────

const SELECTION_COLOR = "#4C6FFF";
const HANDLE_SIZE = 8;

// ─── Public API ──────────────────────────────────────────────────────────────

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

  switch (element.type) {
    case "rectangle":  renderRectangle(ctx, element); break;
    case "diamond":    renderDiamond(ctx, element);   break;
    case "ellipse":    renderEllipse(ctx, element);   break;
    case "line":       renderLine(ctx, element);      break;
    case "arrow":      renderArrow(ctx, element);     break;
    case "handdrawn":  renderDraw(ctx, element);      break;
  }

  if (element.isSelected) {
    renderSelectionOverlay(ctx, element);
  }

  ctx.restore();
}

// ─── Selection overlay ───────────────────────────────────────────────────────

function renderSelectionOverlay(
  ctx: CanvasRenderingContext2D,
  element: CanvasElement,
) {
  ctx.save();
  ctx.strokeStyle = SELECTION_COLOR;
  ctx.fillStyle = "#ffffff";
  ctx.lineWidth = 1.5;

  if (element.type === "line" || element.type === "arrow") {
    // Just 2 endpoint handles — no bounding box needed
    renderHandle(ctx, element.p1.x, element.p1.y);
    renderHandle(ctx, element.p2.x, element.p2.y);
  } else {
    // Dashed bounding box
    const pad = 6;
    const x = element.left  - pad;
    const y = element.top   - pad;
    const w = (element.right  - element.left) + pad * 2;
    const h = (element.bottom - element.top)  + pad * 2;

    ctx.setLineDash([5, 4]);
    ctx.strokeRect(x, y, w, h);
    ctx.setLineDash([]);

    // 8 handles at corners + edge midpoints
    const cx = x + w / 2;
    const cy = y + h / 2;
    for (const [hx, hy] of [
      [x,      y     ], [cx,     y     ], [x + w,  y     ],
      [x,      cy    ],                   [x + w,  cy    ],
      [x,      y + h ], [cx,     y + h ], [x + w,  y + h ],
    ]) {
      renderHandle(ctx, hx, hy);
    }
  }

  ctx.restore();
}

function renderHandle(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const half = HANDLE_SIZE / 2;
  ctx.fillRect(x - half, y - half, HANDLE_SIZE, HANDLE_SIZE);
  ctx.strokeRect(x - half, y - half, HANDLE_SIZE, HANDLE_SIZE);
}

// ─── Shape renderers ─────────────────────────────────────────────────────────

function renderRectangle(ctx: CanvasRenderingContext2D, e: Rectangle) {
  ctx.save();
  ctx.lineJoin = "round";
  ctx.beginPath();
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
  drawRoundedPolygon(ctx, [
    { x: cx,           y: e.y            },
    { x: e.x + e.width, y: cy            },
    { x: cx,           y: e.y + e.height },
    { x: e.x,          y: cy             },
  ], 12);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function renderEllipse(ctx: CanvasRenderingContext2D, e: Ellipse) {
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(
    e.x + e.width / 2, e.y + e.height / 2,
    Math.abs(e.width) / 2, Math.abs(e.height) / 2,
    0, 0, Math.PI * 2,
  );
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
  ctx.lineCap  = "round";
  ctx.lineJoin = "round";

  ctx.beginPath();
  ctx.moveTo(e.p1.x, e.p1.y);
  ctx.lineTo(e.p2.x, e.p2.y);
  ctx.stroke();

  const angle     = Math.atan2(e.p2.y - e.p1.y, e.p2.x - e.p1.x);
  const headLen   = 20;
  const headAngle = Math.PI / 7;

  ctx.beginPath();
  ctx.moveTo(
    e.p2.x - headLen * Math.cos(angle - headAngle),
    e.p2.y - headLen * Math.sin(angle - headAngle),
  );
  ctx.lineTo(e.p2.x, e.p2.y);
  ctx.lineTo(
    e.p2.x - headLen * Math.cos(angle + headAngle),
    e.p2.y - headLen * Math.sin(angle + headAngle),
  );
  ctx.stroke();

  ctx.restore();
}

function renderDraw(ctx: CanvasRenderingContext2D, e: HandDrawn) {
  ctx.save();
  ctx.lineCap  = "round";
  ctx.lineJoin = "round";

  const pts = e.points;
  if (!pts || pts.length === 0) { ctx.restore(); return; }

  if (pts.length === 1) {
    ctx.beginPath();
    ctx.arc(pts[0].x, pts[0].y, (ctx.lineWidth || 1) / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length - 1; i++) {
    const mid = { x: (pts[i].x + pts[i + 1].x) / 2, y: (pts[i].y + pts[i + 1].y) / 2 };
    ctx.quadraticCurveTo(pts[i].x, pts[i].y, mid.x, mid.y);
  }
  ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
  ctx.stroke();

  ctx.restore();
}

// ─── Polygon helper ───────────────────────────────────────────────────────────

function drawRoundedPolygon(
  ctx: CanvasRenderingContext2D,
  points: { x: number; y: number }[],
  radius: number,
) {
  const n = points.length;
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const prev = points[(i - 1 + n) % n];
    const curr = points[i];
    const next = points[(i + 1)     % n];
    const toPrev = normalize(curr.x - prev.x, curr.y - prev.y);
    const toNext = normalize(curr.x - next.x, curr.y - next.y);
    const r = Math.min(radius, dist(curr, prev) / 2, dist(curr, next) / 2);
    const start = { x: curr.x - toPrev.x * r, y: curr.y - toPrev.y * r };
    const end   = { x: curr.x - toNext.x * r, y: curr.y - toNext.y * r };
    if (i === 0) ctx.moveTo(start.x, start.y);
    else         ctx.lineTo(start.x, start.y);
    ctx.quadraticCurveTo(curr.x, curr.y, end.x, end.y);
  }
  ctx.closePath();
}

function normalize(x: number, y: number) {
  const len = Math.hypot(x, y) || 1;
  return { x: x / len, y: y / len };
}

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}