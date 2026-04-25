import { reactive, ref } from 'vue';

export const workflow = reactive({
  kind: 'workflow',
  name: 'demo/workflow',
  metadata: { title: '未命名工作流' },
  spec: { states: [] }
});

export const selection = reactive({
  type: null, // 'node' | 'edge' | null
  data: null,
  parent: null // Used for edges to find the source state
});

export const drawing = reactive({
  isDrawing: false,
  sourceNode: null,
  startX: 0,
  startY: 0,
  currentX: 0,
  currentY: 0
});

export const canvasState = reactive({
  offsetX: 0,
  offsetY: 0
});

export const reorderStates = () => {
  if (workflow.spec && workflow.spec.states) {
    const initialNodes = [];
    const endNodes = [];
    const otherNodes = [];

    workflow.spec.states.forEach(state => {
      if (state.name === 'initial') {
        initialNodes.push(state);
      } else if (state.name === 'end') {
        endNodes.push(state);
      } else {
        otherNodes.push(state);
      }
    });

    workflow.spec.states = [...initialNodes, ...otherNodes, ...endNodes];
  }
};

export const getCleanWorkflow = () => {
  const cleanWorkflow = JSON.parse(JSON.stringify(workflow));

  if (cleanWorkflow.spec && cleanWorkflow.spec.states) {
    const layout = {
      states: {},
      transitions: {}
    };

    // 清理废弃字段和UI属性，并记录到 layout 中
    cleanWorkflow.spec.states.forEach(state => {
      if (state.ui) {
        layout.states[state.name] = { x: Math.round(state.ui.x), y: Math.round(state.ui.y) };
      }
      delete state.ui;
      if (state.transitions) {
        state.transitions.forEach(t => {
          if (t.ui) {
            layout.transitions[`${state.name}::${t.event}`] = { x: Math.round(t.ui.x), y: Math.round(t.ui.y) };
          }
          delete t.ui;
          delete t.title; // 清理废弃的事件显示名称字段
        });
      }
    });

    cleanWorkflow.spec.layout = layout;
  }

  return cleanWorkflow;
};

export const initWorkflow = () => {
  workflow.spec.states = [
    {
      name: 'initial',
      title: '开始',
      emitter: 'system/start',
      emitterRules: ['auto-start'],
      ui: { x: 350, y: 50 },
      transitions: []
    }, // Center top
    { name: 'end', title: '结束', ui: { x: 350, y: 350 }, transitions: [] } // Center bottom
  ];
  reorderStates();
};

export const loadWorkflow = (data) => {
  if (!data) return;
  // 保持基本信息
  workflow.kind = data.kind || 'workflow';
  workflow.name = data.name || 'demo/workflow';
  if (data.metadata) {
    workflow.metadata = { ...data.metadata };
  }

  if (data.spec && data.spec.states) {
    const hasLayout = !!data.spec.layout;
    const layout = data.spec.layout || { states: {}, transitions: {} };

    // 恢复坐标信息等UI数据（优先从 layout 中恢复）
    const states = data.spec.states.map((state, index) => {
      let ui = layout.states?.[state.name];
      if (!ui) {
        // 简单分配默认坐标
        ui = state.ui || { x: 100 + (index % 3) * 200, y: 100 + Math.floor(index / 3) * 150 };
        if (state.name === 'initial') {
          ui.x = 350; ui.y = 50;
        } else if (state.name === 'end') {
          ui.x = 350; ui.y = 350;
        }
      }
      return {
        ...state,
        ui: { ...ui }
      };
    });

    // 给 transitions 恢复或分配默认 UI 坐标以防出错
    states.forEach(state => {
      if (state.transitions) {
        state.transitions.forEach(t => {
          let tUi = layout.transitions?.[`${state.name}::${t.event}`];
          if (!tUi) {
            // 事件节点坐标相对于状态节点往下偏移
            tUi = t.ui || { x: state.ui.x, y: state.ui.y + 100 };
          }
          t.ui = { ...tUi };
        });
      } else {
        state.transitions = [];
      }
    });

    workflow.spec.states = states;
    // 移除运行时的 layout 对象，保持内部数据结构干净
    delete workflow.spec.layout;

    reorderStates();

    if (!hasLayout) {
      import('./workflow-ops.js').then(module => {
        module.performAutoLayout();
      });
    }
  }
};

export const addState = (state) => {
  workflow.spec.states.push(state);
  reorderStates();
};

export const selectNode = (node) => {
  selection.type = 'node';
  selection.data = node;
  selection.parent = null;
};

export const selectTransition = (transition, sourceState) => {
  selection.type = 'transition';
  selection.data = transition;
  selection.parent = sourceState;
};

export const selectTargetEdge = (transition, targetState, sourceState) => {
  selection.type = 'target-edge';
  selection.data = { transition, targetState };
  selection.parent = sourceState;
};
