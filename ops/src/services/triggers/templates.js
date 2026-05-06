import { getGetHash, getLoad, getRemove, getSave } from "./models.js";
import { getTargetInterceptorsHash } from "./target-interceptors.js";

const path = 'templates'
export const loadTemplates = getLoad(path)
export const saveTemplate = getSave(path)
export const deleteTemplate = getRemove(path)
export const getTemplatesHash = getGetHash(path)
