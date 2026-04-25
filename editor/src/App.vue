<template>
  <workflow-editor v-model:value="workflowYaml" :fetchEmitters="mockFetchEmitters" />
</template>

<script setup>
import { ref } from 'vue';
import WorkflowEditor from './components/editor/workflow-editor.vue';

// 绑定的 yaml 数据
const workflowYaml = ref('');

// 模拟的异步拉取 emitters 方法
const mockFetchEmitters = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          kind: 'workflow-transition-emitter',
          name: 'demo/approval',
          metadata: {
            title: '审批场景 emitter (来自远程)',
            forUserState: true
          },
          spec: {
            allowedActions: [
              { action: 'ACCEPT', title: '通过' },
              { action: 'REFUSE', title: '拒绝' }
            ],
            allowedEvents: [
              { name: 'passed', title: '通过' },
              { name: 'rejected', title: '拒绝' }
            ]
          }
        },
        {
          kind: 'workflow-transition-emitter',
          name: 'system/start',
          metadata: {
            title: '开始节点 emitter',
            forUserState: false
          },
          spec: {
            allowedActions: [],
            allowedEvents: [
              { name: 'start', title: '启动' }
            ]
          }
        }
      ]);
    }, 500);
  });
};
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
  height: 100vh;
}
</style>
