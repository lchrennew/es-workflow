import { Controller } from "koa-es-template";
import Listener from "../core/domain/listener.js";
import ListenerNotFound from "../core/domain/events/listener-not-found.js";
import { client } from "../core/infrastructure/cac/client.js";
import { ofType } from "../utils/objects.js";
import RequestReceived from "../core/domain/events/request-received.js";
import * as api from '../utils/api.js'
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc.js'
import localeData from 'dayjs/plugin/localeData.js'
import timezone from 'dayjs/plugin/timezone.js'
import relativeTime from 'dayjs/plugin/relativeTime.js'
import duration from 'dayjs/plugin/duration.js'

dayjs.extend(utc)
dayjs.extend(localeData)
dayjs.extend(timezone)
dayjs.extend(relativeTime)
dayjs.extend(duration)


export default class Hook extends Controller {

    constructor(config) {
        super(config);

        this.all('/:name', this.invoke)
    }

    async invoke(ctx) {
        const { name } = ctx.params

        const body = ctx.request.body
        const { headers, method, query, url } = ctx.request
        const requestReceived = new RequestReceived({ headers, method, query, url, body })
        requestReceived.flush()
        const { eventID } = requestReceived

        /**
         *
         * @type {Listener}
         */
        const listener = ofType(
            await client.getOne(Listener.kind, name)
                .catch(error => {
                    const listenerNotFound = new ListenerNotFound(name, error.stack, eventID)
                    listenerNotFound.flush()
                }),
            Listener
        )
        if (listener) {
            const context = { listener: name, method, query, headers, body, eventID, chain: [ eventID ], api, dayjs, }
            await listener.invoke(context)
        }

        ctx.body = {
            ok: !!listener,
            eventID,
            hostname: process.env.HOSTNAME,
        }
    }

}
