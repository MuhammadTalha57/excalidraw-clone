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
    }
}

function renderRectangle(ctx: CanvasRenderingContext2D, rect: Rectangle) {
    ctx.save();

    ctx.fillStyle = rect.fillColor;
    ctx.strokeStyle = rect.strokeColor;
    ctx.roundRect(rect.x, rect.y, rect.width, rect.height, 15);
    ctx.stroke();
    // ctx.fillRect(rect.x, rect.y, rect.width, rect.height);

    ctx.restore();
}
