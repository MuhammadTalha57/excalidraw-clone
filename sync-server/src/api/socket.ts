// api/socket.ts
import "dotenv/config";
import http from "node:http";
import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { Redis } from "ioredis";

import { connectDB } from "../db/connect.js";
import { sessionRouter } from "../routes/session.js";
import { registerSocketHandlers } from "../sockets/index.js";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

console.log("FRONEND URL", FRONTEND_URL);

const app = express();
app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json({ limit: "10mb" }));
app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/sessions", sessionRouter);

const httpServer = http.createServer(app);

const pubClient = new Redis(process.env.REDIS_URL!);
const subClient = pubClient.duplicate();

const io = new Server(httpServer, {
  cors: { origin: FRONTEND_URL, methods: ["GET", "POST"] },
  maxHttpBufferSize: 1e7,
  adapter: createAdapter(pubClient, subClient),
});

registerSocketHandlers(io);

// Ensure DB is connected before handling requests, and reuse across warm invocations
let dbReady: Promise<unknown> | null = null;
app.use((req, res, next) => {
  if (!dbReady) dbReady = connectDB();
  dbReady.then(() => next()).catch(next);
});

export default httpServer;