import { compile } from "path-to-regexp";

export const useParameters = parameters => (ctx, next) => {
    const toPath = compile(ctx.url.pathname, { validate: false })
    ctx.url.pathname = toPath(parameters)
    return next()
}
