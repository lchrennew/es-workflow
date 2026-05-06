import { getGetHash, getLoad, getRemove, getSave } from "./models.js";

const path = 'target-interceptors'
export const loadTargetInterceptors = getLoad(path)
export const saveTargetInterceptor = getSave(path)
export const deleteTargetInterceptor = getRemove(path)
export const getTargetInterceptorsHash = getGetHash(path)
