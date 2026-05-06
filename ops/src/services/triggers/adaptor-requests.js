import { getGetHash, getLoad, getRemove, getSave } from "./models.js";

const path = 'adaptor-requests'
export const loadAdaptorRequests =getLoad(path)
export const saveAdaptorRequest = getSave(path)
export const deleteAdaptorRequest = getRemove(path)
export const getAdaptorRequestsHash = getGetHash(path)
