<template>
  <div 
    class="canvas-transition" 
    :class="{ selected: isSelected, ignored: transition.event === 'ignored' }"
    :style="{ left: `${transition.ui?.x || 0}px`, top: `${transition.ui?.y || 0}px` }"
    @mousedown="onMouseDown"
    :title="displayTitle"
  >
    <div class="transition-title">{{ displayTitle }}</div>
    <div class="node-ports">
      <div class="port out-port" @mousedown.stop="onPortMouseDown"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { selection } from '../../composables/use-workflow.js';
import { useNodeDrag, usePortDrag } from '../../composables/use-drag.js';
import { getEventDisplayName } from '../../composables/emitters.js';

const props = defineProps({ 
  transition: Object,
  sourceState: Object
});

const isSelected = computed(() => selection.type === 'transition' && selection.data === props.transition);

const displayTitle = computed(() => {
  return getEventDisplayName(props.transition.event, props.sourceState);
});

const onMouseDown = (e) => useNodeDrag(props.transition)(e);
const onPortMouseDown = (e) => usePortDrag('transition', { state: props.sourceState, transition: props.transition })(e);
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
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  
  &.selected {
    border-color: #42b983;
    box-shadow: 0 0 0 2px rgba(66,185,131,0.3);
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
  
  .transition-title {
    font-size: 10px;
    color: #333;
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
