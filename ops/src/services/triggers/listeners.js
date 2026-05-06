import { getGetHash, getLoad, getRemove, getSave } from "./models.js";

const path = 'listeners'
export const loadListeners = getLoad(path)
export const saveListener = getSave(path)
export const deleteListener = getRemove(path)
export const getListenersHash = getGetHash(path)
