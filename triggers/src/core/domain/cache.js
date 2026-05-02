import { exportName, importNamespace } from "../../utils/imports.js";
import { hashString } from "../../utils/strings.js";
import { redis } from "../../utils/redis.js";

export default class Cache {

    enabled

    keyGetter

    expirationSeconds

    static of(obj) {
        if (obj instanceof Object) {
            return new Cache(obj)
        }
    }


    constructor({ enabled, keyGetter, expirationSeconds }) {
        this.enabled = enabled;
        this.keyGetter = keyGetter;
        this.expirationSeconds = expirationSeconds;
    }

    async #getKey(context) {
        const script = `async ({method,headers,body,query,listener, trigger, api})=>{${this.keyGetter}}`
        const { getKey } = await importNamespace(exportName('getKey', script))
        console.log(script)
        return getKey(context)
    }

    /**
     *
     * @param key {String}
     * @param prefix
     * @returns {string}
     */
    #getStorageKey(key, prefix) {
        return `{adapter-cache/${prefix}}:${hashString(key)}:${hashString(key.substring(1))}`
    }

    async getCached(context, prefix) {
        if (this.enabled) {
            const key = await this.#getKey(context)
            const storageKey = this.#getStorageKey(key, prefix)
            const ttl = await redis.ttl(storageKey)
            if (ttl > this.expirationSeconds) {
                await redis.expire(this.expirationSeconds)
            }
            return JSON.parse(await redis.get(storageKey))
        }
    }

    async setCached(context, prefix, content) {
        if (this.enabled) {
            const key = await this.#getKey(context)
            const storageKey = this.#getStorageKey(key, prefix)

            await redis.set(storageKey, JSON.stringify(content), 'EX', this.expirationSeconds)
        }
        return content
    }
}