import { redisCacCache } from "./cac-cache/redis-cac-cache.js";
import { redisPathCache } from "./path-cache/redis-path-cache.js";

const cacCache = redisCacCache
const pathCache = redisPathCache


export default class Cache {
    addPath = pathCache.addPath.bind(pathCache)
    getPaths = pathCache.getPaths.bind(pathCache)
    removePath = pathCache.removePath.bind(pathCache)
    existsPath = pathCache.existsPath.bind(pathCache)
    fillPaths = pathCache.fillPaths.bind(pathCache)

    getOne = cacCache.getOne.bind(cacCache)
    setToCache = cacCache.setToCache.bind(cacCache)
    getCacLinkKey = cacCache.getCacLinkKey.bind(cacCache)
}

export const cache = new Cache()