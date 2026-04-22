import { Controller } from "koa-es-template";
import { saveEmitterRule } from "../core/emitter.js";

export default class EmitterRulesController extends Controller {

    constructor(config, ...middlewares) {
        super(config, ...middlewares);
        this.post('/', this.save)
    }

    save = async ctx => {
        await saveEmitterRule(ctx.request.body)
        ctx.body = { ok: true }
    };
}