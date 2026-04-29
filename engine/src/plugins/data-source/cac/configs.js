import { ConfigsDataSource } from "../interface.js";
import { cacClient } from "./cac.js";

export default class CacConfigsDataSource extends ConfigsDataSource {
    /**
     * 获取配置
     * @param kind
     * @param name
     * @returns {Promise<any>}
     */
    getOne = async (kind, name) => cacClient.getOne(kind, name, null)
    /**
     * 保存配置
     * @param config
     * @param operator {String}
     * @returns {*}
     */
    save = (config, operator) => cacClient.save(config, operator)
    /**
     * 获取多个配置
     * @param kind
     * @param names
     * @returns {Promise<*|*[]>}
     */
    getMultiple = async (kind, names) => cacClient.getMultiple(names.map(name => ({ kind, name })))
}