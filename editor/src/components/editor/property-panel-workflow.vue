<template>
  <div class="form">
    <a-form ref="formRef" layout="vertical" :model="formData">
      <a-form-item label="标识" name="name" :rules="[{ required: true, message: '请输入标识' }]">
        <a-input v-model:value="formData.name" />
      </a-form-item>

      <a-form-item label="名称">
        <a-input v-model:value="formData.title" />
      </a-form-item>

      <a-form-item label="标签">
        <a-select v-model:value="formData.tags" mode="tags" style="width: 100%" placeholder="输入标签并回车" />
      </a-form-item>

      <a-form-item>
        <a-space>
          <a-button type="primary" @click="handleSave">应用</a-button>
        </a-space>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup>
import { reactive, watch, ref, inject } from 'vue';
import { Form as AForm, FormItem as AFormItem, Input as AInput, Select as ASelect, Button as AButton, Space as ASpace } from 'ant-design-vue';
import { WORKFLOW_SELECTION_KEY } from '../../composables/use-workflow.js';

const { selection } = inject(WORKFLOW_SELECTION_KEY);
const formRef = ref(null);

const formData = reactive({
  name: '',
  title: '',
  tags: []
});

watch(
  () => selection.data,
  (newWorkflow) => {
    if (selection.type === 'workflow' && newWorkflow) {
      formData.name = newWorkflow.name || '';
      formData.title = newWorkflow.metadata?.title || '';
      formData.tags = newWorkflow.metadata?.tags || [];
    }
  },
  { immediate: true, deep: true }
);

const handleSave = () => {
  formRef.value.validate().then(() => {
    if (selection.data) {
      selection.data.name = formData.name;
      if (!selection.data.metadata) {
        selection.data.metadata = {};
      }
      selection.data.metadata.title = formData.title;
      selection.data.metadata.tags = [...formData.tags];
      selection.showPanel = false;
    }
  }).catch(() => { });
};
</script>

<style lang="less">
.form {
  padding-bottom: 20px;
}
</style>
