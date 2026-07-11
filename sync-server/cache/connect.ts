import {Redis} from "ioredis";

declare global {
    var _redisConn: Redis | undefined;
}

function connectRedis() {
    if (!global._redisConn) {
        global._redisConn = new Redis(process.env.REDIS_URL!);
    }

    global._redisConn.on("connect", () => {
        console.log("Redis connected");
    });

    global._redisConn.on("error", (err) => {
        console.error(err);
    });

    return global._redisConn;
}

export function getClient() {
    return global._redisConn ? global._redisConn : connectRedis();
}