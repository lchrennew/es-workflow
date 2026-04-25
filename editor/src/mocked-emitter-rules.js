export const mockedEmitterRules = [
    {
        kind: 'emitter-rule',
        name: 'system/start/auto-start',
        metadata: {
            title: '自动开始'
        },
        spec: {
            script: 'event.name = "start";\n'
        }
    },
    {
        kind: 'emitter-rule',
        name: 'demo/approval/veto',
        metadata: {
            title: '一票否决'
        },
        spec: {
            script: '// 任意人拒绝即拒绝\nconst responses = (task.requests ?? []).map(r => r?.response).filter(Boolean);\nif (responses.some(r => r.action === "REFUSE")) event.name = "rejected";\n'
        }
    },
    {
        kind: 'emitter-rule',
        name: 'demo/approval/any-accept',
        metadata: {
            title: '任一通过即通过'
        },
        spec: {
            script: '// 任意人通过即通过\nconst responses = (task.requests ?? []).map(r => r?.response).filter(Boolean);\nif (responses.some(r => r.action === "ACCEPT")) event.name = "passed";\n'
        }
    },
    {
        kind: 'emitter-rule',
        name: 'demo/approval/quorum-2',
        metadata: {
            title: '两人通过即通过'
        },
        spec: {
            script: 'const actions = (task.requests ?? []).map(r => r?.response?.action).filter(Boolean);\nconst acceptCount = actions.filter(a => a === "ACCEPT").length;\nif (acceptCount >= 2) event.name = "passed";\n'
        }
    }
];