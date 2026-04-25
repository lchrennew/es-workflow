<template>
  <div class="app-container">
    <div class="panel editor-panel">
      <workflow-editor v-model:value="workflowYaml" :fetchEmitters="mockFetchEmitters"
        :fetchEmitterRules="mockFetchEmitterRules" :fetchPrefetchers="mockFetchPrefetchers" />
    </div>
    <div class="panel viewer-panel">
      <workflow-run-viewer v-if="mockWorkflowRun.config" :workflowRun="mockWorkflowRun"
        :fetchEmitters="mockFetchEmitters" />
      <div v-else class="empty-viewer">
        暂无有效的工作流配置
      </div>
    </div>
  </div>
</template>

<script setup>
import WorkflowEditor from './components/editor/workflow-editor.vue';
import WorkflowRunViewer from './components/editor/workflow-run-viewer.vue';
import { mockedEmitters } from "./mocked-emitters.js";
import { mockedEmitterRules } from "./mocked-emitter-rules.js";
import { mockedPrefetchers } from "./mocked-prefetchers.js";
import { workflowYaml } from "./mocked-workflow.js";
import { mockWorkflowRun } from "./mocked-workflow-run.js";

// 模拟的异步拉取 emitters 方法
const mockFetchEmitters = async () =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockedEmitters);
    }, 500);
  });


// 模拟的异步拉取 emitter rules 方法
const mockFetchEmitterRules = async () =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockedEmitterRules);
    }, 500);
  });
// 模拟的异步拉取 prefetchers 方法
const mockFetchPrefetchers = async () =>
  new Promise((resolve) => {
    setTimeout(() => {

      resolve(mockedPrefetchers);
    }, 500);
  });
</script>

<style lang="less">
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: Arial, sans-serif;
  overflow: hidden;
}

#app {
  height: 600px;
}

.app-container {
  display: flex;
  height: 100%;
  width: 100%;
}

.panel {
  flex: 1;
  height: 100%;
  overflow: hidden;
}

.editor-panel {
  border: 1px solid #ddd;
}

.viewer-panel {
  background-color: #fafafa;
}

.empty-viewer {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #999;
  font-size: 14px;
}
</style>
