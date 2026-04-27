<template>
  <header class="editor-header">
    <div class="logo">ES-Workflow Editor</div>
    <div class="actions">
      <button class="btn-validate" @click="handleValidate">校验配置</button>
      <button class="btn-layout" @click="handleAutoLayout">自动布局</button>
      <button @click="showYaml = true">查看YAML</button>
      <button @click="printConfig">打印配置</button>
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
          <li v-for="(error, index) in validationErrors" :key="index">{{ error }}</li>
        </ul>
      </div>
    </a-modal>
  </header>
</template>

<script setup>
import { ref, watch } from 'vue';
import { Modal as AModal, message } from 'ant-design-vue';
import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined } from '@ant-design/icons-vue';
import { workflow, getCleanWorkflow } from '../../composables/use-workflow.js';
import { performAutoLayout } from '../../composables/workflow-ops.js';
import { validateWorkflow } from '../../utils/validator.js';
import { isPrefetchersLoading } from '../../composables/prefetchers.js';
import YamlViewer from './yaml-viewer.vue';

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

const printConfig = () => {
  // 移除为了UI展示添加的 ui 属性，只打印符合规范的 JSON
  const cleanWorkflow = getCleanWorkflow();
  console.log(JSON.stringify(cleanWorkflow, null, 2));
  alert('配置已打印到控制台，请查看！');
};
</script>

<style lang="less" scoped>
.editor-header {
  height: 50px;
  background-color: #2c3e50;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;

  .logo {
    font-size: 18px;
    font-weight: bold;
  }

  .actions {
    display: flex;
    gap: 10px;

    button {
      padding: 6px 12px;
      background-color: #42b983;
      border: none;
      border-radius: 4px;
      color: white;
      cursor: pointer;

      &:hover {
        background-color: #3aa876;
      }

      &.btn-layout {
        background-color: #409eff;

        &:hover {
          background-color: #66b1ff;
        }
      }

      &.btn-validate {
        background-color: #faad14;

        &:hover {
          background-color: #ffc53d;
        }
      }
    }
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
