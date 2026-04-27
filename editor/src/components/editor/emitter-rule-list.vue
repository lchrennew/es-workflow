<template>
  <div class="emitter-rule-list">
    <div class="add-btn-wrap">
      <a-dropdown :trigger="['click']" v-model:open="dropdownOpen">
        <a-button type="dashed" block>
          + 添加判定规则
        </a-button>
        <template #overlay>
          <div class="dropdown-overlay">
            <div class="search-wrap" @click.stop>
              <a-input v-model:value="searchKeyword" placeholder="搜索规则名称或标识" allow-clear />
            </div>
            <a-menu @click="handleAdd" class="dropdown-menu">
              <a-menu-item v-for="opt in filteredOptions" :key="opt.key">
                {{ opt.metadata.title }} ({{ opt.key }})
              </a-menu-item>
              <a-menu-item v-if="filteredOptions.length === 0" disabled>
                无匹配规则
              </a-menu-item>
            </a-menu>
          </div>
        </template>
      </a-dropdown>
    </div>
    <div class="rule-items">
      <div v-for="(ruleKey, index) in modelValue" class="rule-item" draggable="true"
        @dragstart="onDragStart(index)" @dragover.prevent @dragenter.prevent @drop="onDrop(index)">
        <span class="drag-handle">☰</span>
        <span class="rule-title">{{ getTitle(ruleKey) }}</span>
        <span class="rule-remove" @click="handleRemove(index)">✕</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { Dropdown as ADropdown, Menu as AMenu, MenuItem as AMenuItem, Button as AButton, Input as AInput } from 'ant-design-vue';

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  options: { type: Array, default: () => [] }
});
const emit = defineEmits(['update:modelValue']);

const dropdownOpen = ref(false);
const searchKeyword = ref('');

watch(dropdownOpen, (val) => {
  if (!val) searchKeyword.value = '';
});

const unselectedOptions = computed(() => props.options.filter(opt => !props.modelValue.includes(opt.key)));

const filteredOptions = computed(() => {
  const kw = searchKeyword.value.trim().toLowerCase();
  if (!kw) return unselectedOptions.value;
  return unselectedOptions.value.filter(opt =>
    opt.key.toLowerCase().includes(kw) || (opt.metadata?.title || '').toLowerCase().includes(kw)
  );
});

const getTitle = (key) => {
  const opt = props.options.find(o => o.key === key);
  return opt ? opt.metadata.title : key;
};

const handleAdd = ({ key }) => {
  emit('update:modelValue', [...props.modelValue, key]);
  dropdownOpen.value = false;
};

const handleRemove = (index) => {
  const newVal = [...props.modelValue];
  newVal.splice(index, 1);
  emit('update:modelValue', newVal);
};

const dragIndex = ref(-1);
const onDragStart = (index) => dragIndex.value = index;
const onDrop = (dropIndex) => {
  if (dragIndex.value === -1 || dragIndex.value === dropIndex) return;
  const newVal = [...props.modelValue];
  const item = newVal.splice(dragIndex.value, 1)[0];
  newVal.splice(dropIndex, 0, item);
  emit('update:modelValue', newVal);
  dragIndex.value = -1;
};
</script>

<style lang="less" scoped>
.emitter-rule-list {
  .add-btn-wrap {
    margin-bottom: 8px;
  }

  .rule-items {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .rule-item {
    display: flex;
    align-items: center;
    padding: 4px 8px;
    background: #fafafa;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
    cursor: move;

    .drag-handle {
      margin-right: 8px;
      color: #999;
    }

    .rule-title {
      flex: 1;
      font-size: 12px;
    }

    .rule-remove {
      cursor: pointer;
      color: #ff4d4f;
      padding: 0 4px;
    }
  }
}

.dropdown-overlay {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05);

  .search-wrap {
    padding: 8px;
    border-bottom: 1px solid #f0f0f0;
  }

  .dropdown-menu {
    box-shadow: none;
    border: none;
    max-height: 250px;
    overflow-y: auto;
  }
}
</style>