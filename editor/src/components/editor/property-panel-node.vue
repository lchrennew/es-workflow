<template>
  <div class="form">
    <!-- 系统节点特化显示 -->
    <template v-if="isSystem">
      <a-form layout="vertical">
        <a-form-item>
          <span style="color: #666; font-style: italic;">系统节点不可修改</span>
        </a-form-item>
      </a-form>
    </template>

    <!-- 常规节点编辑 -->
    <template v-else>
      <a-form ref="formRef" layout="vertical" :model="formData">
        <a-form-item label="显示标题 (title)">
          <a-input v-model:value="formData.title" />
        </a-form-item>

        <a-form-item label="触发器 (emitter)" name="emitter" :rules="[{ required: true, message: '请选择触发器' }]">
          <a-select v-model:value="formData.emitter" placeholder="-- 请选择 --" allow-clear @change="onEmitterChange">
            <a-select-option v-for="option in userSelectableEmitters" :key="option.name" :value="option.name">
              {{ option.metadata.title }} ({{ option.name }})
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item v-if="formData.emitter" label="判定规则 (emitterRules)" name="emitterRules"
          :rules="[{ required: true, type: 'array', min: 1, message: '请至少添加一个判定规则' }]">
          <emitter-rule-list v-model="formData.emitterRules" :options="availableEmitterRules" />
        </a-form-item>

        <a-form-item label="启动条件 (conditions)">
          <a-textarea v-model:value="formData.conditions"
            placeholder="例如：return Number(task.inputParameters['SCORE']) > 90;" :rows="3" />
        </a-form-item>

        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSave">确认保存</a-button>
            <a-button danger @click="handleRemoveNode">删除节点</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </template>
  </div>
</template>

<script setup>
import { reactive, computed, watch, ref } from 'vue';
import { Form as AForm, FormItem as AFormItem, Input as AInput, Select as ASelect, SelectOption as ASelectOption, Textarea as ATextarea, Button as AButton, Space as ASpace } from 'ant-design-vue';
import { selection } from '../../composables/use-workflow.js';
import { removeNode } from '../../composables/workflow-ops.js';
import { emitterOptions } from '../../composables/emitters.js';
import { emitterRuleOptions } from '../../composables/emitter-rules.js';
import EmitterRuleList from './emitter-rule-list.vue';

const formRef = ref(null);
const formData = reactive({});

watch(() => selection.data, (newData) => {
  if (newData && selection.type === 'node') {
    Object.keys(formData).forEach(key => delete formData[key]);
    Object.assign(formData, JSON.parse(JSON.stringify(newData)));
    if (!formData.emitterRules) {
      formData.emitterRules = [];
    }
    // 切换节点时清除表单的校验状态
    setTimeout(() => {
      if (formRef.value) formRef.value.clearValidate();
    });
  }
}, { deep: true, immediate: true });

const isSystem = computed(() => {
  return selection.type === 'node' &&
    (selection.data?.name === 'initial' || selection.data?.name === 'end');
});

const userSelectableEmitters = computed(() => {
  return emitterOptions.filter(e => e.metadata?.forUserState === true);
});

const onEmitterChange = () => {
  formData.emitterRules = [];
};

const availableEmitterRules = computed(() => {
  if (!formData.emitter) return [];
  const prefix = formData.emitter + '/';
  return emitterRuleOptions
    .filter(r => r.name.startsWith(prefix))
    .map(r => ({
      ...r,
      key: r.name.substring(prefix.length)
    }));
});

const handleSave = async () => {
  if (formRef.value) {
    try {
      await formRef.value.validate();
    } catch (error) {
      return;
    }
  }

  if (selection.data) {
    const emitterChanged = selection.data.emitter !== formData.emitter;

    Object.keys(formData).forEach(key => {
      if (key !== 'ui') {
        selection.data[key] = formData[key];
      }
    });

    // 如果 emitter 发生了改变，则需要清理掉除 'ignored' 之外的旧连线，因为旧连线上的事件可能在新 emitter 中不适用
    if (emitterChanged && selection.data.transitions) {
      selection.data.transitions = selection.data.transitions.filter(t => t.event === 'ignored');
    }

    // 当清空 conditions 时，自动删除 ignored 事件连线
    if (!formData.conditions && selection.data.transitions) {
      const ignoredIndex = selection.data.transitions.findIndex(t => t.event === 'ignored');
      if (ignoredIndex !== -1) {
        selection.data.transitions.splice(ignoredIndex, 1);
      }
    }
  }
};

const handleRemoveNode = () => {
  if (selection.data && selection.data.name) {
    removeNode(selection.data.name);
    selection.type = null;
  }
};
</script>
