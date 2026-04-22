import { Controller } from "koa-es-template";
import { WorkflowController } from "./workflow.js";
import RunController from "./run.js";
import PrefetcherController from "./prefetcher.js";
import EmitterController from "./emitter.js";
import EmitterRulesController from "./emitter-rules.js";

export default class IndexController extends Controller {
    constructor(config, ...middlewares) {
        super(config, ...middlewares);
        this.use('/workflows', WorkflowController);
        this.use('/run', RunController);
        this.use('/prefetchers', PrefetcherController);
        this.use('/emitters', EmitterController);
        this.use('/emitter-rules', EmitterRulesController);
    }
}