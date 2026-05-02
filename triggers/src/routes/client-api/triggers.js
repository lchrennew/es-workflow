import { Controller } from "koa-es-template";
import Client from "../../core/domain/client.js";

export default class Triggers extends Controller {

    constructor(config, ...middlewares) {
        super(config, ...middlewares);

        this.get('/:dir', this.getTriggers)
    }

    async getTriggers(ctx) {
        const { dir } = ctx.params
        const client = new Client(dir)
        ctx.body = await client.getTriggers()
            .catch(error => {
                this.logger.error(error)
                return []
            })
    }


}
