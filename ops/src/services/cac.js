import { getData, invokeApi } from "../utils/api.js";
import { DELETE, PUT } from "es-fetch-api/middlewares/methods.js";
import { json } from "es-fetch-api/middlewares/body.js";
import { query } from "es-fetch-api/middlewares/query.js";
import * as YAML from 'yaml'

export const saveConfigs = yaml => invokeApi('/cac/submit', PUT, json(YAML.parseAllDocuments(yaml)))
export const removeConfig = (kind, name) => invokeApi('/cac', DELETE, query({ kind, name }))
export const loadConfig = (kind, name) => getData('/cac/info', query({ kind, name }))
export const loadConfigs = ({ kind, prefix = '' }) => getData('/cac/', query({ kind, prefix }))
