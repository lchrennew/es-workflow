import { getCleanWorkflow } from '../composables/use-workflow.js';
import { getEventDisplayName } from '../composables/emitters.js';

export const validateWorkflow = (workflowConfig) => {
  const errors = [];
  const config = workflowConfig || getCleanWorkflow();

  // 1. kind 校验
  if (config.kind !== 'workflow') {
    errors.push('配置类型必须为工作流。');
  }

  // 2. name 校验
  const nameRegex = /^[a-z0-9]+(-[a-z0-9]+)*(\/[a-z0-9]+(-[a-z0-9]+)*)*$/;
  if (!config.name) {
    errors.push('工作流的唯一标识名称不能为空。');
  } else if (!nameRegex.test(config.name)) {
    errors.push('工作流的唯一标识名称格式不正确，只能使用小写字母、数字和短横线，不能以短横线开头或结尾，并使用斜杠分隔层级。');
  }

  // 3. metadata 校验
  if (!config.metadata) {
    errors.push('缺少元数据配置。');
  } else {
    if (!config.metadata.title) {
      errors.push('工作流显示标题不能为空。');
    }

    if (config.metadata.tags && Array.isArray(config.metadata.tags)) {
      const tagRegex = /^[^/]+\/[^/]+$/;
      config.metadata.tags.forEach(tag => {
        if (!tagRegex.test(tag)) {
          errors.push(`标签格式不正确：“${tag}”，必须且只能包含一个斜杠作为分隔符。`);
        }
      });
    }

    if (config.metadata.version) {
      const objectIdRegex = /^[a-f0-9]{24}$/;
      if (!objectIdRegex.test(config.metadata.version)) {
        errors.push(`版本号格式不正确，必须是有效的二十四位标识符。`);
      }
    }
  }

  // 4. spec 校验
  if (!config.spec) {
    errors.push('缺少规格详情配置。');
    return { valid: errors.length === 0, errors };
  }

  const states = config.spec.states || [];
  if (!Array.isArray(states) || states.length === 0) {
    errors.push('工作流至少需要包含一个状态节点。');
    return { valid: errors.length === 0, errors };
  }

  const stateNames = new Set(states.map(s => s.name));
  const getStateName = (stateName) => {
    const s = states.find(st => st.name === stateName);
    return s ? (s.title || s.name) : stateName;
  };

  // 保留状态检查
  if (!stateNames.has('initial')) {
    errors.push('必须存在开始节点。');
  }
  if (!stateNames.has('end')) {
    errors.push('必须存在结束节点。');
  }

  // 节点详细校验
  states.forEach(state => {
    const isInitial = state.name === 'initial';
    const isEnd = state.name === 'end';
    const stateDisplayName = state.title || state.name;

    // emitter 校验
    if (!isEnd) {
      if (!state.emitter) {
        errors.push(`“${stateDisplayName}”节点必须配置触发器。`);
      }
      if (!state.emitterRules || !Array.isArray(state.emitterRules) || state.emitterRules.length === 0) {
        errors.push(`“${stateDisplayName}”节点的触发器规则至少需要包含一个规则配置。`);
      }
    }

    // 条件校验
    if (state.conditions) {
      if (isInitial || isEnd) {
        errors.push(`“${stateDisplayName}”作为保留节点，不允许配置流转条件。`);
      }

      // 若配置了 conditions，必须存在 transition.event="ignored"
      const hasIgnoredEvent = state.transitions?.some(t => t.event === 'ignored');
      if (!hasIgnoredEvent) {
        errors.push(`“${stateDisplayName}”节点配置了流转条件，必须包含一条“忽略”事件的连线。`);
      }
    }

    // 连线校验
    const transitions = state.transitions || [];
    const eventNames = new Set();

    if (isInitial) {
      if (transitions.length === 0) {
        errors.push('开始节点至少需要包含一条向外的连线。');
      }
      transitions.forEach(t => {
        if (t.event !== 'start') {
          errors.push(`开始节点的向外连线事件必须是“启动”，当前为“${getEventDisplayName(t.event, state)}”。`);
        }
      });
    }

    if (isEnd) {
      if (transitions.length > 0) {
        errors.push('结束节点只能作为连线终点，不允许有向外的连线。');
      }
    }

    // 非 initial/end 状态：出边检查
    if (!isInitial && !isEnd) {
      if (transitions.length === 0) {
        errors.push(`“${stateDisplayName}”节点至少需要包含一条向外的连线。`);
      }
    }

    transitions.forEach(t => {
      const eventDisplayName = getEventDisplayName(t.event, state);

      // event 去重
      if (eventNames.has(t.event)) {
        errors.push(`“${stateDisplayName}”节点下存在重复的“${eventDisplayName}”连线。`);
      }
      eventNames.add(t.event);

      const targets = t.targets || [];
      const targetStateNames = new Set();

      targets.forEach(target => {
        const targetDisplayName = getStateName(target.state);

        // target 去重
        if (targetStateNames.has(target.state)) {
          errors.push(`“${stateDisplayName}”节点通过“${eventDisplayName}”事件连接了重复的目标节点“${targetDisplayName}”。`);
        }
        targetStateNames.add(target.state);

        // 目标必须存在
        if (!stateNames.has(target.state)) {
          errors.push(`“${stateDisplayName}”节点连接到了一个不存在的目标节点。`);
        }

        // initial 不能作为目标
        if (target.state === 'initial') {
          errors.push('开始节点只能作为连线的起点，不能作为连线的终点。');
        }

        // prefetcher 去重
        if (target.prefetchers && Array.isArray(target.prefetchers)) {
          const prefetcherSet = new Set();
          target.prefetchers.forEach(p => {
            if (prefetcherSet.has(p)) {
              errors.push(`连接到“${targetDisplayName}”节点的预加载器“${p}”存在重复配置。`);
            }
            prefetcherSet.add(p);
          });
        }
      });
    });
  });

  // 入边检查 (非 initial 状态必须至少有 1 个入边)
  const incomingCounts = {};
  states.forEach(s => incomingCounts[s.name] = 0);

  states.forEach(state => {
    (state.transitions || []).forEach(t => {
      (t.targets || []).forEach(target => {
        if (incomingCounts[target.state] !== undefined) {
          incomingCounts[target.state]++;
        }
      });
    });
  });

  states.forEach(state => {
    if (state.name !== 'initial') {
      if (incomingCounts[state.name] === 0) {
        errors.push(`“${state.title || state.name}”节点没有任何连线进入，属于无法到达的孤立节点。`);
      }
    }
  });

  // 可达性约束：除 end 外的所有状态，都必须存在一条“到达 end 的路径”
  const reverseGraph = {};
  states.forEach(s => {
    reverseGraph[s.name] = [];
  });

  states.forEach(state => {
    (state.transitions || []).forEach(t => {
      (t.targets || []).forEach(target => {
        if (reverseGraph[target.state]) {
          reverseGraph[target.state].push(state.name);
        }
      });
    });
  });

  const reachableToEnd = new Set(['end']);
  const queue = ['end'];

  while (queue.length > 0) {
    const current = queue.shift();
    const parents = reverseGraph[current] || [];
    parents.forEach(parent => {
      if (!reachableToEnd.has(parent)) {
        reachableToEnd.add(parent);
        queue.push(parent);
      }
    });
  }

  states.forEach(state => {
    if (state.name !== 'end' && !reachableToEnd.has(state.name)) {
      errors.push(`“${state.title || state.name}”节点无法到达结束节点，存在死循环或无法结束的孤岛。`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
};
