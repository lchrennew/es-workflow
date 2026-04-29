import { MongoClient } from 'mongodb'

const client = new MongoClient(process.env.MONGO_URL)

await client.connect()
const db = await client.db()
export { db as mongo }