import { Controller } from "koa-es-template";

export class WorkflowController extends Controller {

    constructor(config, ...middlewares) {
        super(config, ...middlewares);

        this.post('/create', ctx => {})

        this.get('/list', ctx => {})

        this.get('/get', ctx => {})
    }


}