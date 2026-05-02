import { getApi } from "es-fetch-api";
import { CONNECT, DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT, TRACE } from "es-fetch-api/middlewares/methods.js";
import { form, json } from "es-fetch-api/middlewares/body.js";
import { query } from "es-fetch-api/middlewares/query.js";
import { header } from "es-fetch-api/middlewares/header.js";

const api = getApi(`http://localhost:${process.env.PORT || 80}`)

const invokeApi = (...args) => api(...args)

const getText = async (...args) => {
    const response = await invokeApi(...args);
    return response.text();
}
const getJson = async (...args) => {
    const response = await invokeApi(...args);
    return response.json();
}
export {
    POST, GET, PUT, HEAD, DELETE, CONNECT, PATCH, TRACE, OPTIONS,
    json, form, query, header,
    invokeApi, getText, getJson,
}