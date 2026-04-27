<template>
  <div class="canvas-board" tabindex="0" @mousedown.self="onCanvasMouseDown" @dblclick.self="onCanvasDoubleClick"
    @click.self="onCanvasClick" @contextmenu.prevent.self="onCanvasContextMenu"
    :class="{ readonly, 'is-dragging': localCanvasState.isDragging, 'disable-animation': localCanvasState.isAnimatingDisabled }">

    <!-- Canvas validation indicator -->
    <div class="canvas-validator-indicator" @click="showValidation = true" v-if="!readonly">
      <template v-if="isPrefetchersLoading">
        <loading-outlined class="indicator-icon loading" style="color: #1890ff;" />
      </template>
      <template v-else-if="validationErrors.length === 0">
        <check-circle-outlined class="indicator-icon success" />
      </template>
      <template v-else>
        <a-badge :count="validationErrors.length" :number-style="{ backgroundColor: '#f5222d' }">
          <warning-outlined class="indicator-icon error" />
        </a-badge>
      </template>
    </div>

    <!-- Validation modal -->
    <a-modal title="配置校验结果" :open="showValidation" @cancel="showValidation = false" :footer="null">
      <div v-if="isPrefetchersLoading" class="validation-loading">
        <loading-outlined style="color: #1890ff; font-size: 24px; margin-right: 8px;" />
        <span>依赖数据正在加载中，请稍候...</span>
      </div>
      <div v-else-if="validationErrors.length === 0" class="validation-success">
        <check-circle-outlined style="color: #52c41a; font-size: 24px; margin-right: 8px;" />
        <span>校验通过，配置符合规范！</span>
      </div>
      <div v-else class="validation-error">
        <close-circle-outlined style="color: #f5222d; font-size: 24px; margin-right: 8px;" />
        <span style="font-weight: bold;">发现 {{ validationErrors.length }} 个配置错误：</span>
        <ul class="error-list">
          <li v-for="(error, index) in validationErrors">{{ error }}</li>
        </ul>
      </div>
    </a-modal>

    <svg class="edges-layer" style="overflow: visible;">
      <g :transform="`translate(${localCanvasState.offsetX}, ${localCanvasState.offsetY})`">
        <!-- Edges -->
        <canvas-edge v-for="edge in edges" :edge="edge" @click="onEdgeClick(edge)"
          @contextmenu.prevent="onEdgeContextMenu(edge)" />
        <!-- Drawing Line -->
        <line v-if="localDrawing.isDrawing && !readonly" :x1="localDrawing.startX" :y1="localDrawing.startY"
          :x2="localDrawing.currentX" :y2="localDrawing.currentY" class="drawing-line" />
      </g>
    </svg>

    <div class="nodes-layer"
      :style="{ transform: `translate(${localCanvasState.offsetX}px, ${localCanvasState.offsetY}px)` }">
      <!-- Nodes -->
      <canvas-node v-for="state in currentWorkflow.spec.states" :node="state" :readonly="readonly"
        @click="onNodeClick(state)" @contextmenu.prevent="onNodeContextMenu(state)" />
      <!-- Transitions -->
      <template v-for="state in currentWorkflow.spec.states">
        <canvas-transition v-for="transition in state.transitions" :transition="transition" :sourceState="state"
          :readonly="readonly" @click="onTransitionClick(transition, state)"
          @contextmenu.prevent="onTransitionContextMenu(transition, state)" />
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, inject, watch, ref } from 'vue';
import { Modal as AModal, Badge as ABadge } from 'ant-design-vue';
import { WarningOutlined, CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined } from '@ant-design/icons-vue';
import { validateWorkflow } from '../../utils/validator.js';
import { workflow, getCleanWorkflow, selection as defaultSelection, drawing as globalDrawing, selectNode as defaultSelectNode, selectTransition as defaultSelectTransition, selectTargetEdge as defaultSelectTargetEdge, selectWorkflow as defaultSelectWorkflow, clearSelection as defaultClearSelection, canvasState as globalCanvasState, WORKFLOW_SELECTION_KEY, disableAnimationTemporarily } from '../../composables/use-workflow.js';
import { addState } from '../../composables/use-workflow.js';
import { removeNode, removeTransition, removeTarget, performAutoLayout } from '../../composables/workflow-ops.js';
import CanvasNode from './canvas-node.vue';
import CanvasTransition from './canvas-transition.vue';
import CanvasEdge from './canvas-edge.vue';
import { emitterOptions } from '../../composables/emitters.js';
import { prefetchers, isPrefetchersLoading } from '../../composables/prefetchers.js';

