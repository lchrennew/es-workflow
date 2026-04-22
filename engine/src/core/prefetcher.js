import { redis } from "../utils/redis.js";
import * as YAML from 'yaml'
import { exportName, importNamespace } from "../utils/imports.js";
import { staticClone } from "../utils/objects.js";

export const getPrefetcher = async name => YAML.parse(await redis.get(`prefetcher:${ name }`));
export const savePrefetcher = async prefetcher => redis.set(`prefetcher:${ prefetcher.name }`, YAML.stringify(prefetcher));
export const getPrefetchers = async names => {
    if (!names?.length) return []
    const keys = names.map(name => `prefetcher:${ name }`);
    return (await redis.mget(...keys)).map(prefetcherString => YAML.parse(prefetcherString));
}
export const executePrefetcher = async (prefetcher, { run, task, target, parameters, api }) => {
    const { spec: { script: content } } = prefetcher;
    const script =
        `async (run, task, target, parameters, api) => {
            const result = {};
            ${ content }
            return result;
        }`

    const { prefetch } = await importNamespace(exportName('prefetch', script));

    return prefetch(staticClone(run), staticClone(task), staticClone(target), staticClone(parameters), api);
}