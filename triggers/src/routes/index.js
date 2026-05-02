import { Controller } from "koa-es-template";
import Hook from "./hook.js";
import AdminApi from "./admin-api/index.js";
import ClientApi from "./client-api/index.js";
import Adapt from "./adapt.js";

export default class Index extends Controller {

    constructor(config) {
        super(config);

        this.use('/hook', Hook)
        this.use('/adapt', Adapt)
        const tempProtection = async (ctx, next) => {
            if (ctx.method !== 'OPTIONS' && ctx.headers['pippy'] !== 'xxx') {
                ctx.status = 403
                ctx.body = { error: 'Forbidden' }
            } else await next()
        }
        this.use('/admin-api', AdminApi, tempProtection)
        this.use('/client-api', ClientApi)
    }

}
