import { RedisURL } from "es-ioredis-url";

/**
 *
 * @type {Redis}
 */
export const redis = new RedisURL().getRedis()
export const streamConsumer = new RedisURL().getRedis()
export const streamProducer = new RedisURL().getRedis()

export const singleNodeScanAnd = async (pattern, delegate, node) => {
    let cursor = '0'
    do {
        const reply = await node.scan(cursor, 'MATCH', pattern)
        cursor = reply[0]
        const keys = reply[1]
        await delegate(keys, node)
    } while (cursor !== '0')
}
export const scanAnd = async (pattern, delegate) => {
    if (redis.nodes) await Promise.all(redis.nodes('master').map(node => singleNodeScanAnd(pattern, delegate, node)))
    else await singleNodeScanAnd(pattern, delegate, redis)
}