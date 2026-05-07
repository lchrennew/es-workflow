import { getData, invokeApi } from "../utils/api.js";
import { DELETE, POST } from "es-fetch-api/middlewares/methods.js";
import { json } from "es-fetch-api/middlewares/body.js";
import { query } from "es-fetch-api/middlewares/query.js";
import * as YAML from 'yaml'

const getBase = () => `${ window.appSettings?.api.cac ?? import.meta.env.VITE_CAC_API }`

export const saveConfigs = yaml =>
    invokeApi(`${ getBase() }/configs/submit`, POST, json({ saved: YAML.parseAllDocuments(yaml), deleted: [] }))
export const removeConfig = (kind, name) => invokeApi(`${ getBase() }/configs`, DELETE, query({ kind, name }))
export const loadConfig = (kind, name) => getData(`${ getBase() }/configs/info`, query({ kind, name }))
export const loadConfigs = ({ kind, prefix = '' }) => getData(`${ getBase() }/configs/`, query({ kind, prefix }))
