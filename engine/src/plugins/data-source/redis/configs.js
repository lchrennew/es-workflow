import * as YAML from "yaml";
import { ConfigsDataSource } from "../interface.js";
import Redis from "./redis.js";
import dayjs from "dayjs";

export default class RedisConfigsDataSource extends ConfigsDataSource {
    /**
     * 获取配置
     * @param kind
     * @param name
     * @returns {Promise<{kind:String, name:String, metadata: Object, spec: Object}>}
     */
    getOne = async (kind, name) => YAML.parse(await Redis.db.get(`${ kind }:${ name }`))
    /**
     * 保存配置
     * @param config {{kind:String, name:String, metadata: Object, spec: Object}}
     * @param operator {String}
     * @returns {*}
     */
    save = (config, operator) => {
        config.metadata.createdAt ??= dayjs().format("YYYY-MM-DD HH:mm:ss")
        config.metadata.createdBy ??= operator
        config.metadata.updatedAt = dayjs().format("YYYY-MM-DD HH:mm:ss")
        config.metadata.updatedBy = operator
        return Redis.db.set(`${ config.kind }:${ config.name }`, YAML.stringify(config));
    }
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
