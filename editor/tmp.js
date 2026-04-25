
export const performAutoLayout = () => {
  const states = workflow.spec.states;
  if (!states.length) return;

  const depths = new Map();
  const totalNodes = states.length + states.reduce((acc, s) => acc + (s.transitions?.length || 0), 0);
  const limit = totalNodes * 2;

  const initialState = states.find(s => s.name === 'initial');
  if (!initialState) return;

  const queue = [{ type: 'state', state: initialState, depth: 0 }];
  depths.set('state::initial', 0);

  while (queue.length > 0) {
    const { type, state, transition, depth } = queue.shift();

    if (type === 'state') {
      (state.transitions || []).forEach(t => {
        const tId = `trans::${state.name}::${t.event}`;
        if (depth + 1 < limit && (!depths.has(tId) || depths.get(tId) < depth + 1)) {
          depths.set(tId, depth + 1);
          queue.push({ type: 'transition', transition: t, sourceName: state.name, depth: depth + 1 });
        }
      });
    } else if (type === 'transition') {
      (transition.targets || []).forEach(target => {
        const sId = `state::${target.state}`;
        const targetState = states.find(s => s.name === target.state);
        if (targetState && depth + 1 < limit && (!depths.has(sId) || depths.get(sId) < depth + 1)) {
          depths.set(sId, depth + 1);
          queue.push({ type: 'state', state: targetState, depth: depth + 1 });
        }
      });
    }
  }

  // 处理孤立节点
  let maxDepth = Math.max(-1, ...Array.from(depths.values()));
  states.forEach(s => {
    const sId = `state::${s.name}`;
    if (!depths.has(sId)) {
      maxDepth++;
      depths.set(sId, maxDepth);
    }
    (s.transitions || []).forEach(t => {
      const tId = `trans::${s.name}::${t.event}`;
      if (!depths.has(tId)) {
        maxDepth++;
        depths.set(tId, maxDepth);
      }
    });
  });

  // 按层级分组
  const layers = [];
  depths.forEach((depth, id) => {
    if (!layers[depth]) layers[depth] = [];
    layers[depth].push(id);
  });

  // 分配坐标
  const startX = 50;
  const startY = 150;
  const gapX = 220;
  const gapY = 120;

  layers.forEach((layer, depth) => {
    if (!layer) return;
    const totalHeight = layer.length * gapY;
    const offsetY = startY - totalHeight / 2 + 100;

    layer.forEach((id, index) => {
      const x = startX + depth * gapX;
      const y = offsetY + index * gapY;

      if (id.startsWith('state::')) {
        const name = id.split('::')[1];
        const state = states.find(s => s.name === name);
        if (state) {
          if (!state.ui) state.ui = { x: 0, y: 0 };
          state.ui.x = x;
          state.ui.y = y;
        }
      } else if (id.startsWith('trans::')) {
        const parts = id.split('::');
        const sourceName = parts[1];
        const eventName = parts.slice(2).join('::'); // 支持 event 中包含 :: 的极端情况
        const sourceState = states.find(s => s.name === sourceName);
        if (sourceState) {
          const trans = sourceState.transitions?.find(t => t.event === eventName);
          if (trans) {
            if (!trans.ui) trans.ui = { x: 0, y: 0 };
            trans.ui.x = x;
            trans.ui.y = y + 10;
          }
        }
      }
    });
  });

  // 重置画布视口
  canvasState.offsetX = 0;
  canvasState.offsetY = 0;
};
