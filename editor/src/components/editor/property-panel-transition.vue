<template>
  <div class="form">
    <!-- 启动事件特化显示 -->
    <template v-if="selection.parent?.name === 'initial' && formData.event === 'start'">
      <a-form layout="vertical">
        <a-form-item>
          <span style="color: #666; font-style: italic;">系统启动事件不可修改</span>
        </a-form-item>
        <a-form-item>
          <a-button danger @click="handleRemoveTransition">删除事件</a-button>
        </a-form-item>
      </a-form>
    </template>

    <!-- 不满足条件事件特化显示 -->
    <template v-else-if="formData.event === 'ignored'">
      <a-form layout="vertical">
        <a-form-item>
          <span style="color: #f5222d; font-style: italic;">条件不满足事件不可修改</span>
        </a-form-item>
        <a-form-item>
          <a-button danger @click="handleRemoveTransition">删除事件</a-button>
        </a-form-item>
      </a-form>
    </template>

    <!-- 常规事件编辑 -->
    <template v-else>
      <a-form layout="vertical" :model="formData">
        <a-form-item label="事件标识 (event)">
          <a-select v-model:value="formData.event" placeholder="-- 请选择 --">
            <a-select-option v-for="evt in availableEvents" :key="evt.name" :value="evt.name">
              {{ evt.title }} ({{ evt.name }})
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSave">确认保存</a-button>
            <a-button danger @click="handleRemoveTransition">删除事件</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </template>
  </div>
</template>

<script setup>
import { reactive, computed, watch } from 'vue';
import { Form as AForm, FormItem as AFormItem, Select as ASelect, SelectOption as ASelectOption, Button as AButton, Space as ASpace } from 'ant-design-vue';
import { selection } from '../../composables/use-workflow.js';
import { removeTransition } from '../../composables/workflow-ops.js';
import { emitterOptions } from '../../composables/emitters.js';

const formData = reactive({});

watch(() => selection.data, (newData) => {
  if (newData && selection.type === 'transition') {
    Object.keys(formData).forEach(key => delete formData[key]);
    const clone = JSON.parse(JSON.stringify(newData));
    delete clone.title; // 不再保留/显示 title 字段
    Object.assign(formData, clone);
  }
}, { deep: true, immediate: true });

const availableEvents = computed(() => {
  if (selection.type !== 'transition' || !selection.parent) return [];
  const emitter = selection.parent.emitter;
  if (!emitter) return [];

  const emitterDef = emitterOptions.find(e => e.name === emitter);
  if (!emitterDef) return [];

  const usedEvents = (selection.parent.transitions || [])
    .filter(t => t !== selection.data)
    .map(t => t.event);

  return emitterDef.spec.allowedEvents.filter(evt =>
    !usedEvents.includes(evt.name)
  );
});

const handleSave = () => {
  if (selection.data) {
    Object.keys(formData).forEach(key => {
      if (key !== 'ui') {
        selection.data[key] = formData[key];
      }
    });
    delete selection.data.title; // 强制删除废弃的 title 字段
  }
};

const handleRemoveTransition = () => {
  if (selection.data && selection.parent) {
    removeTransition(selection.parent, selection.data.event);
    selection.type = null;
  }
};
</script>