const { selection, selectNode, selectTransition, selectTargetEdge, selectWorkflow, clearSelection } = inject(WORKFLOW_SELECTION_KEY, {
  selection: defaultSelection,
  selectNode: defaultSelectNode,
  selectTransition: defaultSelectTransition,
  selectTargetEdge: defaultSelectTargetEdge,
  selectWorkflow: defaultSelectWorkflow,
  clearSelection: defaultClearSelection
});

const props = defineProps({
  workflowData: {
    type: Object,
    default: null
  },
  readonly: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits([
  'state-click',
  'state-contextmenu',
  'transition-click',
  'transition-contextmenu',
  'target-click',
  'target-contextmenu',
  'canvas-click',
  'canvas-contextmenu'
]);

const localCanvasState = props.readonly ? reactive({ offsetX: 0, offsetY: 0 }) : globalCanvasState;
const localDrawing = props.readonly ? reactive({ isDrawing: false }) : globalDrawing;

const currentWorkflow = computed(() => props.workflowData || workflow);

const showValidation = ref(false);
const validationErrors = ref([]);

// 只要 spec.states 改变就触发校验 (类似IDEA的代码警告)
let validationTimeout = null;
watch(
  [() => currentWorkflow.value?.spec?.states, () => prefetchers.length, () => isPrefetchersLoading.value],
  () => {
    if (validationTimeout) {
      clearTimeout(validationTimeout);
      validationTimeout = null;
    }

    if (props.readonly) return;

    if (isPrefetchersLoading.value) {
      // 处于加载状态时清空历史错误，避免加载完成后防抖期间显示旧的误报
      validationErrors.value = [];
      return;
    }

    validationTimeout = setTimeout(() => {
      const cleanConfig = getCleanWorkflow();
      const result = validateWorkflow(cleanConfig);
      validationErrors.value = result.errors;
    }, 500);
  },
  { deep: true, immediate: true }
);

const edges = computed(() => {
  const result = [];
  if (!currentWorkflow.value || !currentWorkflow.value.spec || !currentWorkflow.value.spec.states) return result;
  currentWorkflow.value.spec.states.forEach(sourceState => {
    if (!sourceState.transitions) return;
    sourceState.transitions.forEach(transition => {
      // Edge 1: state to transition
      const isEndEvent = props.readonly && sourceState.runStatus?.endEvent === transition.event;
      let eventColor = null;

      // 如果是 endEvent，计算颜色以供连线使用
      if (isEndEvent) {
        // 先检查 transition 上有没有存下来的样式颜色 (如果有直接复用最准确)
        if (sourceState.emitter) {
          if (emitterOptions && emitterOptions.value) {
            const emitterDef = emitterOptions.value.find(e => e.name === sourceState.emitter);
            if (emitterDef && emitterDef.spec?.allowedEvents) {
              const evtDef = emitterDef.spec.allowedEvents.find(e => e.name === transition.event);
              if (evtDef && evtDef.color) {
                eventColor = evtDef.color;
              }
            }
          }
        }

        // Fallback 颜色
        if (!eventColor) {
          if (transition.event === 'passed' || transition.event === 'start') {
            eventColor = '#52c41a';
          } else if (transition.event === 'rejected') {
            eventColor = '#f5222d';
          } else {
            eventColor = '#1890ff';
          }
        }
      }

      result.push({
        id: `s2t_${sourceState.name}_${transition.event}`,
        type: 'state-to-transition',
        sourceState,
        transition,
        startX: (sourceState.ui?.x || 0) + 70, // 140 / 2 = 70 (center of state node)
        startY: (sourceState.ui?.y || 0) + 22, // Center of state node (height roughly 44)
        endX: (transition.ui?.x || 0) + 25, // center of transition
        endY: (transition.ui?.y || 0) + 25, // center of transition
        showArrow: false,
        notEndEvent: props.readonly && !isEndEvent,
        isViewer: props.readonly,
        eventColor: eventColor
      });

      // Edge 2: transition to targets
      if (!transition.targets) return;
      transition.targets.forEach(target => {
        const targetState = currentWorkflow.value.spec.states.find(s => s.name === target.state);
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
            showArrow: true,
            notEndEvent: props.readonly && !isEndEvent,
            isViewer: props.readonly,
            eventColor: eventColor
          });
        }
      });
    });
  });
  return result;
});

