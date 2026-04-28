<template>
  <div class="workflow-run-viewer-container">
    <div class="viewer-main">
      <canvas-board :workflowData="enrichedWorkflowData" :readonly="true" @state-contextmenu="onNodeContextMenu" />
    </div>

    <!-- 运行详情抽屉 -->
    <a-drawer :bodyStyle="{ padding: '15px', backgroundColor: '#f8f9fa' }" :closable="true" :getContainer="false"
      :headerStyle="{ backgroundColor: '#eef0f2', borderBottom: '1px solid #ddd', padding: '15px' }" :mask="false"
      :open="drawerVisible"
      :title="cachedSelectedNode ? (cachedSelectedNode.title || cachedSelectedNode.name) : '节点运行详情'" destroy-on-close
      placement="right" width="350" @close="closeDrawer">
      <workflow-run-viewer-drawer-content :selectedNode="cachedSelectedNode" />
    </a-drawer>
  </div>
</template>

<script setup>
import { computed, onMounted, provide, reactive, ref, watch } from 'vue';
import { Drawer as ADrawer } from 'ant-design-vue';
import CanvasBoard from './canvas-board.vue';
import WorkflowRunViewerDrawerContent from './workflow-run-viewer-drawer-content.vue';
import { createSelectionState, WORKFLOW_SELECTION_KEY } from '../../composables/use-workflow.js';
import { updateEmitters } from '../../composables/emitters.js';

const props = defineProps({
  workflowRun: { type: Object, required: true },
  fetchEmitters: { type: Function, default: null }
});

const selectionState = createSelectionState();
provide(WORKFLOW_SELECTION_KEY, selectionState);
const { selection } = selectionState;

const drawerVisible = ref(false);

const selectedNode = computed(() => {
  if (selection.type === 'node' && selection.data) {
    return selection.data;
  }
  return null;
});

const cachedSelectedNode = ref(null);
watch(selectedNode, (val) => {
  if (val) {
    cachedSelectedNode.value = val;
  }
}, { immediate: true });

const onNodeContextMenu = (node, e) => {
  selectionState.selectNode(node);
  drawerVisible.value = true;
};

const closeDrawer = () => {
  drawerVisible.value = false;
  selectionState.clearSelection();
};

watch(() => selection.type, (newType) => {
  if (!newType) {
    drawerVisible.value = false;
  }
});

onMounted(async () => {
  if (props.fetchEmitters) {
    const emitters = await props.fetchEmitters();
    if (emitters && Array.isArray(emitters)) {
      updateEmitters(emitters);
    }
  }
});

const enrichedWorkflowData = computed(() => {
  const config = props.workflowRun?.config;
  if (!config || !config.spec || !config.spec.states) return config;

  // Deep clone to avoid modifying original prop
  const data = JSON.parse(JSON.stringify(config));
  const layout = data.spec.layout || { states: {}, transitions: {} };

  // 提取最新任务状态
  const tasks = props.workflowRun?.tasks || [];
  const latestTaskMap = {};
  tasks.forEach(task => {
    const stateName = task.stateName;
    if (!latestTaskMap[stateName] || task.id > latestTaskMap[stateName].id) {
      latestTaskMap[stateName] = task;
    }
  });

  data.spec.states = data.spec.states.map((state, index) => {
    let ui = layout.states?.[state.name];
    // 如果存在布局，才直接应用。否则留空，由 canvas-board 自动布局
    return {
      ...state,
      ui: ui ? { ...ui } : undefined,
      runStatus: latestTaskMap[state.name] || null,
      hasRunInfo: true
    };
  });

  // Give transitions UI
  data.spec.states.forEach(state => {
    if (state.transitions) {
      state.transitions.forEach(t => {
        let tUi = layout.transitions?.[`${state.name}::${t.event}`];
        if (tUi) {
          t.ui = { ...tUi };
        } else {
          delete t.ui;
        }
      });
    } else {
      state.transitions = [];
    }
  });

  return reactive(data);
});
</script>

<style lang="less" scoped>
.workflow-run-viewer-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background: #f0f2f5;
  position: relative;

  .viewer-main {
    flex: 1;
    display: flex;
    overflow: hidden;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    margin: 0;
    background: #fff;
  }
}
</style>
