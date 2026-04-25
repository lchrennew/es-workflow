// 根据编辑器 YAML 实时生成 mock 的 WorkflowRun 对象
import { readonly } from "vue";

export const mockWorkflowRun = readonly({
    "id": "demo.workflow.69ed50f16992e32421694735",
    "name": "demo/workflow",
    "runNumber": 1,
    "config": {
        "kind": "workflow",
        "name": "demo/workflow",
        "metadata": {
            "title": "未命名工作流"
        },
        "spec": {
            "states": [
                {
                    "name": "initial",
                    "title": "开始",
                    "emitter": "system/start",
                    "emitterRules": [
                        "auto-start"
                    ],
                    "transitions": [
                        {
                            "event": "start",
                            "targets": [
                                {
                                    "state": "state_1777160072770",
                                    "prefetchers": [
                                        "demo/request-targets"
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "state_1777160072770",
                    "title": "任务1",
                    "transitions": [
                        {
                            "event": "passed",
                            "targets": [
                                {
                                    "state": "state_1777160089724",
                                    "prefetchers": [
                                        "demo/request-targets"
                                    ]
                                }
                            ]
                        },
                        {
                            "event": "rejected",
                            "targets": [
                                {
                                    "state": "end",
                                    "prefetchers": []
                                }
                            ]
                        }
                    ],
                    "emitterRules": [
                        "veto",
                        "any-accept"
                    ],
                    "emitter": "demo/approval"
                },
                {
                    "name": "state_1777160089724",
                    "title": "任务2",
                    "transitions": [
                        {
                            "event": "passed",
                            "targets": [
                                {
                                    "state": "end",
                                    "prefetchers": []
                                }
                            ]
                        },
                        {
                            "event": "rejected",
                            "targets": [
                                {
                                    "state": "end",
                                    "prefetchers": []
                                }
                            ]
                        }
                    ],
                    "emitterRules": [
                        "veto",
                        "any-accept"
                    ],
                    "emitter": "demo/approval"
                },
                {
                    "name": "end",
                    "title": "结束",
                    "transitions": []
                }
            ],
        }
    },
    "status": "running",
    "tasks": [
        {
            "id": "69ed50f16992e32c49694738",
            "stateName": "initial",
            "title": "开始",
            "status": "completed",
            "requests": [],
            "inputParameters": {},
            "outputParameters": {},
            "endEvent": "start"
        },
        {
            "id": "69ed50f16992e3cae2694739",
            "stateName": "state_1777160072770",
            "title": "任务1",
            "status": "completed",
            "requests": [
                {
                    "id": "69ed50f16992e3a20d69473b",
                    "runId": "demo.workflow.69ed50f16992e32421694735",
                    "taskId": "69ed50f16992e3cae2694739",
                    "target": "user:10086",
                    "response": {
                        "action": "ACCEPT",
                        "payload": "不错"
                    }
                }
            ],
            "inputParameters": {
                "TMP_REQUEST_TARGETS": "user:10086"
            },
            "outputParameters": {},
            "source": {
                "parent": "69ed50f16992e32c49694738",
                "name": "start"
            },
            "endEvent": "passed",
            "endEventId": "69ed51576992e36f1769473e"
        },
        {
            "id": "69ed51576992e34e6f69473f",
            "stateName": "state_1777160089724",
            "title": "任务2",
            "status": "in-progress",
            "requests": [
                {
                    "id": "69ed51576992e3ac16694741",
                    "runId": "demo.workflow.69ed50f16992e32421694735",
                    "taskId": "69ed51576992e34e6f69473f",
                    "target": "user:10086"
                }
            ],
            "inputParameters": {
                "TMP_REQUEST_TARGETS": "user:10086"
            },
            "livingParameters": {
                "TMP_REQUEST_TARGETS": "user:10086"
            },
            "outputParameters": {},
            "source": {
                "parent": "69ed50f16992e3cae2694739",
                "name": "passed"
            }
        }
    ],
    "events": [
        {
            "id": "69ed50f16992e30581694736",
            "type": "run",
            "message": "已初始化"
        },
        {
            "id": "69ed50f16992e37bd6694737",
            "type": "run",
            "message": "工作流开始运行"
        },
        {
            "id": "69ed50f16992e3167369473a",
            "type": "task",
            "message": "新增待办任务：任务1"
        },
        {
            "id": "69ed50f16992e3e19f69473c",
            "type": "request",
            "message": "待办任务任务1已分配给user:10086"
        },
        {
            "id": "69ed51576992e342e069473d",
            "type": "request",
            "message": "user:10086通过了待办事项 任务1"
        },
        {
            "id": "69ed51576992e36f1769473e",
            "type": "task",
            "message": "待办任务任务1已完成：passed"
        },
        {
            "id": "69ed51576992e36aed694740",
            "type": "task",
            "message": "新增待办任务：任务2"
        },
        {
            "id": "69ed51576992e308ce694742",
            "type": "request",
            "message": "待办任务任务2已分配给user:10086"
        }
    ],
    "inputParameters": {},
    "livingParameters": {},
    "outputParameters": {}
});