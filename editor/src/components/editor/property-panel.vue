<template>
  <div class="property-panel-wrapper">
    <a-drawer title="属性面板" placement="right" :open="isOpen" :mask="false" :closable="true" @close="handleClose"
      :getContainer="false" :style="{ position: 'absolute' }" width="300"
      :headerStyle="{ backgroundColor: '#eef0f2', borderBottom: '1px solid #ddd', padding: '15px' }"
      :bodyStyle="{ padding: '15px', backgroundColor: '#f8f9fa' }">
      <!-- Node/状态 编辑 -->
      <property-panel-node v-if="selection.type === 'node'" />

      <!-- Transition/事件 编辑 -->
      <property-panel-transition v-else-if="selection.type === 'transition'" />

      <!-- Target Edge/目标连线 编辑 -->
      <property-panel-target-edge v-else-if="selection.type === 'target-edge'" />

      <div v-else class="empty-tip">
        请选择节点、事件或连线
      </div>
    </a-drawer>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue';
import { Drawer as ADrawer } from 'ant-design-vue';
import { selection as defaultSelection, WORKFLOW_SELECTION_KEY, workflow, getCleanWorkflow } from '../../composables/use-workflow.js';

import PropertyPanelNode from './property-panel-node.vue';
import PropertyPanelTransition from './property-panel-transition.vue';
import PropertyPanelTargetEdge from './property-panel-target-edge.vue';

const { selection } = inject(WORKFLOW_SELECTION_KEY, { selection: defaultSelection });


// 1. 选择状态节点（不含开始和结束节点）、事件节点、目标连线时弹出
// 2. 取消选择时自动收回
const isOpen = computed(() => {
  if (!selection.showPanel) return false;

  if (!selection.type) return false;

  if (selection.type === 'node') {
    // 排除 initial 和 end 节点
    if (selection.data?.name === 'initial' || selection.data?.name === 'end') {
      return false;
    }
    return true;
  }

  if (selection.type === 'transition' || selection.type === 'target-edge') {
    return true;
  }

  return false;
});

const handleClose = () => {
  selection.showPanel = false;
};
</script>

<style lang="less" scoped>
.property-panel-wrapper {
  position: relative;
  height: 100%;
  width: 0;
  overflow: visible;

  // Drawer 内部可能出现提示时需要一些基本样式
  :deep(.ant-drawer-body) {
    .empty-tip {
      text-align: center;
      color: #999;
      margin-top: 50px;
    }
  }
}
</style>
