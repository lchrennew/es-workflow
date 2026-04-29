import { getLogger } from "koa-es-template";
import { getApi } from "es-fetch-api";
import config from './config.json' with { type: 'json' }
import { compile } from "path-to-regexp";

const { primary, secondaries } = config

const logger = getLogger('GitHub Client')
logger.debug(`Loading GitHub Storage Client Implements...`)
const vendors = {
    gitea: await import('./gitea.js'),
    gitee: await import('./gitee.js'),
    github: await import('./github.js'),
}
for (const vendor in vendors) {
    logger.debug(`Loaded GitHub Storage Client Implement: ${vendor}`)
}

const { owner, repo } = primary
export { owner, repo }

const getBody = async response => {
    const content = await response.text()
    if (response.headers.get('content-type')?.includes('json')) return JSON.parse(content)
    return content
}
const createSingleApi = ({ vendor, baseUrl, token, owner, repo }) => {
    const singleApi = getApi(baseUrl)
    const { auth, base } = vendors[vendor]
    const endpointPrefix = compile(`${base}/repos/:owner/:repo`)({ owner, repo })
    console.log(endpointPrefix)
    return async (endpoint, ...args) => {
        const t0 = process.hrtime.bigint()
        const response = await singleApi(`${endpointPrefix}${endpoint}`, ...args, auth(token))
        const t1 = process.hrtime.bigint()
        const context = response.context
        logger.info(response.status, `${(Number(t1 - t0) / 1000000).toFixed(0)}ms`, context.method, context.url.href)
        if (response.status < 400) {
            return response.status === 204 ? undefined : getBody(response).catch(error => {
                logger.error(error)
                return null
            })
        } else {
            const error = await getBody(response)
            const message = error.errors?.[0] ?? error.message ?? error
            logger.warn(`${response.status} ${response.context.method} ${response.context.url.href}: ${message}`)
            throw { message, status: response.status }
        }
    }
}

primary.api = createSingleApi(primary)
secondaries?.forEach(secondary => secondary.api = createSingleApi(secondary))

/**
 * 简单调用Gitee API
 * @param endpoint
 * @param args
 * @return {Promise<undefined|*>}
 */
export const modify = async (endpoint, ...args) => {
    const result = await primary.api(endpoint, ...args)
    Promise.all(secondaries.map(secondary => secondary.api(endpoint, ...args)))
        .catch(error => logger.error(error))
    return result
}

export const get = primary.api

