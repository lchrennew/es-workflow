const token = process.env.GITEA_TOKEN
export const auth = token => (ctx, next) => {
    ctx.header('Authorization', `token ${token}`)
    return next()
}

export const base = `/api/v1`
