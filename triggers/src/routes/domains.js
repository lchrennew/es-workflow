import { Controller } from "koa-es-template";
import { client } from "../core/infrastructure/cac/client.js";


class Domains extends Controller {
    type
    client

    constructor(config, type, ...middlewares) {
        super(config, ...middlewares);
        this.type = type;
        this.get('/', this.viewAll)
        this.get('/get', this.view)
        this.post('/save', this.save)
        this.delete('/delete', this.remove)
        this.client = client
    }

    async viewAll(ctx) {
        const { path } = ctx.query
        ctx.body = await this.client.find(this.type.kind, path, true)
    }

    async view(ctx) {
        const { name } = ctx.query
        ctx.body = await this.client.getOne(this.type.kind, name,)
    }

    async save(ctx) {
        const { name } = ctx.query
        const { metadata, spec } = ctx.request.body
        const { operator } = ctx.headers
        const kind = this.type.kind
        await this.client.save({ kind, name, metadata, spec }, operator)
        ctx.body = { ok: true }
    }

    async remove(ctx) {
        const { name } = ctx.query
        ctx.body = await this.client.delete(this.type.kind, name, ctx.state.operator)
    }
}

export const Domain = T => class extends Domains {
    constructor(config, ...middlewares) {
        super(config, T, ...middlewares);
    }
}
