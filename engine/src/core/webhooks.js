import { getData } from "../utils/api.js";
import { json } from "es-fetch-api/middlewares/body.js";
import { getLogger } from "koa-es-template";

const logger = getLogger("webhooks");

class Webhooks {

    #getHookName(event) {
        return `WEBHOOK_${event.replaceAll('.', '_').toUpperCase()}`
    }

    async #trigger(event, payload) {
        try {
            const webhook = this.#getHookName(event)
            if (!webhook) {
                const result = await getData(webhook, json(payload))
                logger.info(event, result)
            }
        } catch (err) {
            logger.error(err)
        }
    }

    runStarted({ run }) {
        return this.#trigger('run.started', { run })
    }

    runCompleted({ run }) {
        return this.#trigger('run.completed', { run })
    }

    taskStarted({ run, taskId, emitter }) {
        return this.#trigger('task.started', { run, taskId, emitter })
    }

    taskCompleted({ run, taskId, event, emitter, emitterRule }) {
        return this.#trigger('task.completed', { run, taskId, event, emitter, emitterRule })
    }

    requestSent({ run, request }) {
        return this.#trigger('request.sent', { run, request })
    }

    responseReceived({ run, taskId, requestId, payload }) {
        return this.#trigger('response.received', { run, taskId, requestId, payload })
    }

    taskUpdated({ run, task }) {
        return this.#trigger('task.updated', { run, task })
    }
}

export default new Webhooks()