import { generateObjectID } from "es-object-id";
import { redis, streamConsumer, streamProducer } from "../../../utils/redis.js";
import { getLogger } from "koa-es-template";

const logger = getLogger('QUEUE')
const consumerId = generateObjectID()

const keepAlive = () => setInterval(
    () => redis.setex(`{CAC}:consumer:${consumerId}`, 5, 'alive').catch(() => undefined), 1000)

const isAlive = async () => {
    const host = await redis.get('{CAC}:compete')
    return redis.exists(`{CAC}:consumer:${host}`)
}

export const prepareConsumer = async () => {
    keepAlive()
    logger.debug(streamConsumer.status)
    if (streamConsumer.status === 'ready') {
        await streamConsumer.xgroup('CREATE', '{CAC}:update_stream', 'cac_group', '$', 'MKSTREAM').catch(() => undefined)
        await streamConsumer.xgroup('CREATE', '{CAC}:compete_stream', 'cac_group', '$', 'MKSTREAM').catch(() => undefined)
    } else {
        setTimeout(() => prepareConsumer().catch(() => undefined), 10000)
    }
}
const createNewRound = () => redis.setnx('{CAC}:compete', consumerId)
const endThisRound = () => redis.del('{CAC}:compete')
const waitForUpdate = () => streamConsumer.xreadgroup('GROUP', 'cac_group', consumerId, 'COUNT', 1, 'BLOCK', 0, 'STREAMS', '{CAC}:update_stream', '>')
const startNextRound = () => streamProducer.xadd('{CAC}:compete_stream', 'MAXLEN', '~', 1000, '*', 'compete', 'start')
const waitForNextRound = async () => {
    const alive = await isAlive()
    if (alive) {
        await streamConsumer.xreadgroup('GROUP', 'cac_group', consumerId, 'COUNT', 1, 'BLOCK', 10000, 'NOACK', 'STREAMS', '{CAC}:compete_stream', '>');
    } else {
        endThisRound()
    }
}

let onUpdate = message => logger.info(message)
export const setOnUpdate = f => onUpdate = f

export const startConsuming = async () => {
    if (streamConsumer.status === 'ready' && streamProducer.status === 'ready') {
        logger.debug('等待消费变更队列')
        try {
            const succeeded = await createNewRound()
            if (succeeded) {
                const message = await waitForUpdate()
                await onUpdate(message)
                await endThisRound()
                await startNextRound()
            } else {
                await waitForNextRound()
            }
        } catch (error) {
            logger.error(error)
        } finally {
            logger.debug('重新消费变更队列')
            process.nextTick(
                () => startConsuming().catch(error => logger.error(error)))
        }
    } else {
        logger.debug('redis连接未就绪', streamConsumer.status, streamProducer.status)
        logger.debug('稍后重试消费变更队列')
        setTimeout(() => startConsuming().catch(() => undefined), 10000)
    }
}

export const request = message => redis.xadd('{CAC}:update_stream', '*', 'message', JSON.stringify(message))
