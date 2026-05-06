import { getGetHash, getLoad, getRemove, getSave } from "./models.js";

const path = 'adaptors'
export const loadAdaptors =getLoad(path)
export const saveAdaptor = getSave(path)
export const deleteAdaptor = getRemove(path)
export const getAdaptorsHash = getGetHash(path)
