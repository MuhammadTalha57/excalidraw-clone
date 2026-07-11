import { z } from "zod";

export const PointSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const CanvasBaseElementSchema = z.object({
  strokeWidth: z.number(),
  strokeColor: z.string(),

  top: z.number(),
  bottom: z.number(),
  left: z.number(),
  right: z.number(),

  isSelected: z.boolean(),
  id: z.string(),
});

export const RectangleSchema = CanvasBaseElementSchema.extend({
  type: z.literal("rectangle"),
  fillColor: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
});

export const DiamondSchema = RectangleSchema.extend({
  type: z.literal("diamond"),
});

export const EllipseSchema = RectangleSchema.extend({
  type: z.literal("ellipse"),
});

export const LineSchema = CanvasBaseElementSchema.extend({
  type: z.literal("line"),
  p1: PointSchema,
  p2: PointSchema,
});

export const ArrowSchema = LineSchema.extend({
  type: z.literal("arrow"),
});

export const HandDrawnSchema = CanvasBaseElementSchema.extend({
  type: z.literal("handdrawn"),
  points: z.array(PointSchema),
});

export const CanvasElementSchema = z.discriminatedUnion("type", [
  RectangleSchema,
  DiamondSchema,
  EllipseSchema,
  LineSchema,
  ArrowSchema,
  HandDrawnSchema,
]);

export const SessionSchema = z.object({
  _id: z.string(),
  
  elements: z.map(z.string(), CanvasElementSchema),
  
  hostToken: z.string(),
  
  hostName: z.string().default("Host"), 

  hostSocketId: z.string().nullable(),

  active: z.boolean(),
});

