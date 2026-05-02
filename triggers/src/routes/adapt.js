import { Controller } from "koa-es-template";
import RequestReceived from "../core/domain/events/request-received.js";
import { ofType } from "../utils/objects.js";
import { client } from "../core/infrastructure/cac/client.js";
import Adaptor from "../core/domain/adaptor.js";
import AdaptorNotFound from "../core/domain/events/adaptor-not-found.js";
import * as api from "../utils/api.js";
import dayjs from "dayjs";

export default class Adapt extends Controller {

    constructor(config, ...middlewares) {
        super(config, ...middlewares);
        this.all('/:name', this.adapt)
    }

    async adapt(ctx) {
        const { name } = ctx.params
        const { headers, method, query, body } = ctx.request

        const requestReceived = new RequestReceived(ctx.request)
        requestReceived.flush()
        const { eventID } = requestReceived

        /**
         *
         * @type {Adaptor}
         */
        const adaptor = ofType(
            await client.getOne(Adaptor.kind, name)
                .catch(error => {
                    const adaptorNotFound = new AdaptorNotFound(name, error.stack, eventID)
                    adaptorNotFound.flush()
                }),
            Adaptor
        )
        ctx.set('X-TRIGGER-EVENT-ID', eventID)
        if (adaptor) {
            const redirect = url => `REDIRECT:${ url }`
            const context
                = { listener: name, method, query, headers, body, eventID, redirect, chain: [ eventID ], api, dayjs, }
            const result = await adaptor.invoke(context)
            if (`${ result }`.startsWith('REDIRECT:')) {
                ctx.redirect(result.replace(/^REDIRECT:/, ''))
            } else
                ctx.body = result

        }
    }

}
