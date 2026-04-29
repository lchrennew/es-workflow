import { getLogger } from "koa-es-template";

const logger = getLogger("data-source");
export default class DataSource {
    static #configs
    static #runs

    static async init() {
        logger.info('initializing data source...')
        this.#configs = new ((await import(`./${ process.env.CONFIGS_DATASOURCE ?? 'redis' }/configs.js`)).default)()
        this.#runs = new ((await import(`./${ process.env.RUNS_DATASOURCE ?? 'redis' }/runs.js`)).default)()
        logger.info('initialized data source...')
    }

    /**
     *
     * @returns {ConfigsDataSource}
     */
    static get configs() {
        return this.#configs
    }

    /**
     *
     * @returns {RunsDataSource}
     */
    static get runs() {
        return this.#runs
    }
}
await DataSource.init()