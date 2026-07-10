import { z } from "zod";
import {
    CanvasElementSchema,
    PointSchema,
    CanvasBaseElementSchema,
    RectangleSchema,
    DiamondSchema,
    EllipseSchema,
    LineSchema,
    ArrowSchema,
    HandDrawnSchema,
} from "./schema";

export type Point = z.infer<typeof PointSchema>;

export type CanvasBaseElement = z.infer<typeof CanvasBaseElementSchema>;

export type Rectangle = z.infer<typeof RectangleSchema>;
export type Diamond = z.infer<typeof DiamondSchema>;
export type Ellipse = z.infer<typeof EllipseSchema>;
export type Line = z.infer<typeof LineSchema>;
export type Arrow = z.infer<typeof ArrowSchema>;
export type HandDrawn = z.infer<typeof HandDrawnSchema>;

export type CanvasElement = z.infer<typeof CanvasElementSchema>;
