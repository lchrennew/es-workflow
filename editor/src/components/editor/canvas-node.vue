<template>
  <div class="canvas-node" :data-name="node.name" :class="{ selected: isSelected, system: isSystem }"
    :style="{ left: `${node.ui?.x || 0}px`, top: `${node.ui?.y || 0}px` }" @mousedown="onMouseDown"
    :title="node.title || node.name">
    <div class="node-title">{{ node.title || node.name }}</div>
    <div class="node-ports" v-if="node.name !== 'end' && node.emitter && hasAvailableEvents">
      <div class="port out-port" @mousedown.stop="onPortMouseDown"></div>
    </div>
    <div class="node-ports condition-ports"
      v-if="node.conditions && node.name !== 'end' && !hasConditionNotMetTransition">
      <div class="port condition-port" @mousedown.stop="onConditionPortMouseDown" title="条件不满足时触发"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { selection } from '../../composables/use-workflow.js';
import { useNodeDrag, usePortDrag } from '../../composables/use-drag.js';
import { emitterOptions } from '../../composables/emitters.js';

const props = defineProps({ node: Object });

const isSelected = computed(() => selection.type === 'node' && selection.data?.name === props.node.name);
const isSystem = computed(() => props.node.name === 'initial' || props.node.name === 'end');

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

const onMouseDown = (e) => useNodeDrag(props.node)(e);
const onPortMouseDown = (e) => usePortDrag('state', { state: props.node }, 'default')(e);
const onConditionPortMouseDown = (e) => usePortDrag('state', { state: props.node }, 'condition')(e);
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

  &.selected {
    border-color: #42b983;
    box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.3);
  }

  &.system {
    border-color: #e6a23c;
    background-color: #fdf6ec;
  }

  .node-title {
    text-align: center;
    font-size: 14px;
    font-weight: bold;
    color: #333;
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
