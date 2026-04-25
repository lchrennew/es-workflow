<template>
  <div class="form">
    <a-form layout="vertical">
      <a-form-item>
        <div>从事件: {{ displayEventName }}</div>
        <div>到状态: {{ selection.data.targetState.title || selection.data.targetState.name }}</div>
      </a-form-item>

      <a-form-item v-if="selection.data.targetState.name !== 'end'" label="Prefetchers">
        <a-select v-model:value="prefetchersList" mode="multiple" placeholder="请选择预取器" :options="prefetcherOptions"
          allowClear />
      </a-form-item>

      <a-form-item>
        <a-button danger @click="handleRemoveTarget">删除目标连线</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue';
import { Form as AForm, FormItem as AFormItem, Button as AButton, Select as ASelect } from 'ant-design-vue';
import { selection as defaultSelection, WORKFLOW_SELECTION_KEY, workflow, getCleanWorkflow } from '../../composables/use-workflow.js';
import { removeTarget } from '../../composables/workflow-ops.js';
import { getEventDisplayName } from '../../composables/emitters.js';
import { prefetchers } from '../../composables/prefetchers.js';

const { selection } = inject(WORKFLOW_SELECTION_KEY, { selection: defaultSelection });


const displayEventName = computed(() => {
  if (!selection.data || !selection.data.transition || !selection.parent) return '事件';
  return getEventDisplayName(selection.data.transition.event, selection.parent);
});

const prefetcherOptions = computed(() => {
  return prefetchers.map(p => ({
    label: p.metadata?.title ? `${p.metadata.title} (${p.name})` : p.name,
    value: p.name
  }));
});

const prefetchersList = computed({
  get: () => {
    if (!selection.data || !selection.data.transition || !selection.data.targetState) return [];
    const transition = selection.data.transition;
    const target = transition.targets?.find(t => t.state === selection.data.targetState.name);
    return target?.prefetchers || [];
  },
  set: (val) => {
    if (selection.data && selection.data.transition && selection.data.targetState) {
      const transition = selection.data.transition;
      const target = transition.targets?.find(t => t.state === selection.data.targetState.name);
      if (target) {
        target.prefetchers = val;
      }
    }
  }
});

const handleRemoveTarget = () => {
  if (selection.data && selection.data.transition && selection.data.targetState) {
    removeTarget(selection.data.transition, selection.data.targetState.name, selection.parent);
    selection.type = null;
    selection.showPanel = false;
  }
};
</script>
