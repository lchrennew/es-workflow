<template>
  <div class="workflow-editor-container">
    <editor-header />
    <div class="editor-main">
      <canvas-board />
      <property-panel />
    </div>
  </div>
</template>

<script setup>
import { onMounted, watch, ref } from 'vue';
import { parse, stringify } from 'yaml';
import { workflow, initWorkflow, loadWorkflow, getCleanWorkflow } from '../../composables/use-workflow.js';
import { updateEmitters } from '../../composables/emitters.js';
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
  }
});

const emit = defineEmits(['update:value']);

let isUpdatingInternal = false;

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
    if (yamlString !== props.value) {
      emit('update:value', yamlString);
    }
  } catch (e) {
    console.error('Failed to stringify workflow to YAML:', e);
  } finally {
    // 延迟恢复标记，防止立即被 props watch 捕捉到
    setTimeout(() => {
      isUpdatingInternal = false;
    }, 0);
  }
}, { deep: true });

// 组件挂载时初始化数据
onMounted(async () => {
  // 如果有动态拉取 emitter 的方法，则执行并更新
  if (props.fetchEmitters) {
    try {
      const data = await props.fetchEmitters();
      if (data && Array.isArray(data)) {
        updateEmitters(data);
      }
    } catch (e) {
      console.error('Failed to fetch emitters:', e);
    }
  }

  // 只有在没有外部传入 yaml 数据时，才执行默认初始化
  if (!props.value) {
    initWorkflow();
  }
});
</script>

<style lang="less" scoped>
.workflow-editor-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;

  .editor-main {
    display: flex;
    flex: 1;
    overflow: hidden;
    position: relative;
  }
}
</style>
