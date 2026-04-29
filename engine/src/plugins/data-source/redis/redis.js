import { RedisURL } from "es-ioredis-url";
import { getLogger } from "koa-es-template";

const logger = getLogger("redis");
export default class Redis {
    static #redis

    static get db() {
        if (!this.#redis) {
            console.log('redis db connecting...');
            const redisURL = new RedisURL();
            logger.info('Connecting to redis', redisURL.rawUrl);
            this.#redis ??= redisURL.getRedis()
        }
        return this.#redis
    }
}