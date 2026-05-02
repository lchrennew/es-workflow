import { DomainModel } from "cac-client";
import { ofType } from "../../utils/objects.js";
import { client } from "../infrastructure/cac/client.js";
import Binding from "./binding.js";
import { TargetSystem } from "./target-system.js";
import Template from "./template.js";
import { getLogger } from "koa-es-template";
import AdaptorRequestInvoked from "./events/adaptor-request-invoked.js";
import AdaptorRequestInternalError from "./events/adaptor-request-internal-error.js";

const logger = getLogger('ADAPTOR_REQUEST')

export default class AdaptorRequest extends DomainModel {
    static kind = 'adaptor-request'
    #template
    #binding
    #targetSystem

    /**
     *
     * @param name {string}
     * @param title {string}
     * @param sourceInterceptor
     * @param binding
     * @param template
     * @param targetSystem
     * @param transformResponse
     */
    constructor(name, { title }, { binding, template, targetSystem }) {
        super(AdaptorRequest.kind, name, { title }, { binding, template, targetSystem });
    }

    /**
     *
     * @return {Promise<Binding>}
     */
    async #getBinding() {
        return this.#binding ??= ofType(await client.getOne(Binding.kind, this.spec.binding), Binding)
    }

    /**
     *
     * @return {Promise<TargetSystem>}
     */
    async #getTargetSystem() {
        return this.#targetSystem ??=
            ofType(await client.getOne(TargetSystem.kind, this.spec.targetSystem), TargetSystem)
    }

    /**
     *
     * @return {Promise<Template>}
     */
    async #getTemplate() {
        return this.#template ??= ofType(await client.getOne(Template.kind, this.spec.template), Template)
    }

    async #bindVariables(context) {
        const binding = await this.#getBinding()
        return await binding.bind(context);
    }

    async #request(context) {
        const targetSystem = await this.#getTargetSystem()
        const template = await this.#getTemplate()

        const { variables } = context
        const request = template.apply(variables)
        const targetSystemResponded = await targetSystem.commit(request, {
            ...context,
            targetSystem: targetSystem.name,
            template: template.name,
        })
        context.response = targetSystemResponded.content.response
        return targetSystemResponded
    }

    /**
     * 返回的响应会录入到context.responses[this.name]
     * @param context
     * @returns {Promise<void>}
     */
    async invoke(context) {
        const adaptorRequestInvoked = new AdaptorRequestInvoked(this, ...context.chain)
        adaptorRequestInvoked.flush()
        context.chain = [ ...context.chain, adaptorRequestInvoked.eventID ]

        try {
            const bindingBound = await this.#bindVariables(context);
            if (!bindingBound) return

            context.chain = [ ...context.chain, bindingBound.eventID ]

            const targetSystemResponded = await this.#request(context)
            context.chain = [ ...context.chain, targetSystemResponded.eventID ]
            context.responses ??= {}
            return context.responses[this.name] = targetSystemResponded.content.response
        } catch (error) {
            logger.error(error)
            const adaptorRequestInternalError = new AdaptorRequestInternalError(error.stack, ...context.chain)
            adaptorRequestInternalError.flush()
        }
    }
}
