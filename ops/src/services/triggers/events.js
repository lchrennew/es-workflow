import { getData, getText } from "../../utils/api.js";
import { triggerUrl } from "./api.js";

export const getEvent = ({ id }) => getData(triggerUrl(`events/${ id }`)).catch(() => [])
export const getEvents = () => getData(triggerUrl('events/')).catch(() => [])

export const toggle = () => getText(triggerUrl('events/toggle/log')).catch(() => [])
