import { compile } from "path-to-regexp";
import { get, modify, owner, repo } from './replica-set.js'

export const useParameters = parameters => (ctx, next) => {
    const toPath = compile(ctx.url.pathname, { validate: false })
    ctx.url.pathname = toPath(parameters)
    return next()
}

export { repo, owner, get, modify }
