import { getGetHash, getLoad, getRemove, getSave } from "./models.js";

const path = 'target-systems'
export const loadTargetSystems = getLoad(path)
export const saveTargetSystem = getSave(path)
export const deleteTargetSystem = getRemove(path)
export const getTargetSystemsHash = getGetHash(path)
