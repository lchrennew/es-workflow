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
        return Redis.db.set(`workflow:${ run.id }`, JSON.stringify(run));
    }

    /**
     *
     * @param id
     * @returns {Promise<any|null>}
     */
    load = async id => {
        logger.info('load run', id)
        const runData = await Redis.db.get(`workflow:${ id }`)
        return runData ? JSON.parse(runData) : null
    }
}
