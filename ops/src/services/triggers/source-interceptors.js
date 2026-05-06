import { getGetHash, getLoad, getRemove, getSave } from "./models.js";

const path = 'source-interceptors'
export const loadSourceInterceptors = getLoad(path)
export const saveSourceInterceptor = getSave(path)
export const deleteSourceInterceptor = getRemove(path)
export const getSourceInterceptorsHash = getGetHash(path)
