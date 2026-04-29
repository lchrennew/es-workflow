import CacCache from "./cac-cache.js";
import { redis } from "../../../../utils/redis.js";
import { mongoCacCache } from "./mongo-cac-cache.js";
import { redisCacCache } from "./redis-cac-cache.js";

export default class MixinCacCache extends CacCache {

    async getCached(cacLinkKey) {
        if (redis.status === 'ready')
            return redisCacCache.getCached(cacLinkKey)
        return mongoCacCache.getCached(cacLinkKey)
    }

    async removeCacLinkKey(kind, name, ref) {
        if (redis.status === 'ready')
            await redisCacCache.removeCacLinkKey(kind, name, ref)
        return mongoCacCache.removeCacLinkKey(kind, name, ref)
    }

    async setToCache(config, cacLinkKey) {
        if (redis.status === 'ready') await redisCacCache.setToCache(config, cacLinkKey)
        await mongoCacCache.setToCache(config, cacLinkKey)
    }
}

export const mixinCacCache = new MixinCacCache()