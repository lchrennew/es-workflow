<template>
  <div class="form">
    <a-form layout="vertical">
      <a-form-item>
        <div style="margin-bottom: 8px;">
          {{ edgeDescription }}
        </div>
      </a-form-item>

      <a-form-item v-if="selection.data.targetState.name !== 'end'" label="预取器">
        <prefetcher-list v-model="localPrefetchers" :options="prefetcherOptions" />
      </a-form-item>

      <a-form-item>
        <a-space>
          <a-button v-if="selection.data.targetState.name !== 'end'" type="primary" @click="handleSave">应用</a-button>
          <a-button danger @click="handleRemoveTarget">删除</a-button>
        </a-space>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup>
import { computed, inject, ref, watch } from 'vue';
import { Form as AForm, FormItem as AFormItem, Button as AButton, Space as ASpace, message } from 'ant-design-vue';
import { selection as defaultSelection, WORKFLOW_SELECTION_KEY, workflow, getCleanWorkflow } from '../../composables/use-workflow.js';
import { removeTarget } from '../../composables/workflow-ops.js';
import { getEventDisplayName } from '../../composables/emitters.js';
import { prefetchers } from '../../composables/prefetchers.js';
import PrefetcherList from './prefetcher-list.vue';

const { selection } = inject(WORKFLOW_SELECTION_KEY, { selection: defaultSelection });

const localPrefetchers = ref([]);

watch(
  () => selection.data,
  (newData) => {
    if (newData && newData.transition && newData.targetState) {
      const transition = newData.transition;
      const target = transition.targets?.find(t => t.state === newData.targetState.name);
      localPrefetchers.value = target?.prefetchers ? [...target.prefetchers] : [];
    } else {
      localPrefetchers.value = [];
    }
  },
  { immediate: true, deep: true }
);

const displayEventName = computed(() => {
  if (!selection.data || !selection.data.transition || !selection.parent) return '事件';
  return getEventDisplayName(selection.data.transition.event, selection.parent);
});

const edgeDescription = computed(() => {
  if (!selection.parent || !selection.data?.targetState) return '';
  const sourceName = selection.parent.title || selection.parent.name;
  const targetName = selection.data.targetState.title || selection.data.targetState.name;
  const isSelfLoop = selection.parent.name === selection.data.targetState.name;

  if (isSelfLoop) {
    return `${sourceName}${displayEventName.value}后回到自身`;
  }
  return `${sourceName}${displayEventName.value}后到达${targetName}`;
});

const prefetcherOptions = computed(() => {
  return prefetchers.map(p => ({
    label: p.metadata?.title ? `${p.metadata.title}` : p.name,
    value: p.name
  }));
});

const handleSave = () => {
  if (selection.data && selection.data.transition && selection.data.targetState) {
    const transition = selection.data.transition;
    const target = transition.targets?.find(t => t.state === selection.data.targetState.name);
    if (target) {
      target.prefetchers = [...localPrefetchers.value];
      message.success('已应用目标连线属性配置');
      selection.type = null;
      selection.showPanel = false;
    }
  }
};

const handleRemoveTarget = () => {
  if (selection.data && selection.data.transition && selection.data.targetState) {
    removeTarget(selection.data.transition, selection.data.targetState.name, selection.parent);
    selection.type = null;
    selection.showPanel = false;
  }
};
</script>
