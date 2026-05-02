import { getLogger } from "koa-es-template";

const logger = getLogger("data-source");
export default class DataSource {
    static #configs
    static #runs

    static async init() {
        logger.info('initializing data source...')
        const configsDataSource = process.env.CONFIGS_DATASOURCE ?? 'redis';
        this.#configs = new ((await import(`./${ configsDataSource }/configs.js`)).default)()
        const runsDataSource = process.env.RUNS_DATASOURCE ?? 'redis';
        this.#runs = new ((await import(`./${ runsDataSource }/runs.js`)).default)()
        logger.info({ configsDataSource, runsDataSource })
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