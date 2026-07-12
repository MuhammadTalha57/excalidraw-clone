import { Redis } from "ioredis";
import { logger } from "../utils/logger.js";

declare global {
    var _redisConn: Redis | undefined;
}

function connectRedis() {
    if (!global._redisConn) {
        global._redisConn = new Redis(process.env.REDIS_URL!);
    }

    global._redisConn.on("connect", () => {
        logger.info("Redis Connected");
    });

    global._redisConn.on("error", (err) => {
        logger.error(`Redis Connection Failed: ${err}`);
    });

    return global._redisConn;
}

export function getClient() {
    return global._redisConn ? global._redisConn : connectRedis();
}
