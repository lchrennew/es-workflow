<template>
  <div class="form">
    <a-form layout="vertical">
      <a-form-item>
        <div>从事件: {{ displayEventName }}</div>
        <div>到状态: {{ selection.data.targetState.title || selection.data.targetState.name }}</div>
      </a-form-item>
      <a-form-item>
        <a-button danger @click="handleRemoveTarget">删除目标连线</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Form as AForm, FormItem as AFormItem, Button as AButton } from 'ant-design-vue';
import { selection } from '../../composables/use-workflow.js';
import { removeTarget } from '../../composables/workflow-ops.js';
import { getEventDisplayName } from '../../composables/emitters.js';

const displayEventName = computed(() => {
  if (!selection.data || !selection.data.transition || !selection.parent) return '事件';
  return getEventDisplayName(selection.data.transition.event, selection.parent);
});

const handleRemoveTarget = () => {
  if (selection.data && selection.data.transition && selection.data.targetState) {
    removeTarget(selection.data.transition, selection.data.targetState.name, selection.parent);
    selection.type = null;
  }
};
</script>
