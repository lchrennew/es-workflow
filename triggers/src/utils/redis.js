import { RedisURL } from "es-ioredis-url";
import { getLogger } from "koa-es-template";

const logger = getLogger('redis')
export const redis = new RedisURL(process.env.REDIS_URL).getRedis()
redis.on('error', error => logger.error(error))
