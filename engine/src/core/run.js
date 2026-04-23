import { generateObjectID } from "es-object-id";
import { redis } from "../utils/redis.js";

import { getLogger } from 'koa-es-template'
import * as YAML from "yaml";
import { executePrefetcher, getPrefetchers } from "./prefetcher.js";
import api from "../utils/api.js";
import { executeEmitter } from "./emitter.js";

const logger = getLogger('run');

const strategies = {
    initialized: async run => {
        logger.info('运行状态机...启动初始任务');
        const task = await createTask(run, 'initial')
        run.status = 'running'
        logger.info('运行状态机...运行状态进行中');
        await saveRun(run)
        logger.info('运行状态机...运行已保存');
        await emit(run, task, 'start')
        logger.info('运行状态机...已启动初始任务');
    },

    running: async run => {
        logger.info('运行状态机...运行中');
        const end = run.tasks.find(task => task.stateName === 'end' && task.status === 'in-progress');

        const ending = end
            && run.tasks.every(task => task.stateName === 'end' || task.status !== 'in-progress');
        if (ending) {
            logger.info('运行状态机...已确定将结束');
            end.status = 'completed'
            logger.info('运行状态机...任务状态结束');
            run.status = 'completed'
            logger.info('运行状态机...运行状态结束');
            dumpOutputParameters(run)
            logger.info('运行状态机...运行输出参数就位');
            await saveRun(run)
            logger.info('运行状态机...运行已保存');
        } else if (end) {
            logger.info('运行状态机...不满足结束条件');
            end.status = 'ignored'
            logger.info('运行状态机...任务状态忽略');
            dumpOutputParameters(end)
            logger.info('运行状态机...运行输出参数就位');
            await saveRun(run)
            logger.info('运行状态机...运行已保存');
        }
    }
}

const createTask = async (run, stateName, inputParameters = {}) => {
    logger.info('创建任务...', run.id, stateName)
    const task = {
        id: generateObjectID(),
        stateName,
        status: 'initial',
        requests: [],
        inputParameters: { ...run.inputParameters, ...run.livingParameters, ...inputParameters },
        livingParameters: { ...run.inputParameters, ...run.livingParameters, ...inputParameters },
        outputParameters: {},
    }
    logger.info('创建任务...已生成任务（初始状态）', run.id, stateName, task.id)

    run.tasks.push(task)
    logger.info('创建任务...任务已添加到队列', run.id, stateName, task.id)
    return task
}

const createNextTask = async (run, target, inputParameters) => {
    logger.info('创建目标任务', run.id, target.state)
    const nextState = run.config.spec.states.find(({ name }) => name === target.state)
    logger.info('创建目标任务...已定位目标状态节点', run.id, target.state)
    const task = await createTask(run, nextState.name, inputParameters)
    logger.info('创建目标任务...目标任务已创建', run.id, task.id)

    if (nextState.conditions?.length) {
        logger.info('创建目标任务...启动条件检查', run.id, task.id)

        const metCondition = nextState.conditions.every(condition => condition.value === run.livingParameters[condition.key]);
        if (!metCondition) {
            logger.info('创建目标任务...不满足启动条件', run.id, task.id)
            task.status = 'ignored'
            logger.info('创建目标任务...不满足启动条件-任务忽略', run.id, task.id)
            dumpOutputParameters(task)
            logger.info('创建目标任务...不满足启动条件-任务忽略-输出参数已就位', run.id, task.id)
            await saveRun(run)
            logger.info('创建目标任务...不满足启动条件-触发ignored事件', run.id, task.id)
            await emit(run, task, 'ignored')
            logger.info('创建目标任务...不满足启动条件-结束创建过程', run.id, task.id)
            return
        }
        logger.info('创建目标任务...满足启动条件', run.id, task.id)
    }
    logger.info('创建目标任务...任务状态运行中', run.id, task.id)
    task.status = 'in-progress'

    // 发请求
    logger.info('创建目标任务...分析任务请求目标', run.id, task.id)
    const targets = (task.inputParameters['TMP_REQUEST_TARGETS'] ?? '').split(',').filter(Boolean)
    logger.info('创建目标任务...任务请求目标已确认', run.id, task.id)
    logger.info('创建目标任务...发送请求', run.id, task.id)
    await Promise.all(targets.map(target => sendRequest(run, task, target)))
    logger.info('创建目标任务...请求已发送', run.id, task.id)
    await saveRun(run)
    logger.info('创建目标任务...任务已保存', run.id, task.id)

    if (task.stateName === `end`) {
        logger.info('创建目标任务...目标任务为结束任务', run.id, task.id)
        logger.info('创建目标任务...自动结束任务', run.id, task.id)
        await nextTick(run)
    }
}

