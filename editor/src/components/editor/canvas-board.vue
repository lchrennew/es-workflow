<template>
  <div class="canvas-board" tabindex="0" @mousedown.self="onCanvasMouseDown" @dblclick.self="onCanvasDoubleClick">
    <svg class="edges-layer" style="overflow: visible;">
      <g :transform="`translate(${canvasState.offsetX}, ${canvasState.offsetY})`">
        <!-- Edges -->
        <canvas-edge v-for="edge in edges" :key="edge.id" :edge="edge" @click="onEdgeClick(edge)" />
        <!-- Drawing Line -->
        <line v-if="drawing.isDrawing" :x1="drawing.startX" :y1="drawing.startY" :x2="drawing.currentX"
          :y2="drawing.currentY" class="drawing-line" />
      </g>
    </svg>

    <div class="nodes-layer" :style="{ transform: `translate(${canvasState.offsetX}px, ${canvasState.offsetY}px)` }">
      <!-- Nodes -->
      <canvas-node v-for="state in workflow.spec.states" :key="`node-${state.name}`" :node="state"
        @click="onNodeClick(state)" />
      <!-- Transitions -->
      <template v-for="state in workflow.spec.states" :key="`transitions-${state.name}`">
        <canvas-transition v-for="transition in state.transitions" :key="`trans-${state.name}-${transition.event}`"
          :transition="transition" :sourceState="state" @click="onTransitionClick(transition, state)" />
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue';
import { workflow, selection, drawing, selectNode, selectTransition, selectTargetEdge, canvasState } from '../../composables/use-workflow.js';
import { addState } from '../../composables/use-workflow.js';
import { removeNode, removeTransition, removeTarget } from '../../composables/workflow-ops.js';
import CanvasNode from './canvas-node.vue';
import CanvasTransition from './canvas-transition.vue';
import CanvasEdge from './canvas-edge.vue';

const edges = computed(() => {
  const result = [];
  workflow.spec.states.forEach(sourceState => {
    if (!sourceState.transitions) return;
    sourceState.transitions.forEach(transition => {
      // Edge 1: state to transition
      result.push({
        id: `s2t_${sourceState.name}_${transition.event}`,
        type: 'state-to-transition',
        sourceState,
        transition,
        startX: (sourceState.ui?.x || 0) + 70, // 140 / 2 = 70 (center of state node)
        startY: (sourceState.ui?.y || 0) + 22, // Center of state node (height roughly 44)
        endX: (transition.ui?.x || 0) + 25, // center of transition
        endY: (transition.ui?.y || 0) + 25, // center of transition
        showArrow: false
      });

      // Edge 2: transition to targets
      if (!transition.targets) return;
      transition.targets.forEach(target => {
        const targetState = workflow.spec.states.find(s => s.name === target.state);
        if (targetState) {
          result.push({
            id: `t2t_${sourceState.name}_${transition.event}_${targetState.name}`,
            type: 'transition-to-target',
            sourceState,
            transition,
            targetState,
            startX: (transition.ui?.x || 0) + 25, // center of transition
            startY: (transition.ui?.y || 0) + 25, // center of transition
            endX: (targetState.ui?.x || 0) + 70, // center of target state node
            endY: (targetState.ui?.y || 0) + 22, // center of target state node
            showArrow: true
          });
        }
      });
    });
  });
  return result;
});

const onCanvasMouseDown = (e) => {
  e.preventDefault();
  // Clear selection if we click on background
  clearSelection();

  const startX = e.clientX;
  const startY = e.clientY;
  const initialX = canvasState.offsetX;
  const initialY = canvasState.offsetY;

  const onMouseMove = (ev) => {
    canvasState.offsetX = initialX + ev.clientX - startX;
    canvasState.offsetY = initialY + ev.clientY - startY;
  };

  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
};

const onCanvasDoubleClick = (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left - canvasState.offsetX;
  const y = e.clientY - rect.top - canvasState.offsetY;

  const name = `state_${Date.now()}`;
  addState({
    name,
    title: '新任务',
    ui: { x, y },
    transitions: []
  });
};

const clearSelection = () => {
  selection.type = null;
  selection.data = null;
  selection.parent = null;
};

const onNodeClick = (node) => {
  selectNode(node);
};

const onTransitionClick = (transition, state) => {
  selectTransition(transition, state);
};

const onEdgeClick = (edge) => {
  if (edge.type === 'state-to-transition') {
    selectTransition(edge.transition, edge.sourceState);
  } else if (edge.type === 'transition-to-target') {
    selectTargetEdge(edge.transition, edge.targetState, edge.sourceState);
  }
};

const onKeyDown = (e) => {
  if (e.key === 'Delete' || e.key === 'Backspace') {
    // 检查当前是否有节点、连线被选中
    if (!selection.type) return;

    // 如果用户正在输入框、多行文本或任何可编辑元素中编辑内容，禁止触发删除
    const tagName = e.target.tagName;
    if (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT' || e.target.isContentEditable) {
      return;
    }

    if (selection.type === 'node' && selection.data) {
      removeNode(selection.data.name);
      clearSelection();
    } else if (selection.type === 'transition' && selection.data && selection.parent) {
      removeTransition(selection.parent, selection.data.event);
      clearSelection();
    } else if (selection.type === 'target-edge' && selection.data) {
      removeTarget(selection.data.transition, selection.data.targetState.name, selection.parent);
      clearSelection();
    }
  }
};

onMounted(() => {
  document.addEventListener('keydown', onKeyDown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', onKeyDown);
});
</script>

<style lang="less" scoped>
.canvas-board {
  flex: 1;
  position: relative;
  background-color: #fafafa;
  overflow: hidden;
  cursor: grab;
  outline: none;
  /* 移除选中时的焦点边框 */

  &:active {
    cursor: grabbing;
  }

  .edges-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;

    .drawing-line {
      stroke: #999;
      stroke-width: 2;
      stroke-dasharray: 5, 5;
    }
  }

  .nodes-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
}
</style>
