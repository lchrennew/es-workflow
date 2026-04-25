import { reactive } from 'vue';

// 基于 15-emitter-domain.md 设计文档的 mock 数据作为默认值
export const emitterOptions = reactive([
  {
    kind: 'workflow-transition-emitter',
    name: 'demo/approval',
    metadata: {
      title: '审批场景 emitter',
      forUserState: true
    },
    spec: {
      allowedActions: [
        { action: 'ACCEPT', title: '通过' },
        { action: 'REFUSE', title: '拒绝' }
      ],
      allowedEvents: [
        { name: 'passed', title: '通过' },
        { name: 'rejected', title: '拒绝' }
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
        { name: 'start', title: '启动' }
      ]
    }
  }
]);

// 动态更新 emitter 数据
export const updateEmitters = (emitters) => {
  emitterOptions.splice(0, emitterOptions.length, ...emitters);
};

// 获取事件显示名称
export const getEventDisplayName = (eventName, sourceState) => {
  if (eventName === 'ignored') return '忽略';
  if (sourceState?.name === 'initial' && eventName === 'start') return '启动';

  if (sourceState?.emitter) {
    const emitterDef = emitterOptions.find(e => e.name === sourceState.emitter);
    if (emitterDef) {
      const evtDef = emitterDef.spec.allowedEvents.find(e => e.name === eventName);
      if (evtDef) return evtDef.title;
    }
  }
  return eventName || '事件';
};
