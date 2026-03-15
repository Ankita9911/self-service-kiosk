import Redis from "ioredis";
import env from "../../config/env.js";

let redis;

export function getRedisClient() {
  if (!redis) {
    redis = new Redis({
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
    });

    redis.on("connect", () => {
      console.log("Redis connected");
    });

    redis.on("error", (err) => {
      console.error("Redis error:", err);
    });
  }

  return redis;
}
