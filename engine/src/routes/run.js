import { Controller } from "koa-es-template";
import { loadRun, nextTick, pushEvent, respondRun, saveRun } from "../core/run.js";
import { generateObjectID } from "es-object-id";
import { getEmitter } from "../core/emitter.js";

export default class RunController extends Controller {

    constructor(config, ...middlewares) {
        super(config, ...middlewares);

        this.post('/start', this.start)

        this.post('/respond', this.respond)

        this.post('/abort', this.cancel)

    }

    start = async ctx => {
        this.logger.info('启动工作流...已接收请求',);
        const { config, parameters: inputParameters } = ctx.request.body
        this.logger.info('启动工作流...已提取请求数据',);

        const runNumber = 1
        const id = `${ config.name.replaceAll('/', '.') }.${ generateObjectID() }`
        this.logger.info('启动工作流...已生成运行ID',);

        const run = {
            id,
            name: config.name,
            runNumber,
            config,
            status: 'initialized',
            tasks: [],
            events: [],
            inputParameters: { ...inputParameters },
            livingParameters: { ...inputParameters },
            outputParameters: {},
        }
        pushEvent(run, { type: 'run', message: '已初始化' })
        await saveRun(run)
        this.logger.info('启动工作流...开始自动执行');
        await nextTick(run)
        this.logger.info('启动工作流...成功启动');

        ctx.body = { ok: true }
    }


    respond = async ctx => {
        const { run: runId, task: taskId, request: requestId, action, payload } = ctx.request.body
        const run = await loadRun(runId)
        const task = run.tasks.find(task => task.id === taskId)
        if (task.status !== 'in-progress') return ctx.body = { ok: false, message: '任务不可应答' }

        const request = task.requests.find(request => request.id === requestId)

        if (!request) return ctx.body = { ok: false, message: '无可应答请求' }
        if (!request.response) return ctx.body = { ok: false, message: '请求不可重复应答' }

        await respondRun(run, task, request, action, payload)

        ctx.body = { ok: true }
    }

    cancel = async ctx => {

    }

}