import { DomainModel } from "cac-client";
import { exportName, importNamespace } from "../../utils/imports.js";

export default class TargetRequestsCollector extends DomainModel {
    static kind = 'target-requests-collector'

    constructor(name, { title }, { script }) {
        super(TargetRequestsCollector.kind, name, { title }, { script });
    }

    async collect({ listener, trigger, method, query, headers, body, props, variables, targetRequests, eventID, api, dayjs }) {
        const script =
            `async ({ \
                listener, trigger, method, query, headers, body, props, variables, targetRequests, eventID, api, dayjs,\
             })=>{\
        ${ this.spec.script };\
        return variables;}`
        const { collect } = await importNamespace(exportName('collect', script))
        return collect({ listener, trigger, method, query, headers, body, props, variables, targetRequests, eventID, api, dayjs  })
    }
}