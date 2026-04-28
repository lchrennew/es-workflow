<template>
  <a-modal title="配置预览 (YAML)" :open="visible" @cancel="close" width="600px" :footer="null" :bodyStyle="{ padding: 0 }">
    <div class="yaml-content">
      <a-textarea readonly :value="yamlContent" :rows="20" />
    </div>
  </a-modal>
</template>

<script setup>
import { computed } from 'vue';
import { Modal as AModal, Textarea as ATextarea } from 'ant-design-vue';
import { stringify } from 'yaml';
import { workflow, getCleanWorkflow } from '../../composables/use-workflow.js';


const visible = defineModel('visible', { type: Boolean, default: false });
const close = () => { visible.value = false; };

const yamlContent = computed(() => {
  if (!visible.value) return '';
  const cleanWorkflow = getCleanWorkflow();
  return stringify(cleanWorkflow);
});
</script>

<style lang="less" scoped>
.yaml-content {
  margin-top: 10px;

  :deep(textarea) {
    font-family: Consolas, Monaco, monospace;
    font-size: 14px;
    background-color: #f9f9f9;
    resize: none;
    border-radius: 4px;
    padding: 10px;
    outline: none;
  }
}
</style>