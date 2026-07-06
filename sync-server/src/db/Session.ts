import mongoose from "mongoose";
import { CanvasElement } from "../lib/types";

const TTL_SECONDS = Number(process.env.SESSION_TTL_SECONDS || 86400);

const sessionSchema = new mongoose.Schema({
  _id: { type: String, required: true },

  elements: { 
    type: Map, 
    of: mongoose.Schema.Types.Mixed, 
    default: () => new Map(),
  },

  hostToken: { type: String, required: true },

  hostSocketId: { type: String, default: null },

  hostName: { type: String, default: "Host" },

  createdAt: { type: Date, default: Date.now },
  updatedAt: {
    type: Date,
    default: Date.now,
    expires: TTL_SECONDS,
  },
});

export const Session = mongoose.model("Session", sessionSchema);
