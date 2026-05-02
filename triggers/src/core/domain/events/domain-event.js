import { getLogger } from "koa-es-template";
import { generateObjectID } from "es-object-id";
import { redis } from "../../../utils/redis.js";

const logger = getLogger('DOMAIN_EVENT')
export default class DomainEvent {
    eventID = generateObjectID()

    chain = [];
    content;
    type;

    constructor(content, ...chain) {
        this.content = content instanceof Error ? `${content.message}\n${content.stack}` : content;
        this.chain = chain
        this.type = this.constructor.name
    }

    async flush() {
        const key = `{trigger-event}:${this.chain[0] || this.eventID}`
        const field = [ ...this.chain, this.eventID ].join('/')
        const value = JSON.stringify(this);
        if (redis.status === 'ready') {
            const eventSourcing = await redis.exists('{trigger-events}:enable')
            if (eventSourcing) {
                await redis.hset(key, field, value)
                await redis.expire(key, 600)
                if (!this.chain[0]) {
                    await redis.lpush('{trigger-events}:keys', this.eventID)
                    await redis.expire('{trigger-events}:keys', 600)
                }
            }
        } else logger.info(key, field, value)
        logger.info(this.constructor.name, field)
    }
}
