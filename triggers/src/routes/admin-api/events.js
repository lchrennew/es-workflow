import { Controller } from "koa-es-template";
import { redis } from "../../utils/redis.js";

export default class Events extends Controller {

    constructor(config, ...middlewares) {
        super(config, ...middlewares);

        this.get('/:id', this.getEventList)
        this.get('/:id/tree', this.getEventTree)
        this.get('/', this.getAllEvents)

        this.get('/toggle/log',
            async ctx => {
                const enabled = Number(await redis.exists('{trigger-events}:enable'))
                this.logger.debug('log enabled:', enabled)
                if (enabled) {
                    redis.unlink('{trigger-events}:enable')
                } else {
                    redis.setex('{trigger-events}:enable', 600, '1')
                }
                ctx.body = `log ${enabled ? 'disabled' : 'enabled'}`
            })
        this.get('/clear/log', this.clearEvents)
    }

    async clearEvents(ctx) {
        const eventKeys = await redis.keys('{trigger-event}:*');
        if (eventKeys.length) {
            await redis.unlink(...eventKeys)
        }
        ctx.body = 'done'
    }

    async getEventTree(ctx) {
        const { id } = ctx.params
        const result = await redis.hgetall(`{trigger-event}:${id}`)
        const keys = Object.keys(result).sort()
        const rootEvent = JSON.parse(result[keys.shift()])

        ctx.body = rootEvent
        keys.forEach(key => {
            let node = rootEvent
            const [ , ...path ] = key.split('/')
            path.forEach(dir => node = ((node.subsequences ??= {})[dir] ??= JSON.parse(result[key])))
        })

        ctx.status = 200
    }

    async getEventList(ctx) {
        const { id } = ctx.params
        ctx.body = Object.entries(await redis.hgetall(`{trigger-event}:${id}`))
            .map(([ , x ]) => JSON.parse(x))
    }

    async getAllEvents(ctx) {
        ctx.body = await redis.lrange('{trigger-events}:keys', 1, -1)
    }
}
