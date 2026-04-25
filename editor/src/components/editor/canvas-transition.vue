<template>
  <div class="canvas-transition" :class="transitionClasses" :style="transitionStyle" @mousedown="onMouseDown"
    :title="displayTitle">
    <div class="transition-title">{{ displayTitle }}</div>
    <div class="node-ports" v-if="!readonly">
      <div class="port out-port" @mousedown.stop="onPortMouseDown"></div>
    </div>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue';
import { selection as defaultSelection, WORKFLOW_SELECTION_KEY } from '../../composables/use-workflow.js';
import { useNodeDrag, usePortDrag } from '../../composables/use-drag.js';
import { getEventDisplayName, emitterOptions } from '../../composables/emitters.js';

const { selection } = inject(WORKFLOW_SELECTION_KEY, { selection: defaultSelection });

const props = defineProps({
  transition: Object,
  sourceState: Object,
  readonly: Boolean
});

const isSelected = computed(() => selection.type === 'transition' && selection.data === props.transition);

// 判断当前事件是否是源状态节点的 endEvent
const isEndEvent = computed(() => {
  return props.sourceState?.runStatus?.endEvent === props.transition.event;
});

const transitionClasses = computed(() => {
  return [
    {
      selected: isSelected.value,
      ignored: props.transition.event === 'ignored',
      readonly: props.readonly,
      'is-end-event': isEndEvent.value,
      'not-end-event': props.readonly && !isEndEvent.value // 在只读(viewer)模式下，不是触发的事件加上特殊类
    }
  ];
});

const transitionStyle = computed(() => {
  const style = {
    left: `${props.transition.ui?.x || 0}px`,
    top: `${props.transition.ui?.y || 0}px`
  };

  // 如果是 endEvent，应用对应的颜色
  if (isEndEvent.value) {
    let eventColor = null;
    if (props.sourceState.emitter) {
      const emitterDef = emitterOptions.find(e => e.name === props.sourceState.emitter);
      if (emitterDef && emitterDef.spec?.allowedEvents) {
        const evtDef = emitterDef.spec.allowedEvents.find(e => e.name === props.transition.event);
        if (evtDef && evtDef.color) {
          eventColor = evtDef.color;
        }
      }
    }

    // Fallback 颜色
    if (!eventColor) {
      if (props.transition.event === 'passed' || props.transition.event === 'start') {
        eventColor = '#52c41a';
      } else if (props.transition.event === 'rejected') {
        eventColor = '#f5222d';
      } else {
        eventColor = '#1890ff';
      }
    }

    style.borderColor = eventColor;
    style.color = eventColor;
  }

  return style;
});

const displayTitle = computed(() => {
  return getEventDisplayName(props.transition.event, props.sourceState);
});

const onMouseDown = (e) => {
  if (props.readonly) return;
  useNodeDrag(props.transition)(e);
};
const onPortMouseDown = (e) => {
  if (props.readonly) return;
  usePortDrag('transition', { state: props.sourceState, transition: props.transition })(e);
};
</script>

<style lang="less" scoped>
.canvas-transition {
  position: absolute;
  width: 50px;
  height: 50px;
  background: white;
  border: 2px solid #ccc;
  border-radius: 50%;
  cursor: move;
  pointer-events: auto;
  user-select: none;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;

  &.selected {
    border-color: #42b983;
    box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.3);
  }

  &.ignored {
    background-color: #fff0f0;
    border-color: #ffcccc;

    .transition-title {
      color: #f5222d;
    }

    &.selected {
      border-color: #f5222d;
      box-shadow: 0 0 0 2px rgba(245, 34, 45, 0.3);
    }
  }

  /* --- 运行期状态（Viewer 模式）相关样式 --- */
  &.readonly {
    cursor: default;
  }

  &.not-end-event {
    background-color: #f5f5f5 !important;
    border-color: #d9d9d9 !important;
    color: #bfbfbf !important;

    .transition-title {
      color: #bfbfbf !important;
    }
  }

  /* 如果是作为 endEvent 触发的事件，加上阴影和高亮粗体使其更明显 */
  &.is-end-event {
    box-shadow: 0 0 6px currentcolor;

    .transition-title {
      font-weight: bold;
    }
  }

  /* -------------------------------------- */

  .transition-title {
    font-size: 10px;
    color: inherit;
    text-align: center;
    width: 40px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

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
}
</style>
