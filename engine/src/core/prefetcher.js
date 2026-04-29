import { exportName, importNamespace } from "../utils/imports.js";
import { staticClone } from "../utils/objects.js";
import DataSource from "../plugins/data-source/data-source.js";

export const getPrefetcher = name => DataSource.configs.getOne('prefetcher', name)
export const savePrefetcher = prefetcher => DataSource.configs.save(prefetcher)
export const getPrefetchers = names => DataSource.configs.getMultiple('prefetcher', names);

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