watch(
  [
    () => currentWorkflow.value?.spec?.states?.length,
    () => edges.value.length
  ],
  (newVals, oldVals) => {
    if (oldVals[0] !== undefined && oldVals[1] !== undefined) {
      if (newVals[0] !== oldVals[0] || newVals[1] !== oldVals[1]) {
        disableAnimationTemporarily();
      }
    }
  }
);

const onCanvasMouseDown = (e) => {
  e.preventDefault();
  // Clear selection if we click on background
  clearSelection();

  localCanvasState.isDragging = true;
  const startX = e.clientX;
  const startY = e.clientY;
  const initialX = localCanvasState.offsetX;
  const initialY = localCanvasState.offsetY;

  const onMouseMove = (ev) => {
    localCanvasState.offsetX = initialX + ev.clientX - startX;
    localCanvasState.offsetY = initialY + ev.clientY - startY;
  };

  const onMouseUp = () => {
    localCanvasState.isDragging = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
};

const onCanvasDoubleClick = (e) => {
  if (props.readonly) return;

  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left - localCanvasState.offsetX;
  const y = e.clientY - rect.top - localCanvasState.offsetY;

  const name = `state_${Date.now()}`;
  addState({
    name,
    title: '新任务',
    ui: { x, y },
    transitions: []
  });
};

const onCanvasClick = (e) => {
  clearSelection();
  emit('canvas-click', e);
};

const onCanvasContextMenu = (e) => {
  if (!props.readonly) {
    selectWorkflow();
  }
  emit('canvas-contextmenu', e);
};

const onNodeClick = (node) => {
  if (!props.readonly) {
    selectNode(node);
  }
  emit('state-click', node);
};

const onNodeContextMenu = (node) => {
  selectNode(node);
  emit('state-contextmenu', node);
};

const onTransitionClick = (transition, state) => {
  if (!props.readonly) {
    selectTransition(transition, state);
  }
  emit('transition-click', transition, state);
};

const onTransitionContextMenu = (transition, state) => {
  if (!props.readonly) {
    selectTransition(transition, state);
  }
  emit('transition-contextmenu', transition, state);
};

const onEdgeClick = (edge) => {
  if (!props.readonly) {
    if (edge.type === 'state-to-transition') {
      selectTransition(edge.transition, edge.sourceState);
    } else if (edge.type === 'transition-to-target') {
      selectTargetEdge(edge.transition, edge.targetState, edge.sourceState);
    }
  }
  if (edge.type === 'state-to-transition') {
    emit('transition-click', edge.transition, edge.sourceState);
  } else if (edge.type === 'transition-to-target') {
    emit('target-click', edge);
  }
};

const onEdgeContextMenu = (edge) => {
  if (!props.readonly) {
    if (edge.type === 'state-to-transition') {
      selectTransition(edge.transition, edge.sourceState);
    } else if (edge.type === 'transition-to-target') {
      selectTargetEdge(edge.transition, edge.targetState, edge.sourceState);
    }
  }
  if (edge.type === 'state-to-transition') {
    emit('transition-contextmenu', edge.transition, edge.sourceState);
  } else if (edge.type === 'transition-to-target') {
    emit('target-contextmenu', edge);
  }
};

const onKeyDown = (e) => {
  if (props.readonly) return;

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

const checkAndApplyLayout = () => {
  if (!currentWorkflow.value || !currentWorkflow.value.spec || !currentWorkflow.value.spec.states) return;
  const states = currentWorkflow.value.spec.states;
  const needsLayout = states.some(s => !s.ui || (s.ui.x === undefined && s.ui.y === undefined));
  if (needsLayout) {
    performAutoLayout(states, localCanvasState);
  }
};

watch(() => props.workflowData, () => {
  checkAndApplyLayout();
}, { deep: true, immediate: true });

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

  .canvas-validator-indicator {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 100;
    cursor: pointer;
    background: white;
    padding: 8px;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s;

    &:hover {
      transform: scale(1.1);
    }

    .indicator-icon {
      font-size: 24px;

      &.success {
        color: #52c41a;
      }

      &.error {
        color: #faad14;
      }
    }
  }

  .validation-loading,
  .validation-success {
    display: flex;
    align-items: center;
    padding: 20px 0;
    font-size: 16px;
  }

  .validation-error {
    padding: 10px 0;

    .error-list {
      margin-top: 10px;
      padding-left: 20px;
      color: #f5222d;
      max-height: 300px;
      overflow-y: auto;

      li {
        margin-bottom: 8px;
      }
    }
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
