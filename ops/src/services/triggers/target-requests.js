import { getGetHash, getLoad, getRemove, getSave } from "./models.js";

const path = 'target-requests'
export const loadTargetRequests = getLoad(path)
export const saveTargetRequest = getSave(path)
export const deleteTargetRequest = getRemove(path)
export const getTargetRequestsHash = getGetHash(path)
