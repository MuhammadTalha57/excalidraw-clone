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
    SessionSchema,
    PartialCanvasElementSchema,
    SessionMetaSchema,
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

export type SessionType = z.infer<typeof SessionSchema>;
export type SessionMetaType = z.infer<typeof SessionMetaSchema>;

export type PartialCanvasElement = z.infer<typeof PartialCanvasElementSchema>;