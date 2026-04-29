import PathCache from "./path-cache.js";
import { redis } from "../../../../utils/redis.js";
import { redisPathCache } from "./redis-path-cache.js";
import { mongoPathCache } from "./mongo-path-cache.js";


export default class MixinPathCache extends PathCache {

    async addPath(owner, repo, path) {
        if (redis.status === 'ready') await redisPathCache.addPath(owner, repo, path)
        await mongoPathCache.addPath(owner, repo, path)
    }

    async removePath(owner, repo, path) {
        if (redis.status === 'ready') await redisPathCache.removePath(owner, repo, path)
        await mongoPathCache.removePath(owner, repo, path)
    }

    async existsPath(owner, repo, path) {
        if (redis.status === 'ready') return redisPathCache.existsPath(owner, repo, path)
        return mongoPathCache.existsPath(owner, repo, path)
    }

    async scanPaths(key, match) {
        if (redis.status === 'ready') return redisPathCache.scanPaths(key, match)
        return mongoPathCache.scanPaths(key, match)
    }

    async checkExistence(pathsKey) {
        let exists = true
        if (redis.status === 'ready') exists = await redisPathCache.checkExistence(pathsKey)
        exists &&= await mongoPathCache.checkExistence(pathsKey)
        return exists
    }

    async onFallback(pathsKey, paths) {
        if (redis.status === 'ready') await redisPathCache.onFallback(pathsKey, paths)
        await mongoPathCache.onFallback(pathsKey, paths)
    }
}

export const mixinPathCache = new MixinPathCache()