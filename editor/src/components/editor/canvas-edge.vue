<template>
  <g class="canvas-edge" :class="{ selected: isSelected }" @click="emit('click')">
    <!-- 加宽的隐形点击区域 -->
    <path class="edge-path-click-area" :d="pathD" fill="none" stroke="transparent" stroke-width="15" />

    <!-- 单层流动的虚线 -->
    <path class="edge-path-animated" :d="pathD" fill="none" />
  </g>
</template>

<script setup>
import { computed } from 'vue';
import { selection } from '../../composables/use-workflow.js';

const props = defineProps({
  edge: Object
});

const emit = defineEmits(['click']);

const isSelected = computed(() => {
  if (selection.type === 'target-edge' && selection.data?.transition === props.edge.transition && selection.data?.targetState === props.edge.targetState) {
    return true;
  }
  if (selection.type === 'transition' && props.edge.type === 'state-to-transition' && selection.data === props.edge.transition) {
    return true;
  }
  return false;
});

const pathD = computed(() => {
  const sx = props.edge.startX;
  const sy = props.edge.startY;
  const ex = props.edge.endX;
  const ey = props.edge.endY;

  // 如果是目标线，并且是自己连自己（自环），则绘制弧线以避免重叠
  if (
    props.edge.type === 'transition-to-target' &&
    props.edge.sourceState?.name === props.edge.targetState?.name
  ) {
    const dx = ex - sx;
    const dy = ey - sy;
    const length = Math.sqrt(dx * dx + dy * dy);

    // 如果起点终点不重合，通过法向量计算贝塞尔曲线的控制点
    if (length > 0) {
      const midX = (sx + ex) / 2;
      const midY = (sy + ey) / 2;
      const normalX = -dy / length;
      const normalY = dx / length;
      // 偏移量，值越大弧度越大，这里固定向一侧偏移 60 像素
      const offset = 60;
      const cx = midX + normalX * offset;
      const cy = midY + normalY * offset;
      return `M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}`;
    }
  }

  // 直接返回连接起止点的直线
  return `M ${sx} ${sy} L ${ex} ${ey}`;
});
</script>

<style lang="less" scoped>
.canvas-edge {
  cursor: pointer;
  pointer-events: auto;

  .edge-path-click-area {
    fill: none;
    stroke: transparent;
    stroke-width: 15;
  }

  .edge-path-animated {
    fill: none;
    stroke: #b3c0d1;
    /* 默认灰色虚线 */
    stroke-width: 2;
    stroke-dasharray: 6, 6;
    animation: flow 1s linear infinite;
  }

  &:hover,
  &.selected {
    .edge-path-animated {
      stroke-width: 3;
      stroke: #67c23a;
      /* 选中或悬停时变为绿色 */
    }
  }
}

@keyframes flow {
  from {
    stroke-dashoffset: 12;
  }

  to {
    stroke-dashoffset: 0;
  }
}
</style>
