import { getGetHash, getLoad, getRemove, getSave } from "./models.js";

const path = 'triggers'
export const loadTriggers = getLoad(path)
export const saveTrigger = getSave(path)
export const deleteTrigger = getRemove(path)
export const getTriggersHash = getGetHash(path)
