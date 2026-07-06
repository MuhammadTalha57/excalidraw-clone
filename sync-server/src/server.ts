import "dotenv/config";
import http from "node:http";
import express from "express";
import cors from "cors";
import { Server } from "socket.io";

import { connectDB } from "./db/connect.js";
import { sessionRouter } from "./routes/session.js";
import { registerSocketHandlers } from "./sockets/index.js";

const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const app = express();
app.use(cors({ origin: FRONTEND_URL }));
// Default 100kb express limit is too small once a board has real content.
app.use(express.json({ limit: "10mb" }));

app.get("/health", (req, res) => res.json({ ok: true }));
app.use("/api/sessions", sessionRouter);

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
  },
  // Match express's json limit above - a full elements array can exceed
  // socket.io's 1MB default once a board has a lot of content.
  maxHttpBufferSize: 1e7,
});

registerSocketHandlers(io);

async function start() {
  await connectDB();
  httpServer.listen(PORT, () => {
    console.log(`[server] sync-server listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("[server] failed to start:", err);
  process.exit(1);
});
