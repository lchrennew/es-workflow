import { encodeBase64 } from "../../../../../utils/encode.js";

const token = process.env.GITHUB_TOKEN
const username = process.env.GITHUB_USERNAME
export const auth = (ctx, next) => {
    ctx.header('Authorization', `Basic ${encodeBase64(`${username}:${token}`)}`)
    return next()
}

export const base = ''