const sendRequest = async (run, task, target) => {
    logger.info('发送任务请求', run.id, task.id, target)
    const request = {
        id: generateObjectID(),
        runId: run.id,
        taskId: task.id,
        target,
    }
    task.requests.push(request)
}

const emit = async (run, task, name, payload) => {
    logger.info('触发事件...', name, run.id, task.id)
    task.status = 'completed'
    logger.info('触发事件...任务完成', name, run.id, task.id)
    task.outputParameters = getOutputParameters(task.livingParameters)
    logger.info('触发事件...输出参数就位', name, run.id, task.id)
    delete task.livingParameters
    logger.info('触发事件...实时参数清除', name, run.id, task.id)

    logger.info('触发事件...保存运行信息', name, run.id, task.id)
    await saveRun(run)
    logger.info('触发事件...成功保存运行信息', name, run.id, task.id)

    const state = run.config.spec.states.find(({ name }) => name === task.stateName)
    logger.info('触发事件...已定位状态节点', name, run.id, task.id, task.stateName)
    const transition = state.transitions.find(transition => transition.event === name)
    if (!transition) {
        logger.error('触发事件...未找到跳转链路')
        throw 'transition required'
    }
    logger.info('触发事件...已定位跳转链路', name, run.id, task.id, task.stateName)

    logger.info('触发事件...目标任务已确定', name, run.id, task.id)
    for (const target of transition.targets) {
        const parameters = {}
        // pre fetch data
        logger.info('触发事件...准备目标任务数据', name, run.id, task.id)
        const prefetchers = await getPrefetchers(target.prefetchers)
        for (const prefetcher of prefetchers) {
            logger.info('触发事件...准备目标任务数据', name, run.id, task.id, prefetcher.name)
            Object.assign(parameters,
                await executePrefetcher(prefetcher, { run, task, target, parameters, api }))
        }
        logger.info('触发事件...启动目标任务', name, run.id, task.id)
        await createNextTask(run, target, parameters)
    }
    logger.info('触发事件...完成链路跳转', name, run.id, task.id)

}
const getOutputParameters = parameters =>
    Object.fromEntries(Object.entries(parameters).filter(([ name ]) => !name.startsWith('TMP_')))

const dumpOutputParameters = parametersOwner => {
    logger.info('提取输出参数...')
    parametersOwner.outputParameters = getOutputParameters(parametersOwner.livingParameters)
    logger.info('清理实时参数')
    delete parametersOwner.livingParameters
}

/**
 *
 * @param run
 * @returns {Promise<*>}
 */
export const nextTick = run => {
    logger.info('运行状态机...下一刻', run.id, run.status)
    return strategies[run.status]?.(run);
}

/**
 *
 * @param run
 * @returns {Promise<*>}
 */
export const saveRun = run => {
    logger.info('保存工作流运行信息...', run.id)
    return redis.set(`workflow:${ run.id }`, YAML.stringify(run));
}

export const loadRun = async id => {
    logger.info('load run', id)
    const runData = await redis.get(`workflow:${ id }`)
    return runData ? YAML.parse(runData) : null
}

export const respondRun = async (run, task, request, action, payload) => {
    const state = run.config.spec.states.find(({ name }) => name === task.stateName)
    await executeEmitter(state, { run, task, request, action, payload })
}

export const emitRunEvent = emit