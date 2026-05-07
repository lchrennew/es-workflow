const getBase = () => `${ window.appSettings?.api.triggers ?? import.meta.env.VITE_TRIGGERS_API }/admin-api`
export const triggerUrl = path => `${ getBase() }/${ path }`
