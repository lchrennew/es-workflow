import { getData, invokeApi } from "../../utils/api.js";
import { triggerUrl } from "./api.js";
import { query } from "es-fetch-api/middlewares/query.js";
import { DELETE, POST } from "es-fetch-api/middlewares/methods.js";
import { json } from "es-fetch-api/middlewares/body.js";
import { ref } from "vue";
import { generateObjectID } from "es-object-id";

export const getLoad = path => () => getData(triggerUrl(path))
export const getSave = path => model => invokeApi(triggerUrl(`${path}/save`), query({ name: model.name }), POST, json(model))
export const getRemove = path => model => invokeApi(triggerUrl(`${path}/delete`), query({ name: model.name }), DELETE)
export const getGet = path => name => getData(triggerUrl(`${path}/get`), query({ name }))
const hashes = {}
export const getGetHash = path => () => hashes[path] ??= ref(generateObjectID())
