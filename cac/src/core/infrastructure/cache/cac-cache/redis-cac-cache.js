import CacCache from "./cac-cache.js";
import { digest } from "../../../../utils/digest.js";
import { dump, load, safeDump } from "../../presentation/index.js";
import { redis } from "../../../../utils/redis.js";

export default class RedisCacCache extends CacCache {
    async setToCache(config, cacLinkKey) {
        config.metadata.version = digest(safeDump(config))
        const dumped = dump(config)
        const cacKey = `cac:${ config.kind }:${ config.name }:${ config.metadata.version }`
        const deprecated = await redis.getset(cacLinkKey, cacKey)
        deprecated && redis.unlink(deprecated)
        redis.set(cacKey, dumped)
    }

    async removeCacLinkKey(kind, name, ref) {
        return redis.unlink(this.getCacLinkKey(kind, name, ref));
    }

    async getCached(cacLinkKey) {
        const cachedCacKey = await redis.get(cacLinkKey)
        if (!cachedCacKey) return null
        const cached = await redis.get(cachedCacKey)
        if (cached) return load(cached)
    }

}

export const redisCacCache = new RedisCacCache()