import { getLogger } from "koa-es-template";
import { RunsDataSource } from "../interface.js";
import Redis from "./redis.js";

const logger = getLogger('redis-runs-data-source')
export default class RedisRunsDataSource extends RunsDataSource {
    /**
     *
     * @param run
     * @returns {Promise<*>}
     */
    save = run => {
        logger.info('保存工作流运行信息...')
        Redis.db.set(`workflow-business-id:${run.businessId}`, run.id)
        return Redis.db.set(`workflow:${run.id}`, JSON.stringify(run));
    }

    /**
     *
     * @param id
     * @returns {Promise<any|null>}
     */
    load = async id => {
        logger.info('load run', id)
        const runData = await Redis.db.get(`workflow:${id}`)
        return runData ? JSON.parse(runData) : null
    }

    /**
     *
     * @param businessId
     * @returns {Promise<any|null>}
     */
    existsBusinessId = async businessId => {
        logger.info('exists run by business id', businessId)
        const exists = await Redis.db.exists(`workflow-business-id:${businessId}`)
        return !!exists
    }
}
