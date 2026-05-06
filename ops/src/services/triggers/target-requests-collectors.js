import { getGetHash, getLoad, getRemove, getSave } from "./models.js";

const path = 'target-requests-collectors'
export const loadTargetRequestsCollectors = getLoad(path)
export const saveTargetRequestsCollector = getSave(path)
export const deleteTargetRequestsCollector = getRemove(path)
export const getTargetRequestsCollectorsHash = getGetHash(path)
