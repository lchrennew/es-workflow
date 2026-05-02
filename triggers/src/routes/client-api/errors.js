import { Controller } from "koa-es-template";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc.js'
import duration from 'dayjs/plugin/duration.js'
import isBetween from 'dayjs/plugin/isBetween.js'
import { redis } from "../../utils/redis.js";

dayjs.extend(utc)
dayjs.extend(duration)
dayjs.extend(isBetween)
export default class Errors extends Controller {

    constructor(config, ...middlewares) {
        super(config, ...middlewares);
        this.get('/', this.#getErrors)
    }

    async #getErrors(ctx) {
        const now = dayjs.utc();
        const sixHoursAgo = now.subtract(6, 'hours');
        const { from = sixHoursAgo, to = now, name } = ctx.query
        if (!name) throw '请传入目标请求标识(name)'
        const dateFrom = dayjs.utc(from)
        const dateTo = dayjs.utc(to)

        const inLastSixHours = (...times) =>
            times.every(t => t.isBetween(sixHoursAgo, now, null, '[]'))
        if (!inLastSixHours(dateFrom, dateTo)) throw '只支持最近六个小时'
        if (!dateFrom.isBefore(to)) throw'截至时间不能早于起始时间'

        const minutes = dateTo.diff(dateFrom, 'minutes') + 1
        const keys = (new Array(minutes))
            .fill(1)
            .map((x, i) => `{error}:${name}:${dateFrom.add(i, 'minutes').format('YYMMDDHHmm')}`)
        const errors = []

        for (const key of keys) {
            errors.push(...(await redis.lrange(key, 0, -1)).map(content => JSON.parse(content)))
        }

        ctx.body = errors
    }
}