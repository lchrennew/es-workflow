<template>
  <div class="form">
    <a-form ref="formRef" layout="vertical" :model="formData" :rules="rules">
      <a-form-item label="标识" name="name">
        <a-input v-model:value="formData.name" />
      </a-form-item>

      <a-form-item label="名称" name="title">
        <a-input v-model:value="formData.title" />
      </a-form-item>

      <a-form-item label="标签" name="tags">
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

const rules = {
  name: [
    { required: true, message: '请输入标识', trigger: 'blur' },
    {
      pattern: /^[a-z0-9]+(-[a-z0-9]+)*(\/[a-z0-9]+(-[a-z0-9]+)*)*$/,
      message: '标识只能使用小写字母、数字和短横线，不能以短横线开头或结尾，并使用斜杠分隔层级',
      trigger: 'blur'
    }
  ],
  title: [
    { required: true, message: '请输入名称', trigger: 'blur' }
  ],
  tags: [
    {
      validator: async (_rule, value) => {
        if (!value || value.length === 0) return Promise.resolve();
        const tagRegex = /^[^/]+\/[^/]+$/;
        for (const tag of value) {
          if (!tagRegex.test(tag)) {
            return Promise.reject(`标签“${tag}”格式不正确，必须且只能包含一个斜杠作为分隔符`);
          }
        }
        return Promise.resolve();
      },
      trigger: 'change'
    }
  ]
};

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
