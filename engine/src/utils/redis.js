import { RedisURL } from "es-ioredis-url";

/**
 *
 * @type {any}
 */
export const redis = new RedisURL().getRedis()
export const streamConsumer = new RedisURL().getRedis()
export const streamProducer = new RedisURL().getRedis()

