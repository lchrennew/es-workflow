<template>
  <div class="canvas-node" :data-name="node.name" :class="nodeClasses" :style="nodeStyle" @mousedown="onMouseDown"
    :title="node.title || node.name">
    <div class="node-icon" v-if="isRunning">
      <span class="running-icon">↻</span>
    </div>
    <div class="node-title">{{ node.title || node.name }}</div>
    <div class="node-ports" v-if="!readonly && node.name !== 'end' && node.emitter && hasAvailableEvents">
      <div class="port out-port" @mousedown.stop="onPortMouseDown"></div>
    </div>
    <div class="node-ports condition-ports"
      v-if="!readonly && node.conditions && node.name !== 'end' && !hasConditionNotMetTransition">
      <div class="port condition-port" @mousedown.stop="onConditionPortMouseDown" title="条件不满足时触发"></div>
    </div>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue';
import { selection as defaultSelection, WORKFLOW_SELECTION_KEY } from '../../composables/use-workflow.js';
import { useNodeDrag, usePortDrag } from '../../composables/use-drag.js';
import { emitterOptions } from '../../composables/emitters.js';

const { selection } = inject(WORKFLOW_SELECTION_KEY, { selection: defaultSelection });

const props = defineProps({
  node: { type: Object, default: () => ({}) },
  readonly: { type: Boolean, default: false }
});

const isSelected = computed(() => selection.type === 'node' && selection.data?.name === props.node.name);
const isSystem = computed(() => props.node.name === 'initial' || props.node.name === 'end');

// --- 运行时状态相关计算 ---
const hasRunInfo = computed(() => !!props.node.hasRunInfo);
const runStatus = computed(() => props.node.runStatus?.status);
const isRunning = computed(() => runStatus.value === 'initial' || runStatus.value === 'in-progress');
const endEvent = computed(() => props.node.runStatus?.endEvent);

const nodeClasses = computed(() => {
  return [
    { selected: isSelected.value, system: isSystem.value, readonly: props.readonly },
    hasRunInfo.value ? `run-status-${runStatus.value || 'none'}` : ''
  ];
});

const nodeStyle = computed(() => {
  const style = {
    left: `${props.node.ui?.x || 0}px`,
    top: `${props.node.ui?.y || 0}px`,
  };

  if (hasRunInfo.value && runStatus.value === 'completed') {
    let eventColor = null;

    // 尝试从 emitter 中获取对应事件的颜色
    if (props.node.emitter) {
      const emitterDef = emitterOptions.find(e => e.name === props.node.emitter);
      if (emitterDef && emitterDef.spec?.allowedEvents) {
        const evtDef = emitterDef.spec.allowedEvents.find(e => e.name === endEvent.value);
        if (evtDef && evtDef.color) {
          eventColor = evtDef.color;
        }
      }
    }

    // Fallback: 如果没有指定颜色，给常用的几个事件一些默认的成功/失败颜色
    if (!eventColor) {
      if (endEvent.value === 'passed' || endEvent.value === 'start') {
        eventColor = '#52c41a'; // 绿色 (成功)
      } else if (endEvent.value === 'rejected') {
        eventColor = '#f5222d'; // 红色 (拒绝)
      } else {
        eventColor = '#1890ff'; // 默认蓝色
      }
    }

    // 设置边框色，去掉透明背景以防止连线穿透
    style.borderColor = eventColor;
    style.backgroundColor = '#ffffff'; // 白色实底背景
    style.color = eventColor; // 让文字也保持一致色调

    if (isSelected.value) {
      let shadowColor = eventColor;
      if (eventColor.startsWith('#')) {
        let hex = eventColor.replace('#', '');
        if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
        if (hex.length === 6) {
          const r = parseInt(hex.substring(0, 2), 16);
          const g = parseInt(hex.substring(2, 4), 16);
          const b = parseInt(hex.substring(4, 6), 16);
          shadowColor = `rgba(${r}, ${g}, ${b}, 0.5)`;
        }
      }
      style.boxShadow = `0 0 0 4px ${shadowColor}`;
    }
  }

  return style;
});
// --------------------------

const hasAvailableEvents = computed(() => {
  if (props.node.name === 'initial') {
    return !(props.node.transitions?.length > 0);
  }

  if (!props.node.emitter) return false;

  const emitterDef = emitterOptions.find(e => e.name === props.node.emitter);
  if (!emitterDef) return false;

  const usedEvents = (props.node.transitions || []).map(t => t.event);
  const availableEvents = emitterDef.spec.allowedEvents.filter(evt => !usedEvents.includes(evt.name));

  return availableEvents.length > 0;
});

const hasConditionNotMetTransition = computed(() => {
  return (props.node.transitions || []).some(t => t.event === 'ignored');
});

const onMouseDown = (e) => {
  if (props.readonly) return;
  useNodeDrag(props.node)(e);
};
const onPortMouseDown = (e) => {
  if (props.readonly) return;
  usePortDrag('state', { state: props.node }, 'default')(e);
};
const onConditionPortMouseDown = (e) => {
  if (props.readonly) return;
  usePortDrag('state', { state: props.node }, 'condition')(e);
};
</script>

<style lang="less" scoped>
.canvas-node {
  position: absolute;
  width: 120px;
  background: white;
  border: 2px solid #ccc;
  border-radius: 6px;
  padding: 10px;
  cursor: move;
  pointer-events: auto;
  user-select: none;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: left 0.3s ease, top 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;

  &.selected {
    border-color: #42b983;
    box-shadow: 0 0 0 4px rgba(66, 185, 131, 0.5);
  }

  &.system {
    border-color: #e6a23c;
    background-color: #fdf6ec;
  }

  &.readonly {
    cursor: default;
  }

  .node-title {
    text-align: center;
    font-size: 14px;
    font-weight: bold;
    color: inherit;
  }

  /* --- 运行期状态样式 --- */
  &.run-status-none {
    background-color: #f5f5f5 !important;
    border-color: #d9d9d9 !important;
    color: #bfbfbf !important;
  }

  &.run-status-initial,
  &.run-status-in-progress {
    border-color: #1890ff !important;
    background-color: #1890ff !important;
    color: #ffffff !important;

    &.selected {
      box-shadow: 0 0 0 4px rgba(24, 144, 255, 0.5) !important;
    }
  }

  &.run-status-ignored {
    border-color: #ffa39e !important;
    background-color: #ffffff !important;
    color: #cf1322 !important;
  }

  &.run-status-completed {
    /* 颜色通过内联 style 计算设置 */
  }

  .node-icon {
    position: absolute;
    top: -10px;
    right: -10px;
    background: #1890ff;
    color: white;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    line-height: 1;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

    .running-icon {
      display: inline-block;
      animation: spin 2s linear infinite;
    }
  }

  @keyframes spin {
    100% {
      transform: rotate(360deg);
    }
  }

  /* ---------------------- */

  .node-ports {
    position: absolute;
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%);

    .port {
      width: 12px;
      height: 12px;
      background: white;
      border: 2px solid #ccc;
      border-radius: 50%;
      cursor: crosshair;

      &:hover {
        border-color: #42b983;
        background: #42b983;
      }
    }
  }

  .condition-ports {
    bottom: auto;
    left: auto;
    right: -6px;
    top: 50%;
    transform: translateY(-50%);

    .port {
      border-color: #f56c6c;

      &:hover {
        border-color: #f56c6c;
        background: #f56c6c;
      }
    }
  }
}
</style>
<style lang="less">
.is-dragging .canvas-node,
.disable-animation .canvas-node {
  transition: none !important;
}
</style>
