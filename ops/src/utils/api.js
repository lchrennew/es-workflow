import { getApi } from "es-fetch-api";
import { message } from 'ant-design-vue';
import { abortable } from "es-fetch-api/middlewares/abortable.js";

export const getBaseUrl = () => window.appSettings?.api.backend ?? import.meta.env.VITE_APP_API;

const api = getApi(getBaseUrl())

export const getData = async (...args) => {
    const response = await invokeApi(...args)
    return await response.json()
}

export const getText = async (...args) => {
    const response = await invokeApi(...args)
    return await response.text()
}

export const invokeApi = async (...args) => {
    try {
        return await api(...args, useTimeout());
    } catch (error) {
        message.error(`请求出错了：${ error.message ?? error }`)
        console.error(error);
    }
}

/**
 * Abort the request when time out
 * @param msecs {Number} milliseconds to timeout
 * @return {function(*, *): Promise<*>}
 */
export const useTimeout = (msecs = 60000) => async (ctx, next) => {
    const controller = new AbortController()
    setTimeout(() => controller.abort(), msecs)
    const timeoutAbort = abortable(controller)
    return await timeoutAbort(ctx, next);
}
