import { getLogger } from "koa-es-template";

const logger = getLogger('CAC-CACHE')

export default class CacCache {
    async getCached(cacLinkKey) {
        return {}
    }

    /**
     *
     * @param kind
     * @param name
     * @param ref
     * @param fallback
     * @returns {Promise<{}>}
     */

    async getOne(kind, name, ref, fallback) {
        const cacLinkKey = this.getCacLinkKey(kind, name, ref)

        const cached = await this.getCached(cacLinkKey)
        if (cached) {
            logger.info('Cache hit.')
            return cached
        }

        logger.info('Cache missed.', kind, name, ref)
        const config = await fallback(kind, name, ref)
        this.setToCache(config, cacLinkKey).catch(error => logger.error(error))
        return config
    }

    /**
     *
     * @param kind
     * @param name
     * @param ref
     * @returns {Promise<void>}
     */
    async removeCacLinkKey(kind, name, ref) {

    }

    /**
     *
     * @param config
     * @param cacLinkKey
     * @returns {Promise<void>}
     */
    async setToCache(config, cacLinkKey) {
    }

    /**
     *
     * @param kind
     * @param name
     * @param ref
     * @returns {string}
     */
    getCacLinkKey(kind, name, ref) {
        return `cac_link:${kind}:${name}:${ref || 'HEAD'}`;
    }
}