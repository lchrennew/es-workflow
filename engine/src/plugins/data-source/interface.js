export class ConfigsDataSource {
    /**
     * 获取配置
     * @param kind
     * @param name
     * @returns {Promise<any>}
     */
    getOne;
    /**
     * 保存配置
     * @param config
     * @returns {*}
     */
    save
    /**
     * 获取多个配置
     * @param kind
     * @param names
     * @returns {Promise<*|*[]>}
     */
    getMultiple
}

export class RunsDataSource {
    /**
     * 保存执行记录
     * @param run
     * @returns {Promise<*>}
     */
    save
    /**
     * 加载执行记录
     * @param id
     * @returns {Promise<any|null>}
     */
    load
}
