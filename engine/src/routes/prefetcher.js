import { Controller } from "koa-es-template";
import { savePrefetcher } from "../core/prefetcher.js";

export default class PrefetcherController extends Controller {
    constructor(config, ...middlewares) {
        super(config, ...middlewares);

        this.post('/', this.save)
    }

    save = async ctx => {
        await savePrefetcher(ctx.request.body);
        ctx.body = { ok: true }
    };
}