<template>
  <div class="workflow-editor-container">
    <editor-header />
    <div class="editor-main">
      <canvas-board @state-contextmenu="onContextMenu" @transition-contextmenu="onContextMenu"
        @target-contextmenu="onContextMenu" />
      <property-panel />
    </div>
  </div>
</template>

<script setup>
import { onMounted, watch, ref, provide } from 'vue';
import { parse, stringify } from 'yaml';
import { workflow, initWorkflow, loadWorkflow, getCleanWorkflow, selection as defaultSelection, createSelectionState, WORKFLOW_SELECTION_KEY } from '../../composables/use-workflow.js';
import { updateEmitters } from '../../composables/emitters.js';
import { updateEmitterRules } from '../../composables/emitter-rules.js';
import { updatePrefetchers } from '../../composables/prefetchers.js';
import EditorHeader from './editor-header.vue';
import CanvasBoard from './canvas-board.vue';
import PropertyPanel from './property-panel.vue';

const props = defineProps({
  value: {
    type: String,
    default: ''
  },
  fetchEmitters: {
    type: Function,
    default: null
  },
  fetchEmitterRules: {
    type: Function,
    default: null
  },
  fetchPrefetchers: {
    type: Function,
    default: null
  }
});

const emit = defineEmits(['update:value']);

const selectionState = createSelectionState();
provide(WORKFLOW_SELECTION_KEY, selectionState);
const { selection } = selectionState;

let isUpdatingInternal = false;

const onContextMenu = () => {
  selection.showPanel = true;
};

// 当组件接收到外部传入的 yaml 时进行解析和加载
watch(() => props.value, (newYaml) => {
  if (isUpdatingInternal) {
    // 由内部触发的更新，忽略外部监听
    return;
  }

  if (newYaml) {
    try {
      const parsedData = parse(newYaml);
      loadWorkflow(parsedData);
    } catch (e) {
      console.error('Failed to parse external YAML workflow data:', e);
    }
  }
}, { immediate: true });

// 监听内部 workflow 的修改，将修改转换为 YAML 并向外抛出
watch(workflow, () => {
  isUpdatingInternal = true;
  try {
    const cleanWorkflow = getCleanWorkflow();

    const yamlString = stringify(cleanWorkflow);
    emit('update:value', yamlString);
  } catch (e) {
    console.error('Failed to stringify workflow data to YAML:', e);
  } finally {
    // 稍后重置标志，以避免触发外部的 watcher
    setTimeout(() => {
      isUpdatingInternal = false;
    }, 0);
  }
}, { deep: true });

onMounted(async () => {
  // 如果没有 workflow 数据，则初始化一个
  if (!workflow.spec.states.length) {
    initWorkflow();
  }

  // 挂载时拉取所有外部数据源
  if (props.fetchEmitters) {
    try {
      const data = await props.fetchEmitters();
      updateEmitters(data);
    } catch (e) {
      console.error('Failed to fetch emitters:', e);
    }
  }

  if (props.fetchEmitterRules) {
    try {
      const data = await props.fetchEmitterRules();
      updateEmitterRules(data);
    } catch (e) {
      console.error('Failed to fetch emitter rules:', e);
    }
  }

  if (props.fetchPrefetchers) {
    try {
      const data = await props.fetchPrefetchers();
      updatePrefetchers(data);
    } catch (e) {
      console.error('Failed to fetch prefetchers:', e);
    }
  }
});
</script>

<style lang="less" scoped>
.workflow-editor-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background: #f0f2f5;

  .editor-main {
    flex: 1;
    display: flex;
    position: relative;
    overflow: hidden;
  }
}
</style>
