import Trigger from "./trigger.js";
import { client } from "../infrastructure/cac/client.js";
import { redis } from "../../utils/redis.js";

export default class Client {
    dir

    /**
     *
     * @param dir
     */
    constructor(dir) {
        this.dir = dir;
    }

    async getTriggers() {
        try {
            const cachedKey = `cached:${this.dir}`;
            let cached = await redis.get(cachedKey)
            if (!cached) {
                cached = JSON.stringify(await client.find(Trigger.kind, `${this.dir}/`))
                await redis.set(cachedKey, cached, 'EX', 60 * 60)
            }
            return cached
        } catch (error) {
            throw error
        }
    }
}
