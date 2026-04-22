import { Controller } from "koa-es-template";
import { saveEmitter } from "../core/emitter.js";

export default class EmitterController extends Controller {

    constructor(config, ...middlewares) {
        super(config, ...middlewares);

        this.post('/', this.save)
    }

    save = async ctx => {
        await saveEmitter(ctx.request.body);
        ctx.body = { ok: true }
    }


}