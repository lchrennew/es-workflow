import { DomainModel } from "cac-client";
import AdaptorInvoked from "./events/adaptor-invoked.js";
import { ofType } from "../../utils/objects.js";
import { client } from "../infrastructure/cac/client.js";
import SourceInterceptor from "./source-interceptor.js";
import { getLogger } from "koa-es-template";
import AdaptorInternalError from "./events/adaptor-internal-error.js";
import { exportName, importNamespace } from "../../utils/imports.js";
import AdaptorResponseTransformed from "./events/adaptor-response-transformed.js";
import AdaptorRequest from "./adaptor-request.js";
import Cache from "./cache.js";
import AdaptorOutputCacheHit from "./events/adaptor-output-cache-hit.js";
import { redis } from "../../utils/redis.js";

const logger = getLogger('ADAPTOR')


export default class Adaptor extends DomainModel {
    static kind = 'adaptor'
    #sourceInterceptor
    #adaptorRequests


    /**
     *
     * @param name {string}
     * @param title {string}
     * @param sourceInterceptor
     * @param transformResponse
     * @param adaptorRequests {String[]}
     * @param outputCache
     * @param passive
     */
    constructor(name,
                { title },
                {
                    sourceInterceptor,
                    transformResponse,
                    adaptorRequests = [],
                    outputCache = null,
                    passive = false
                }) {
        super(
            Adaptor.kind,
            name,
            { title },
            { sourceInterceptor, transformResponse, adaptorRequests, outputCache, passive });
    }

    /**
     *
     * @return {Promise<SourceInterceptor>}
     */
    async #getSourceInterceptor() {
        return this.#sourceInterceptor ??=
            ofType(await client.getOne(SourceInterceptor.kind, this.spec.sourceInterceptor), SourceInterceptor)
    }

    async #getAdaptorRequests() {
        const requests = await client.getMultiple(this.spec.adaptorRequests.map(name => ({
            name,
            kind: AdaptorRequest.kind
        })))
        this.#adaptorRequests =
            requests
                .map(r => ofType(r, AdaptorRequest))
    }

    async #interceptSource(context) {
        const sourceInterceptor = await this.#getSourceInterceptor()
        return await sourceInterceptor.intercept({ ...context, sourceInterceptor: sourceInterceptor.name });
    }

    async #request(context) {
        await this.#getAdaptorRequests()
        const responses = {}
        await Promise.all(this.#adaptorRequests.map(request => request.invoke({
            ...context,
            responses,
            chain: [ ...context.chain ]
        })))
        return responses
    }

    async #requests(context) {
        await this.#getAdaptorRequests()
        return Object.fromEntries(this.#adaptorRequests
            .map(request =>
                [
                    request.name,
                    new PassiveRequest(
                        request,
                        { ...context, chain: [ ...context.chain ] })
                ]))
    }

    async #transformResponses(context) {
        try {
            const script = `async ({ method, query, headers, body, responses, requests, redirect, redis, eventID })=>\
        { let result={}; ${ this.spec.transformResponse }; return result; }`
            const { transform } = await importNamespace(exportName('transform', script))
            const result = await transform({ ...context, redis })
            const adaptorResponseTransformed = new AdaptorResponseTransformed(result, ...context.chain)
            adaptorResponseTransformed.flush()
            return result
        } catch (error) {
            logger.error(error)
            const adaptorInternalError = new AdaptorInternalError(error.stack, ...context.chain)
            adaptorInternalError.flush()
        }
    }

    /**
     * 输出缓存
     * @returns {Cache|null}
     */
    get #outputCache() {
        return Cache.of(this.spec.outputCache)
    }

    async invoke(context) {
        const adaptorInvoked = new AdaptorInvoked(this, ...context.chain)
        adaptorInvoked.flush()
        context.chain = [ ...context.chain, adaptorInvoked.eventID ]


        try {
            const sourceIntercepted = await this.#interceptSource(context);
            if (!sourceIntercepted?.content.passed) return

            context.chain = [ ...context.chain, sourceIntercepted.eventID ]

            const cached = await this.#outputCache?.getCached(context, this.name)
            if (cached) {
                const outputCacheHit = new AdaptorOutputCacheHit(cached, ...context.chain)
                outputCacheHit.flush()
                context.chain = [ ...context.chain, outputCacheHit.eventID ]
                return cached
            }
            const patch = {}
            if (!this.spec.passive) {
                patch.responses = await this.#request(context)
            } else {
                patch.requests = await this.#requests(context)
            }
            const output = await this.#transformResponses({ ...context, ...patch })
            await this.#outputCache?.setCached(context, this.name, output)
            return output
        } catch (error) {
            logger.error(error)
            const adaptorInternalError = new AdaptorInternalError(error, ...context.chain)
            adaptorInternalError.flush()
        }
    }
}

class PassiveRequest {
    #request;
    #context;
    #response;

    constructor(request, context) {
        this.#request = request;
        this.#context = context;
    }

    get response() {
        if (this.#response)
            return this.#response
        const invoke = async () =>
            this.#response = await this.#request.invoke(this.#context)

        return invoke(this.#context)
    }

    reset() {
        this.#response = null
    }

    set state(state) {
        this.#context.state = state
        this.#response = null
    }
}