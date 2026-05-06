import { getApi } from "es-fetch-api";

export const loadSettings = async () => {
    if (!window.appSettings) {
        const api = getApi(window.location.origin)
        const response = await api(import.meta.env.VITE_SETTINGS)
        window.appSettings = await response.json()
    }
}
