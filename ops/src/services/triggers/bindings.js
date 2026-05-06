import { getGetHash, getLoad, getRemove, getSave } from "./models.js";

const path = 'bindings'
export const loadBindings =getLoad(path)
export const saveBinding = getSave(path)
export const deleteBinding = getRemove(path)
export const getBindingsHash = getGetHash(path)
