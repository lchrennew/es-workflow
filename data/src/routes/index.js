import { Controller } from "koa-es-template";
import RequestsController from "./requests.js";
import WebhookController from "./webhook.js";

export default class IndexController extends Controller {
    constructor(config, ...middlewares) {
        super(config, ...middlewares);
        this.use('/requests', RequestsController)
        this.use('/webhook', WebhookController)


        this.get('/requests/backlogs', this.getBacklogs)
        this.get('/requests/done', this.getProceeded)

        this.post('/requests', this.createRequest)

    }

    getBacklogs = async ctx => {
        const { targets } = ctx.query
        ctx.body = { ok: true, data: [] }
    }

    getProceeded = async ctx => {
        const { targets } = ctx.query
        ctx.body = { ok: true, data: [] }
    }

    createRequest = ctx => {
        const { targets } = ctx.query
        ctx.body = { ok: true, data: [] }
    }
}