export const format = process.env.PRESENTATION_FORMAT ?? 'yaml'

const { parse, stringify } = await import(`./${format}.js`)

/**
 * 结构过滤、删除version
 * @param content
 * @returns {{metadata, kind, name, spec}|null}
 */
export const safeLoad = content => {
    if (!content) return null
    const { kind, name, metadata, spec } = parse(content)
    delete metadata.version
    return { kind, name, metadata, spec }
}

/**
 * 结构过滤、版本清除
 * @param kind
 * @param name
 * @param metadata
 * @param spec
 * @returns {*}
 */
export const safeDump = ({ kind, name, metadata, spec }) => {
    delete metadata.version
    return stringify({ kind, name, metadata, spec });
}

export const load = content => content ? parse(content) : null
export const dump = obj => stringify(obj)
