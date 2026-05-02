import { exec } from "../../utils/strings.js";
import { getApi } from "es-fetch-api";
import { method, POST } from "es-fetch-api/middlewares/methods.js";
import { query } from "es-fetch-api/middlewares/query.js";
import * as formats from "es-fetch-api/middlewares/body.js";
import TargetSystemInternalError from "./events/target-system-internal-error.js";
import TargetSystemResponded from "./events/target-system-responded.js";
import { brokerEnabled } from "../../utils/toggles.js";
import { getLogger } from "koa-es-template";
import { DomainModel } from "cac-client";
import TargetSystemRequesting from "./events/target-system-requesting.js";
import { redis } from "../../utils/redis.js";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc.js'
import { json } from "es-fetch-api/middlewares/body.js";

const logger = getLogger('TARGET-SYSTEM')

dayjs.extend(utc)

export class TargetSystem extends DomainModel {
    static kind = 'target-system'

    constructor(name, { title }, spec) {
        super(TargetSystem.kind, name, { title }, spec);
    }

    static async #onFinished(context, result) {
        const targetSystemResponded = new TargetSystemResponded(result, ...context.chain)
        targetSystemResponded.flush()
        context.chain = [ ...context.chain, targetSystemResponded.eventID ]
        if (brokerEnabled && context.query?.session) {
            logger.info('发布')
            const brokerApi = getApi(process.env.SOCKJS_BROKER_API)
            await brokerApi('publish', query({ topic: context.query.session }), POST, json(result.response))
        }
        return targetSystemResponded
    }

    static async #responseToObject(response, timing) {
        const { headers, ok, redirected, status, statusText, url } = response
        const body = await response.text()
        return {
            timing,
            ok,
            redirected,
            status,
            statusText,
            url,
            headers: Object.fromEntries(headers.entries()),
            body
        }
    }

    #getUrl(variables) {
        return exec(this.spec[variables['@'] || 'default'], variables)
    }

    async commit(request, context) {
        const headers = obj => async (ctx, next) => {
            ctx.headers = { ...ctx.headers, ...obj }
            return next()
        }
        try {
            const baseURL = this.#getUrl(context.variables)
            const api = getApi(baseURL)

            const targetSystemRequesting = new TargetSystemRequesting({ ...request, baseURL }, ...context.chain)
            targetSystemRequesting.flush()
            context.chain = [ ...context.chain, targetSystemRequesting.eventID ]

            const middlewares = [ method(request.method),
                query(request.query),
                headers(request.headers),
                headers({ 'X-TRIGGER-EVENT-ID': context.eventID }), ]
            const format = formats[request.format ?? 'json']
            if (![ 'GET', 'HEAD' ].includes(request.method)) middlewares.push(format(request.body))

            const timingStart = Date.now()
            const apiResponse =
                await api(
                    request.path,
                    ...middlewares)
            const timing = Date.now() - timingStart
            const response = await TargetSystem.#responseToObject(apiResponse, timing);
            !response.ok && context.errorTracking && await this.#trackError(request, response, context)
            return await TargetSystem.#onFinished(context, { baseURL, request, response })
        } catch (error) {
            const targetSystemInternalError = new TargetSystemInternalError(error.stack, ...context.chain)
            targetSystemInternalError.flush()
            context.errorTracking && await this.#trackError(request, null, context)
        }
    }

    async #trackError(request, response = null, { targetRequest, eventID }) {
        if (redis.status === 'ready') {
            const errorKey = `{error}:${ targetRequest }:${ dayjs().utc().format('YYMMDDHHmm') }`
            await redis.rpush(errorKey,
                JSON.stringify({ request, response, eventID, targetRequest, }))
            await redis.expire(errorKey, 60 * 60 * 6)
        }
    }
}
