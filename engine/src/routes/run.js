import { Controller } from "koa-es-template";
import { loadRun, nextTick, respondRun, saveRun } from "../core/run.js";
import { generateObjectID } from "es-object-id";

export default class RunController extends Controller {

    constructor(config, ...middlewares) {
        super(config, ...middlewares);

        this.post('/start', this.start)

        this.post('/respond', this.respond)

        this.post('/abort', this.cancel)

    }

    start = async ctx => {
        this.logger.info('启动工作流...已接收请求');
        const { config, parameters: inputParameters } = ctx.request.body
        this.logger.info('启动工作流...已提取请求数据', config.name);

        const runNumber = 1
        const id = `${ config.name.replaceAll('/', '.') }.${ generateObjectID() }`
        this.logger.info('启动工作流...已生成运行ID', config.name, id);

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

        await saveRun(run)
        this.logger.info('启动工作流...开始自动执行', config.name, id);
        await nextTick(run)
        this.logger.info('启动工作流...成功启动', config.name, id);

        ctx.body = { ok: true }
    }


    respond = async ctx => {
        const { run: runId, task: taskId, request: requestId, action, payload } = ctx.request.body
        const run = await loadRun(runId)
        const task = run.tasks.find(task => task.id === taskId)
        const request = task.requests.find(request => request.id === requestId)

        request.response = { action, payload }

        await respondRun(run, task, request, action, payload)

        ctx.body = { ok: true }
    }

    cancel = async ctx => {

    }

}