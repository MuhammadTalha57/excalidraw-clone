import mongoose from "mongoose";
import { logger } from "../utils/logger.js";

declare global {
  var _mongooseConn: Promise<typeof mongoose> | undefined;
}

export function connectDB() {
  if (!global._mongooseConn) {
    global._mongooseConn = mongoose.connect(process.env.MONGODB_URI!);
  }
  logger.info(`DB Connected`)
  return global._mongooseConn;
}

export function getClient() {
  return global._mongooseConn ? global._mongooseConn : connectDB();
}