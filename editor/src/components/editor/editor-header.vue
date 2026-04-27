<template>
  <header class="editor-header">
    <div class="logo">{{ displayTitle }}</div>
    <div class="actions">
      <a-button-group>
        <a-button @click="undo" :disabled="!canUndo()" title="撤销 (Cmd+Z)">
          <template #icon><undo-outlined /></template>
        </a-button>
        <a-button @click="redo" :disabled="!canRedo()" title="重做 (Cmd+Shift+Z)">
          <template #icon><redo-outlined /></template>
        </a-button>
      </a-button-group>
      <a-button type="primary" @click="handleAutoLayout">自动布局</a-button>
      <a-button @click="showYaml = true">查看YAML</a-button>
    </div>

    <yaml-viewer v-model:visible="showYaml" />

    <!-- 校验结果弹窗 -->
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
  </header>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { Modal as AModal, message, Button as AButton, ButtonGroup as AButtonGroup } from 'ant-design-vue';
import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined, UndoOutlined, RedoOutlined } from '@ant-design/icons-vue';
import { workflow, getCleanWorkflow } from '../../composables/use-workflow.js';
import { performAutoLayout } from '../../composables/workflow-ops.js';
import { validateWorkflow } from '../../utils/validator.js';
import { isPrefetchersLoading } from '../../composables/prefetchers.js';
import { undo, redo, canUndo, canRedo } from '../../composables/use-history.js';
import YamlViewer from './yaml-viewer.vue';

const displayTitle = computed(() => workflow.metadata?.title || workflow.name || 'ES-Workflow Editor');

const showYaml = ref(false);
const showValidation = ref(false);
const validationErrors = ref([]);

const handleAutoLayout = () => {
  performAutoLayout();
};

const handleValidate = () => {
  if (isPrefetchersLoading.value) {
    showValidation.value = true;
    return;
  }
  const cleanConfig = getCleanWorkflow();
  const result = validateWorkflow(cleanConfig);
  validationErrors.value = result.errors;
  showValidation.value = true;
};

watch(isPrefetchersLoading, (loading) => {
  if (!loading && showValidation.value) {
    handleValidate();
  }
});
</script>

<style lang="less" scoped>
.editor-header {
  height: 50px;
  background-color: #ffffff;
  color: #333333;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;

  .logo {
    font-size: 18px;
    font-weight: bold;
    color: #1890ff;
  }

  .actions {
    display: flex;
    gap: 10px;
    align-items: center;
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
</style>
