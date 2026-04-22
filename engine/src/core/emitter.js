import { redis } from "../utils/redis.js";
import * as YAML from "yaml";
import { exportName, importNamespace } from "../utils/imports.js";
import { staticClone } from "../utils/objects.js";
import { emitRunEvent } from "./run.js";

export const saveEmitter = emitter => redis.set(`emitter:${ emitter.name }`, YAML.stringify(emitter));
export const getEmitter = async name => YAML.parse(await redis.get(`emitter:${ name }`));

export const executeEmitter = async (state, { run, task, request, parameters, api }) => {
    const { emitter, emitterRules: names } = state
    const emitterRuleNames = names.map(name => `${ emitter }/${ name }`)
    const emitterRules = await getEmitterRules(emitterRuleNames)
    for (const emitterRule of emitterRules) {
        const event = await executeEmitterRule(
            emitterRule,
            { run, state, task, request, parameters, api });
        if (event.name) {
            return emitRunEvent(run, task, event.name, {})
        }
    }

    const { prefetch } = await importNamespace(exportName('emit', script));

    return prefetch(staticClone(run), staticClone(task), staticClone(target), staticClone(parameters), api);
}

export const saveEmitterRule = rule => redis.set(`emitter-rule:${ rule.name }`, YAML.stringify(rule));
export const getEmitterRule = async name => YAML.parse(await redis.get(`emitter-rule:${ name }`));
export const getEmitterRules = async names => {
    if (!names?.length) return [];
    const keys = names.map(name => `emitter-rule:${ name }`);
    return (await redis.mget(...keys)).map(ruleString => YAML.parse(ruleString));
}

export const executeEmitterRule = async (emitterRule, { run, task, request, state, parameters, api }) => {
    const { spec: { script: content } } = emitterRule;
    const script =
        `async (run, task, request, parameters, api) => {
            const event = { name: null };
            ${ content }
            return event;
        }`

    const { validate } = await importNamespace(exportName('validate', script));

    return validate(
        staticClone(run),
        staticClone(task),
        staticClone(request),
        staticClone(state),
        staticClone(parameters),
        api);
}
