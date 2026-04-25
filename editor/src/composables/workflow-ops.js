
import { workflow, canvasState, reorderStates } from './use-workflow.js';
import { emitterOptions } from './emitters.js';

export const updateNodePosition = (name, x, y) => {
  const node = workflow.spec.states.find(s => s.name === name);
  if (node && node.ui) {
    node.ui.x = Math.round(x);
    node.ui.y = Math.round(y);
  }
};

export const addTransition = (sourceName, targetName, portType = 'default') => {
  if (sourceName === 'end') return; // Cannot transition out of end
  if (targetName === 'initial') return; // Cannot transition into initial

  const source = workflow.spec.states.find(s => s.name === sourceName);
  const target = workflow.spec.states.find(s => s.name === targetName);
  if (!source || !target) return;
  if (!source.transitions) source.transitions = [];

  // Rule: initial state can only have 1 transition
  if (sourceName === 'initial' && source.transitions.length > 0) {
    return;
  }

  let eventName = '';

  // Rule: transition from initial state must be named 'start' (启动)
  if (sourceName === 'initial') {
    eventName = 'start';
  } else if (portType === 'condition') {
    // 处理从不满足条件端口拉出的连线
    eventName = 'ignored';

    // 检查是否已经存在条件不满足事件（只能有一个）
    if (source.transitions.find(t => t.event === eventName)) {
      return;
    }
  } else {
    // 处理正常状态节点的连线
    if (!source.emitter) {
      alert('请先在属性面板中为该状态节点配置触发器 (emitter)');
      return;
    }

    const emitterDef = emitterOptions.find(e => e.name === source.emitter);
    if (!emitterDef) return;

    const usedEvents = source.transitions.map(t => t.event);
    const availableEvent = emitterDef.spec.allowedEvents.find(e => !usedEvents.includes(e.name));

    if (!availableEvent) {
      alert(`该节点 (${source.emitter}) 的所有可用事件已被连线，无法再添加连出。`);
      return;
    }

    eventName = availableEvent.name;
  }

  let transitionX = (source.ui.x + target.ui.x) / 2;
  let transitionY = (source.ui.y + target.ui.y) / 2;

  // Handle self-transition UI positioning to avoid overlapping with the node
  if (sourceName === targetName) {
    transitionX = source.ui.x + 150; // Offset to the right
    transitionY = source.ui.y + 50;  // Slightly below
  }

  source.transitions.push({
    event: eventName,
    ui: {
      x: transitionX,
      y: transitionY
    },
    targets: [{ state: targetName, prefetchers: [] }]
  });
};

export const addTarget = (transition, targetName) => {
  if (targetName === 'initial') return; // Cannot transition into initial

  if (!transition.targets) transition.targets = [];
  if (!transition.targets.find(t => t.state === targetName)) {
    transition.targets.push({ state: targetName, prefetchers: [] });
  }
};

export const removeTransition = (sourceNode, eventName) => {
  if (!sourceNode || !sourceNode.transitions) return;
  const index = sourceNode.transitions.findIndex(t => t.event === eventName);
  if (index !== -1) {
    sourceNode.transitions.splice(index, 1);
  }
};

export const removeTarget = (transition, targetName, sourceState) => {
  if (!transition || !transition.targets) return;
  const index = transition.targets.findIndex(t => t.state === targetName);
  if (index !== -1) {
    transition.targets.splice(index, 1);

    // 如果事件节点没有出向目标线了，则将其一并删除
    if (transition.targets.length === 0 && sourceState && sourceState.transitions) {
      const tIndex = sourceState.transitions.findIndex(t => t === transition);
      if (tIndex !== -1) {
        sourceState.transitions.splice(tIndex, 1);
      }
    }
  }
};

export const removeNode = (name) => {
  if (name === 'initial' || name === 'end') return; // Cannot remove system states
  const index = workflow.spec.states.findIndex(s => s.name === name);
  if (index !== -1) {
    workflow.spec.states.splice(index, 1);
  }
  // Remove edges pointing to this node
  workflow.spec.states.forEach(state => {
    if (!state.transitions) return;

    // We need to iterate backwards because we might be splicing the array
    for (let i = state.transitions.length - 1; i >= 0; i--) {
      const t = state.transitions[i];
      if (t.targets) {
        t.targets = t.targets.filter(target => target.state !== name);

        // If the transition has no targets left after filtering, remove the transition itself
        if (t.targets.length === 0) {
          state.transitions.splice(i, 1);
        }
      }
    }
  });
  reorderStates();
};

