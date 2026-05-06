import { generateObjectID } from "es-object-id";

import { getLogger } from 'koa-es-template'
import { executePrefetcher, getPrefetchers } from "./prefetcher.js";
import api from "../utils/api.js";
import { executeEmitter, getEmitter } from "./emitter.js";
import { exportName, importNamespace } from "../utils/imports.js";
import { staticClone } from "../utils/objects.js";
import DataSource from "../plugins/data-source/data-source.js";
import webhooks from "./webhooks.js";
import dayjs from "dayjs";

const logger = getLogger('run');

const nextTickStrategies = {
    initialized: async run => {
        logger.info('运行状态机...运行状态进行中');
        run.status = 'running'
        logKeyChange(run, { type: 'run', message: `工作流开始运行` });

        logger.info('运行状态机...启动初始任务');
        const task = await createTask(run, 'initial')

        await saveRun(run)
        await webhooks.runStarted({ run })
        logger.info('运行状态机...运行已保存');

        await executeEmitter({ run, task })
        logger.info('运行状态机...已启动初始任务');


    },

    running: async run => {
        logger.info('运行状态机...运行中');
        const end = run.tasks.find(task => task.name === 'end' && task.status === 'in-progress');

        const ending = end
            && run.tasks.every(task => task.name === 'end' || task.status !== 'in-progress');
        if (ending) {
            logger.info('运行状态机...已确定将结束');
            end.status = 'completed'
            logger.info('运行状态机...任务状态结束');
            run.status = 'completed'
            logger.info('运行状态机...运行状态结束');
            dumpOutputParameters(run)
            logger.info('运行状态机...运行输出参数就位');
            logKeyChange(run, { type: 'run', message: `工作流结束` });
            await saveRun(run)
            logger.info('运行状态机...运行已保存');
            await webhooks.runCompleted({ run })
        } else if (end) {
            logger.info('运行状态机...不满足结束条件，忽略');
            return ignoreTask(run, end)
        }
    }
}

const createTask = async (run, stateName, inputParameters = {}, source) => {
    logger.info('创建任务...', run.id, stateName)
    const state = run.config.spec.states.find(({ name }) => name === stateName);
    const task = {
        id: generateObjectID(),
        name: state.name,
        emitter: state.emitter,
        emitterRules: state.emitterRules,
        transitions: state.transitions,
        title: state.title,
        status: 'initial',
        requests: [],
        inputParameters: { ...run.inputParameters, ...run.livingParameters, ...inputParameters },
        livingParameters: { ...run.inputParameters, ...run.livingParameters, ...inputParameters },
        outputParameters: {},
        source,
    }
    logger.info('创建任务...已生成任务（初始状态）', run.id, state.name, task.id)

    run.tasks.push(task)
    logger.info('创建任务...任务已添加到队列', run.id, state.name, task.id)
    return task
}

const createRequests = async (run, task) => {
    // 发请求
    logger.info('创建目标任务...分析任务请求目标', run.id, task.id)
    const targets = (task.inputParameters['TMP_REQUEST_TARGETS'] ?? '').split(',').filter(Boolean)

    if (!targets.length && task.name !== 'end') return ignoreTask(run, task)

    logger.info('创建目标任务...任务请求目标已确认', run.id, task.id)
    logger.info('创建目标任务...发送请求', run.id, task.id)
    await Promise.all(targets.map(target => sendRequest(run, task, target)))
    logger.info('创建目标任务...请求已发送', run.id, task.id)
}

