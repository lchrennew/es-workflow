export const TRIGGER_API = `${ window.appSettings?.api.triggers ?? import.meta.env.VITE_TRIGGERS_API }`
const API = `${ TRIGGER_API }/admin-api`
export const triggerUrl = path => `${ API }/${ path }`
