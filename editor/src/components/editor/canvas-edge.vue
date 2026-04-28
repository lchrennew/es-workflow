<template>
  <g class="canvas-edge"
    :class="{ selected: isSelected, 'not-end-event': edge.notEndEvent, 'is-viewer': edge.isViewer }"
    @click="emit('click')">
    <!-- 加宽的隐形点击区域 -->
    <path class="edge-path-click-area" :d="pathD" fill="none" stroke="transparent" stroke-width="15" />

    <!-- 单层流动的虚线 -->
    <path class="edge-path-animated" :d="pathD" :style="customStyle" fill="none" />
  </g>
</template>

<script setup>
import { computed, inject } from 'vue';
import { selection as defaultSelection, WORKFLOW_SELECTION_KEY } from '../../composables/use-workflow.js';

const { selection } = inject(WORKFLOW_SELECTION_KEY, { selection: defaultSelection });

const props = defineProps({
  edge: { type: Object, required: true }
});

const emit = defineEmits(['click']);

const isSelected = computed(() => {
  if (selection.type === 'target-edge') {
    return props.edge.type === 'transition-to-target' &&
      selection.data?.transition?.event === props.edge.transition?.event &&
      selection.parent?.name === props.edge.sourceState?.name &&
      selection.data?.targetState?.name === props.edge.targetState?.name;
  }
  if (selection.type === 'transition') {
    return props.edge.type === 'state-to-transition' &&
      selection.data?.event === props.edge.transition?.event &&
      selection.parent?.name === props.edge.sourceState?.name;
  }
  return false;
});

const customStyle = computed(() => {
  if (props.edge.eventColor && !props.edge.notEndEvent) {
    return {
      stroke: props.edge.eventColor
    };
  }
  return {};
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

  /* 在 viewer 模式下，禁用鼠标交互的光标样式 */
  &.is-viewer {
    cursor: default;
  }

  .edge-path-click-area {
    fill: none;
    stroke: transparent;
    stroke-width: 15;
    transition: d 0.3s ease;
  }

  .edge-path-animated {
    fill: none;
    stroke: #b3c0d1;
    /* 默认灰色虚线 */
    stroke-width: 2;
    transition: d 0.3s ease, stroke 0.3s ease, stroke-width 0.3s ease;

    stroke-dasharray: 6,
      6;
    animation: flow 1s linear infinite;
  }

  /* 在 viewer 模式下，未触发的连线恢复原始默认颜色，取消之前的加深覆盖 */
  &.not-end-event {
    .edge-path-animated {
      /* 移除强制浅灰或深灰的颜色覆盖，让它使用基础样式 stroke: #b3c0d1; */
      stroke-width: 1;
    }
  }

  /* 非 viewer 模式才允许悬浮和选中高亮 */
  &:not(.is-viewer):hover,
  &:not(.is-viewer).selected {
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
<style lang="less">
.is-dragging .canvas-edge .edge-path-click-area,
.is-dragging .canvas-edge .edge-path-animated,
.disable-animation .canvas-edge .edge-path-click-area,
.disable-animation .canvas-edge .edge-path-animated {
  transition: none !important;
}
</style>