export const performAutoLayout = (customStates, customCanvasState) => {
  const states = customStates || workflow.spec.states;
  if (!states || !states.length) return;

  // 1. Build Graph
  const nodes = new Set();
  const incoming = new Map();
  const outgoing = new Map();

  const addEdge = (u, v) => {
    if (!outgoing.has(u)) outgoing.set(u, []);
    outgoing.get(u).push(v);
    if (!incoming.has(v)) incoming.set(v, []);
    incoming.get(v).push(u);
  };

  states.forEach(state => {
    const sId = `state::${state.name}`;
    nodes.add(sId);
    (state.transitions || []).forEach(t => {
      const tId = `trans::${state.name}::${t.event}`;
      nodes.add(tId);
      addEdge(sId, tId);
      (t.targets || []).forEach(target => {
        const targetSId = `state::${target.state}`;
        if (states.some(s => s.name === target.state)) {
          addEdge(tId, targetSId);
        }
      });
    });
  });

  // 2. Break Cycles to form a DAG for ranking
  const visitedNodes = new Set();
  const pathNodes = new Set();
  const acyclicIncoming = new Map();

  nodes.forEach(n => acyclicIncoming.set(n, []));

  const dfsBreakCycles = (u) => {
    visitedNodes.add(u);
    pathNodes.add(u);

    (outgoing.get(u) || []).forEach(v => {
      if (!pathNodes.has(v)) {
        // Not a back-edge
        acyclicIncoming.get(v).push(u);
        if (!visitedNodes.has(v)) {
          dfsBreakCycles(v);
        }
      }
    });

    pathNodes.delete(u);
  };

  // Start DFS from roots first
  let roots = Array.from(nodes).filter(n => !incoming.has(n) || incoming.get(n).length === 0);
  if (nodes.has('state::initial')) {
    roots = roots.filter(r => r !== 'state::initial');
    roots.unshift('state::initial');
  } else if (roots.length === 0 && nodes.size > 0) {
    roots.push(nodes.values().next().value);
  }

  roots.forEach(r => {
    if (!visitedNodes.has(r)) dfsBreakCycles(r);
  });
  // Visit any remaining nodes (in disconnected components)
  nodes.forEach(n => {
    if (!visitedNodes.has(n)) dfsBreakCycles(n);
  });

  // 3. Assign Y Ranks (Longest path on DAG)
  const ranks = new Map();
  const memo = new Map();

  // Make initial the absolute root conceptually for ranking
  if (nodes.has('state::initial')) {
    nodes.forEach(n => {
      if (n !== 'state::initial' && acyclicIncoming.get(n).length === 0) {
        acyclicIncoming.get(n).push('state::initial');
      }
    });
  }

  const getLongestPath = (u) => {
    if (memo.has(u)) return memo.get(u);

    let maxPath = 0;
    (acyclicIncoming.get(u) || []).forEach(p => {
      const pLen = getLongestPath(p);
      if (pLen + 1 > maxPath) {
        maxPath = pLen + 1;
      }
    });

    memo.set(u, maxPath);
    return maxPath;
  };

  nodes.forEach(n => {
    ranks.set(n, getLongestPath(n));
  });

  let maxRank = Math.max(0, ...Array.from(ranks.values()));

  // Ensure 'end' node is always at the bottom if it has no outgoing transitions
  const endState = states.find(s => s.name === 'end');
  const endHasTransitions = endState && endState.transitions && endState.transitions.length > 0;
  if (nodes.has('state::end') && !endHasTransitions) {
    let endRank = ranks.get('state::end');
    if (endRank < maxRank) {
      ranks.set('state::end', maxRank);
      endRank = maxRank;
    }

    // If there are other nodes at the same rank as end, push end one level down to be absolutely alone
    let nodesAtEndRank = 0;
    ranks.forEach(r => { if (r === endRank) nodesAtEndRank++; });
    if (nodesAtEndRank > 1) {
      ranks.set('state::end', endRank + 1);
    }
  }

  // Group by layers
  const layers = [];
  ranks.forEach((r, n) => {
    if (!layers[r]) layers[r] = [];
    layers[r].push(n);
  });

  // 4. Find Critical Path (Longest path from roots to leaves)
  const criticalPath = new Set();
  let maxDepth = layers.length - 1;
  let currentCriticalNode = null;

  // Find a node in the deepest layer
  if (layers[maxDepth] && layers[maxDepth].length > 0) {
    // Prefer state::end if it's there
    currentCriticalNode = layers[maxDepth].find(n => n === 'state::end') || layers[maxDepth][0];
  }

  // Backtrack to find the critical path
  while (currentCriticalNode) {
    criticalPath.add(currentCriticalNode);
    let nextCriticalNode = null;
    let maxLen = -1;
    (acyclicIncoming.get(currentCriticalNode) || []).forEach(p => {
      const len = memo.get(p) || 0;
      if (len > maxLen) {
        maxLen = len;
        nextCriticalNode = p;
      }
    });
    currentCriticalNode = nextCriticalNode;
  }

  // 4. Assign X Coordinates (Sugiyama + Critical Path Reinforcement)
  const xPos = new Map();
  const gapX = 220;
  const startX = 350;

  // Fix critical path to X=0
  criticalPath.forEach(n => xPos.set(n, 0));

  layers.forEach((layer, depth) => {
    // If there is a critical node in this layer, we place it at 0.
    const criticalNode = layer.find(n => criticalPath.has(n));

    const idealX = new Map();
    layer.forEach(n => {
      if (criticalPath.has(n)) {
        idealX.set(n, 0);
        return;
      }

      const placedNeighbors = [];
      (acyclicIncoming.get(n) || []).forEach(p => { if (xPos.has(p)) placedNeighbors.push(xPos.get(p)); });

      if (placedNeighbors.length > 0) {
        const sum = placedNeighbors.reduce((acc, x) => acc + x, 0);
        idealX.set(n, sum / placedNeighbors.length);
      } else {
        idealX.set(n, 0);
      }
    });

    // Separate nodes into left of critical path and right of critical path
    const leftNodes = [];
    const rightNodes = [];

    layer.forEach(n => {
      if (!criticalPath.has(n)) {
        if (idealX.get(n) < 0) leftNodes.push(n);
        else if (idealX.get(n) > 0) rightNodes.push(n);
        else {
          // If ideal is 0, distribute alternately
          if (leftNodes.length <= rightNodes.length) leftNodes.push(n);
          else rightNodes.push(n);
        }
      }
    });

    leftNodes.sort((a, b) => idealX.get(a) - idealX.get(b));
    rightNodes.sort((a, b) => idealX.get(a) - idealX.get(b));

    // Place left nodes
    let currentX = criticalNode ? -gapX : 0;
    for (let i = leftNodes.length - 1; i >= 0; i--) {
      const n = leftNodes[i];
      let x = idealX.get(n);
      if (x > currentX) x = currentX;
      xPos.set(n, x);
      currentX = x - gapX;
    }

    // Place right nodes
    currentX = criticalNode ? gapX : (leftNodes.length > 0 ? gapX : 0);
    for (let i = 0; i < rightNodes.length; i++) {
      const n = rightNodes[i];
      let x = idealX.get(n);
      if (x < currentX) x = currentX;
      xPos.set(n, x);
      currentX = x + gapX;
    }
  });

  // Center alignment for all nodes (shift everything to startX)
  const allNodes = Array.from(nodes);
  const sumActual = allNodes.reduce((acc, n) => acc + xPos.get(n), 0);
  const shift = allNodes.length > 0 ? - (sumActual / allNodes.length) : 0;

  allNodes.forEach(n => {
    xPos.set(n, xPos.get(n) + shift);
  });

  // 5. Apply to UI
  const gapY = 75; // 缩小为原来的一半 (150 / 2)
  const startY = 50;

  layers.forEach((layer, depth) => {
    layer.forEach(id => {
      const x = xPos.get(id) + startX;
      const y = startY + depth * gapY;

      if (id.startsWith('state::')) {
        const name = id.split('::')[1];
        const state = states.find(s => s.name === name);
        if (state) {
          if (!state.ui) state.ui = { x: 0, y: 0 };
          state.ui.x = Math.round(x - 70); // 居中 (140/2)
          state.ui.y = Math.round(y);
        }
      } else if (id.startsWith('trans::')) {
        const parts = id.split('::');
        const sourceName = parts[1];
        const eventName = parts.slice(2).join('::');
        const sourceState = states.find(s => s.name === sourceName);
        if (sourceState) {
          const trans = sourceState.transitions?.find(t => t.event === eventName);
          if (trans) {
            if (!trans.ui) trans.ui = { x: 0, y: 0 };
            trans.ui.x = Math.round(x - 25); // 居中 (50/2)
            trans.ui.y = Math.round(y);
          }
        }
      }
    });
  });

  // 重置画布视口
  const canvas = customCanvasState || canvasState;
  canvas.offsetX = 0;
  canvas.offsetY = 0;
};
