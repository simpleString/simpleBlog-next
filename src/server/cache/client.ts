import { env } from "../../env/server.mjs";
import Redis from "ioredis";

export const createClientRedis = () => {
  // const redis = new Redis({
  //   host: env.REDIS_HOST,
  //   password: env.REDIS_PASSWORD,
  //   port: Number(env.REDIS_PORT),
  //   connectTimeout: 10000,

  //   showFriendlyErrorStack: true,

  //   retryStrategy: (times: number) => {
  //     if (times > 3) {
  //       console.error("[Redis] Could not connect after 3 times attempts");
  //     }
  //     return Math.min(times * 200, 1000);
  //   },
  // });
  const redis = new Redis(env.REDIS_HOST, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });

  redis.on("error", (error) => {
    console.error("[Redis] Error connecting", error);
  });

  return redis;
};
