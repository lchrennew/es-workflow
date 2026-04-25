<template>
  <header class="editor-header">
    <div class="logo">ES-Workflow Editor</div>
    <div class="actions">
      <button class="btn-layout" @click="handleAutoLayout">自动布局</button>
      <button @click="showYaml = true">查看YAML</button>
      <button @click="printConfig">打印配置</button>
    </div>

    <yaml-viewer v-model:visible="showYaml" />
  </header>
</template>

<script setup>
import { ref } from 'vue';
import { workflow, getCleanWorkflow } from '../../composables/use-workflow.js';
import { performAutoLayout } from '../../composables/workflow-ops.js';
import YamlViewer from './yaml-viewer.vue';

const showYaml = ref(false);

const handleAutoLayout = () => {
  performAutoLayout();
};

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
    }
  }
}
</style>
