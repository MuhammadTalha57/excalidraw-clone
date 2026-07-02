import mongoose from "mongoose";

// Sessions are throwaway rooms, not permanent user data - a Mongo TTL index
// auto-deletes a session N seconds after its last update (see .env: SESSION_TTL_SECONDS).
const TTL_SECONDS = Number(process.env.SESSION_TTL_SECONDS || 86400);

const sessionSchema = new mongoose.Schema({
  // Reuse the short shareable id (nanoid) as the Mongo _id - no separate ObjectId needed.
  _id: { type: String, required: true },

  // Full excalidraw-style elements array. Deliberately untyped/flexible: rectangles,
  // arrows, text, and freedraw elements all have different shapes, and this collection
  // never needs to query into individual element fields - it's read and written whole.
  elements: { type: Array, default: [] },

  // Known only to the creator; lets them reclaim host status after a refresh/reconnect.
  hostToken: { type: String, required: true },

  // Current socket.id of whoever holds host privileges right now (changes on reconnect).
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
