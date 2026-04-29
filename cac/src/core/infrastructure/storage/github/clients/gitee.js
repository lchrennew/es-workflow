import { query } from "es-fetch-api/middlewares/query.js";

const token = process.env.GITEE_TOKEN
export const auth = query({ access_token: token })
export const base = `/api/v5`
