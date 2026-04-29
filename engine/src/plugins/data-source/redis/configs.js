import * as YAML from "yaml";
import { ConfigsDataSource } from "../interface.js";
import Redis from "./redis.js";

export default class RedisConfigsDataSource extends ConfigsDataSource {
    /**
     * 获取配置
     * @param kind
     * @param name
     * @returns {Promise<any>}
     */
    getOne = async (kind, name) => YAML.parse(await Redis.db.get(`${ kind }:${ name }`))
    /**
     * 保存配置
     * @param config
     * @returns {*}
     */
    save = config => Redis.db.set(`${ config.kind }:${ config.name }`, YAML.stringify(config))
    /**
     * 获取多个配置
     * @param kind
     * @param names
     * @returns {Promise<*|*[]>}
     */
    getMultiple = async (kind, names) => {
        if (!names?.length) return [];
        const keys = names.map(name => `${ kind }:${ name }`);
        return (await Redis.db.mget(...keys)).map(ruleString => YAML.parse(ruleString));
    }
}
