import { getApi } from 'es-fetch-api'

export const importNamespace = script => import(`data:text/javascript;utf-8,${encodeURIComponent(script)}`)
export const exportName = (name, script) => `export const ${name} = ${script}`
