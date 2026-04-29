import { Client } from 'es-configuration-as-code-client'

export const cacClient = new Client(process.env.CAC_URL)