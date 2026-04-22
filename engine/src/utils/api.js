import { getApi } from "es-fetch-api"
import { getLogger } from "koa-es-template";

import * as methods from 'es-fetch-api/middlewares/methods.js'
import * as body from 'es-fetch-api/middlewares/body.js'
import { header } from 'es-fetch-api/middlewares/header.js'


const logger = getLogger('api')
const invoke = (...args) => {
    const api = getApi()
    return api(...args);
}

export const getData = async (...args) => {
    try {
        const response = await invoke(...args)
        return await response.json()
    } catch (error) {
        logger.info('Error in getData', error)
    }

}

export const getText = async (...args) => {
    try {
        const response = await invoke(...args)
        return await response.text()
    } catch (error) {
        logger.info('Error in getText', error)
    }
}

export default {
    getData,
    getText,
    methods,
    body,
    header,
}