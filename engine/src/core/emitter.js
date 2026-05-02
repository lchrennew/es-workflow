import { exportName, importNamespace } from "../utils/imports.js";
import { staticClone } from "../utils/objects.js";
import { emitRunEvent } from "./run.js";
import api from "../utils/api.js";
import DataSource from "../plugins/data-source/data-source.js";

export const saveEmitter = emitter => DataSource.configs.save(emitter);
export const getEmitter = name => DataSource.configs.getOne('workflow-transition-emitter', name);

export const executeEmitter = async ({ run, task, request }) => {
    const { emitter: emitterName, emitterRules: names } = task
    const emitter = await getEmitter(emitterName)
    const emitterRuleNames = names.map(name => `${ emitterName }/${ name }`)
    const emitterRules = await getEmitterRules(emitterRuleNames)
    for (const emitterRule of emitterRules) {
        const event = await executeEmitterRule(
            emitterRule,
            { run, task, request });
        if (event.name) {
            return emitRunEvent(run, task, event.name, emitter, emitterRule)
        }
    }
}

export const saveEmitterRule = rule => DataSource.configs.save(rule);
export const getEmitterRule = name => DataSource.configs.getOne('emitter-rule', name);
export const getEmitterRules = async names => DataSource.configs.getMultiple('emitter-rule', names);

export const executeEmitterRule = async (emitterRule, { run, task, request }) => {
    const { spec: { script: content } } = emitterRule;
    const script =
        `async (run, task, request, api) => {
            const event = { name: null };
            ${ content }
            return event;
        }`

    const { validate } = await importNamespace(exportName('validate', script));

    return validate(
        staticClone(run),
        staticClone(task),
        staticClone(request),
        api);
}
