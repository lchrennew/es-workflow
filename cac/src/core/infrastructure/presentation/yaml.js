import * as YAML from "yaml";

export const parse = content => YAML.parse(content)

/**
 *
 * @return {*}
 * @param object
 */
export const stringify = object => YAML.stringify(object)