const ignoreTask = async (run, task) => {
    logger.info('忽略任务...', run.id, task.id)
    task.status = 'ignored'
    dumpOutputParameters(task)
    logger.info('忽略任务...输出参数已就位', run.id, task.id)
    await saveRun(run)
    logger.info('忽略任务...已保存', run.id, task.id)

    if (task.name !== 'end') {
        logger.info('创建目标任务...不满足启动条件-触发ignored事件', run.id, task.id)
        await emitRunEvent(run, task, 'ignored',)
        logger.info('创建目标任务...不满足启动条件-结束创建过程', run.id, task.id)
    }
}
const createNextTask = async (run, target, inputParameters, source, emitter, emitterRule) => {
    logger.info('创建目标任务', run.id, target.state)
    const nextState = run.config.spec.states.find(({ name }) => name === target.state)
    logger.info('创建目标任务...已定位目标状态节点', run.id, target.state)
    const task = await createTask(run, nextState.name, inputParameters, source)
    logger.info('创建目标任务...目标任务已创建', run.id, task.id)

    if (nextState.conditions) {
        logger.info('创建目标任务...启动条件检查', run.id, task.id)
        const script = `async task => {
            ${nextState.conditions}
        }`
        const { check } = importNamespace(exportName('check', script))
        const metCondition = await check(staticClone(task))
        if (!metCondition) {
            logger.info('创建目标任务...不满足启动条件，忽略', run.id, task.id)
            return ignoreTask(run, task);
        }
        logger.info('创建目标任务...满足启动条件', run.id, task.id)
    }
    logger.info('创建目标任务...任务状态运行中', run.id, task.id)
    task.status = 'in-progress'

    if (task.name !== 'end') {
        logKeyChange(run, { type: 'task', message: `新增待办任务：${task.title}` })
        await webhooks.taskStarted({ run, taskId: task.id, emitter, emitterRule })
    }

    await createRequests(run, task);

    await saveRun(run)
    logger.info('创建目标任务...任务已保存', run.id, task.id)
    if (task.name !== `end`) return
    logger.info('创建目标任务...目标任务为结束任务', run.id, task.id)
    logger.info('创建目标任务...自动结束任务', run.id, task.id)
    await nextTick(run)
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
    await webhooks.requestSent({ run, request })
    logKeyChange(run, { type: 'request', message: `待办任务${task.title}已分配给${target}` })

    return request
}

const voidRequest = async (run, task, requestId, action, reason, operator, addedRequests) => {
    logger.info('作废任务请求', run.id, task.id, requestId, action, reason)
    const request = task.requests.find(request => request.id === requestId)
    request.voidInfo = {
        voidedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        by: operator,
        reason,
        newRequestId: addedRequests[request.target]
    }

}

export const emitRunEvent = async (run, task, name, emitter, emitterRule) => {
    logger.info('触发事件...', name, run.id, task.id)
    task.endEvent = name
    task.status = 'completed'
    logger.info('触发事件...任务完成', name, run.id, task.id)
    dumpOutputParameters(task)
    logger.info('触发事件...输出参数就位', name, run.id, task.id)
    if (task.name !== 'initial') {
        task.endEventId = logKeyChange(run, { type: 'task', message: `待办任务${task.title}已完成：${name}` })
        await webhooks.taskCompleted({ run, task, event: name, emitter, emitterRule })
    }

    logger.info('触发事件...保存运行信息', name, run.id, task.id)
    await saveRun(run)
    logger.info('触发事件...成功保存运行信息', name, run.id, task.id)

    logger.info('触发事件...已定位状态节点', name, run.id, task.id, task.name)
    const transition = task.transitions.find(transition => transition.event === name)
    if (!transition) {
        logger.error('触发事件...未找到跳转链路')
        throw 'transition required'
    }
    logger.info('触发事件...已定位跳转链路', name, run.id, task.id, task.name)

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
        await createNextTask(run, target, parameters, { parent: task.id, name }, emitter, emitterRule)
    }
    logger.info('触发事件...完成链路跳转', name, run.id, task.id)

}
const getOutputParameters = parameters =>
    Object.fromEntries(Object.entries(parameters).filter(([name]) => !name.startsWith('TMP_')))

const dumpOutputParameters = (parametersOwner) => {
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
    return nextTickStrategies[run.status]?.(run);
}

/**
 *
 * @param run
 * @returns {Promise<*>}
 */
export const saveRun = run => DataSource.runs.save(run)

export const loadRun = id => DataSource.runs.load(id)

const respondStrategies = {
    'decision': (operator, run, task, request,) =>
        executeEmitter({ run, task, request }),
    'update-task': async (operator, run, task, request, action, payload,) => {
        const { addRequests = [], voidRequests = [] } = payload
        const addedRequests = {}
        for (const { target } of addRequests) {
            const addedRequest = await sendRequest(run, task, target)
            addRequests[target] = addedRequest.id
        }

        for (const { requestId, reason } of voidRequests) {
            await voidRequest(run, task, requestId, action, reason, operator, addedRequests)
        }

        await saveRun(run)
        await webhooks.taskUpdated({ run, task })
    }
}

export const respondRun = async (run, task, request, action, payload, operator) => {
    await webhooks.responseReceived({ run, taskId: task.id, requestId: request.id, payload })
    const emitter = await getEmitter(task.emitter)
    const { title: actionTitle, kind } = emitter.spec.actions.find(item => item.action === action)

    request.responses ??= []
    request.responses.push({ id: generateObjectID(), action, payload, kind })
    logKeyChange(run, { type: 'request', message: `${operator}${actionTitle}了待办事项 ${task.title}` })
    await respondStrategies[kind](operator, run, task, request, action, payload,)
}

export const logKeyChange = (run, event) => {
    const id = generateObjectID();
    run.events.push({ id, ...event });
    return id
}
