import CacCache from "./cac-cache.js";
import { mongo } from "../../../../utils/mongo.js";
import { dump, load, safeDump } from "../../presentation/index.js";
import { digest } from "../../../../utils/digest.js";

export default class MongoCacCache extends CacCache {

    async removeCacLinkKey(kind, name, ref) {
        return mongo.collection('cac-links')
            .deleteOne({ _id: this.getCacLinkKey(kind, name, ref) });
    }

    async setToCache(config, cacLinkKey) {
        config.metadata.version = digest(safeDump(config))
        const dumped = dump(config)
        const cacKey = `cac:${config.kind}:${config.name}:${config.metadata.version}`
        mongo.collection('cac-links').updateOne({ _id: cacLinkKey }, { $set: { value: cacKey } }, { upsert: true })
        mongo.collection('cac-cache').updateOne({ _id: cacKey }, { $set: { value: dumped } }, { upsert: true })
    }

    async getCached(cacLinkKey) {
        const cachedCacKey = (await mongo.collection('cac-links').findOne({ _id: cacLinkKey }))?.value
        if (!cachedCacKey) return
        const cached = (await mongo.collection('cac-cache').findOne({ _id: cachedCacKey }))?.value
        if (cached) return load(cached)
    }
}
export const mongoCacCache = new MongoCacCache()