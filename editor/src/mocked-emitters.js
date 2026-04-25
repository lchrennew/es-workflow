export const mockedEmitters = [
    {
        kind: 'workflow-transition-emitter',
        name: 'demo/approval',
        metadata: {
            title: '审批场景 emitter (来自远程)',
            forUserState: true
        },
        spec: {
            allowedActions: [
                { action: 'ACCEPT', title: '通过' },
                { action: 'REFUSE', title: '拒绝' }
            ],
            allowedEvents: [
                { name: 'passed', title: '通过', color: '#22c55e', icon: 'check' },
                { name: 'rejected', title: '拒绝', color: '#ef4444', icon: 'x' }
            ]
        }
    },
    {
        kind: 'workflow-transition-emitter',
        name: 'system/start',
        metadata: {
            title: '开始节点 emitter',
            forUserState: false
        },
        spec: {
            allowedActions: [],
            allowedEvents: [
                { name: 'start', title: '启动', color: '#3b82f6', icon: 'play' }
            ]
        }
    }
];