import PathCache from "./path-cache.js";
import { redis } from "../../../../utils/redis.js";

export default class RedisPathCache extends PathCache {

    async addPath(owner, repo, path) {
        return redis.sadd(this.getKey(owner, repo), path)
    }

    async removePath(owner, repo, path) {
        return redis.srem(this.getKey(owner, repo), path)
    }

    async existsPath(owner, repo, path, fallback) {
        return await redis.sismember(this.getKey(owner, repo), path) || await fallback?.()
    }

    async scanPaths(key, match) {
        let cursor = '0'
        const result = []
        do {
            const [ nextCursor, values ] = await redis.sscan(key, cursor, ...(match ? [ 'MATCH', `${match}*` ] : []))
            cursor = nextCursor
            result.push(...values)
        } while (cursor !== '0')
        return result
    }

    async checkExistence(pathsKey) {
        return redis.exists(pathsKey);
    }

    async onFallback(pathsKey, paths) {
        return redis.sadd(pathsKey, ...paths)
    }

}

export const redisPathCache = new RedisPathCache()