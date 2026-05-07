import { Controller } from "koa-es-template";

export default class RequestsController extends Controller {

    constructor(config, ...middlewares) {
        super(config, ...middlewares);

        this.post('/create', this.createRequest)
        this.post('/void', this.voidRequest)
        this.post('/respond', this.respondRequest)
    }

    createRequest = async ctx => {

    }
}