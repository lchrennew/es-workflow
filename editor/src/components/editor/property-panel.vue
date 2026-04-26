<template>
  <div class="property-panel-wrapper">
      <a-drawer :bodyStyle="{ padding: '15px', backgroundColor: '#f8f9fa' }"
                :closable="true"
                :getContainer="false"
                :headerStyle="{ backgroundColor: '#eef0f2', borderBottom: '1px solid #ddd', padding: '15px' }"
                :mask="false"
                :open="isOpen"
                destroy-on-close
                placement="right"
                title="属性面板"
                width="300"
                @close="handleClose">
          <property-panel-content :type="cachedType" />
      </a-drawer>
  </div>
</template>

<script setup>
import { computed, inject, ref, watch } from 'vue';
import { Drawer as ADrawer } from 'ant-design-vue';
import { selection as defaultSelection, WORKFLOW_SELECTION_KEY, workflow, getCleanWorkflow } from '../../composables/use-workflow.js';

import PropertyPanelContent from './property-panel-content.vue';

const { selection } = inject(WORKFLOW_SELECTION_KEY, { selection: defaultSelection });

const cachedType = ref(null);
watch(() => selection.type, (val) => {
  if (val) {
    cachedType.value = val;
  }
}, { immediate: true });

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
}
</style>
