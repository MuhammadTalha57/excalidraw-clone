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
import morgan from "morgan";
import { logger } from "../utils/logger.js";
import { flushAllDirtySessions } from "../services/session.service.js";

// Workaround for node js V24 dns issue.
import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const FRONTEND_URL = process.env.FRONTEND_URL;

const app = express();
app.use(morgan("dev"));
app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json({ limit: "10mb" }));

app.use((req, _res, next) => {
    if (req.url.startsWith("/api/socket")) {
        req.url = req.url.slice("/api/socket".length) || "/";
    }
    next();
});

let dbReady: Promise<unknown> | null = null;
app.use((req, res, next) => {
    if (!dbReady) dbReady = connectDB();
    dbReady.then(() => next()).catch(next);
});

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/sessions", sessionRouter);
app.get("/api/cron/flush-sessions", async (req, res) => {
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && req.headers.authorization !== `Bearer ${cronSecret}`) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const result = await flushAllDirtySessions();
        logger.info(`[cron flush-sessions] ${JSON.stringify(result)}`);
        res.json({ ok: true, ...result });
    } catch (error) {
        logger.error(`[cron flush-sessions] error: ${error}`);
        res.status(500).json({ ok: false, error: "Flush failed" });
    }
});


const httpServer = http.createServer(app);

const pubClient = new Redis(process.env.REDIS_URL!);
const subClient = pubClient.duplicate();

const io = new Server(httpServer, {
    path: "/api/socket/socket.io",
    cors: { origin: FRONTEND_URL, methods: ["GET", "POST"] },
    maxHttpBufferSize: 1e7,
    adapter: createAdapter(pubClient, subClient),
});

registerSocketHandlers(io);

export default httpServer;
