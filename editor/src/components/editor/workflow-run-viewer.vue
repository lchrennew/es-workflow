<template>
  <div class="workflow-run-viewer-container">
    <div class="viewer-main">
      <canvas-board :workflowData="enrichedWorkflowData" :readonly="true" @state-contextmenu="onNodeContextMenu" />
    </div>

    <!-- 运行详情抽屉 -->
    <a-drawer :title="selectedNode ? (selectedNode.title || selectedNode.name) : '节点运行详情'" placement="right"
      :open="drawerVisible" :mask="false" :closable="true" @close="closeDrawer" :getContainer="false"
      :style="{ position: 'absolute' }" width="350"
      :headerStyle="{ backgroundColor: '#eef0f2', borderBottom: '1px solid #ddd', padding: '15px' }"
      :bodyStyle="{ padding: '15px', backgroundColor: '#f8f9fa' }">
      <div v-if="selectedNode" class="run-details">
        <div class="detail-item" v-if="selectedNode.runStatus">
          <span class="label">运行状态：</span>
          <span v-if="selectedNode.runStatus.status === 'completed' && selectedNode.runStatus.endEvent"
            class="value status-badge"
            :style="{ backgroundColor: getEventColor(selectedNode.runStatus.endEvent, selectedNode) + '20', color: getEventColor(selectedNode.runStatus.endEvent, selectedNode), border: '1px solid ' + getEventColor(selectedNode.runStatus.endEvent, selectedNode) }">
            {{ getEventDisplayName(selectedNode.runStatus.endEvent, selectedNode) }}
          </span>
          <span v-else class="value status-badge" :class="`status-${selectedNode.runStatus.status}`">
            {{ formatStatus(selectedNode.runStatus.status) }}
          </span>
        </div>
        <div class="detail-item" v-if="selectedNode.runStatus?.id">
          <span class="label">开始时间({{ selectedNode.runStatus.id }})：</span>
          <span class="value">{{ formatTime(getTimestampFromId(selectedNode.runStatus.id)) }}</span>
        </div>
        <div class="detail-item" v-if="selectedNode.runStatus?.endEventId">
          <span class="label">
            <template v-if="selectedNode.runStatus.status === 'completed'">完成时间</template>
            <template v-else>结束时间</template>({{ selectedNode.runStatus.endEventId }})：
          </span>
          <span class="value">{{ formatTime(getTimestampFromId(selectedNode.runStatus.endEventId)) }}</span>
        </div>

        <!-- 请求与响应列表 -->
        <div class="requests-section" v-if="selectedNode.runStatus?.requests?.length">
          <div class="section-title">处理记录</div>
          <div class="request-item" v-for="req in selectedNode.runStatus.requests" :key="req.id">
            <div class="req-header">
              <span class="target">{{ req.target }}</span>
              <span class="time">{{ formatTime(getTimestampFromId(req.id) || req.createdAt) }}</span>
            </div>
            <div class="req-response" v-if="req.response">
              <div class="resp-row">
                <span class="label">动作：</span>
                <span class="value">{{ getActionDisplayName(req.response.action, selectedNode) }}</span>
              </div>
              <div class="resp-row" v-if="req.response.time">
                <span class="label">时间：</span>
                <span class="value">{{ formatTime(req.response.time) }}</span>
              </div>
              <div class="resp-row" v-if="req.response.payload && Object.keys(req.response.payload).length">
                <span class="label">数据：</span>
                <span class="value">{{ JSON.stringify(req.response.payload) }}</span>
              </div>
            </div>
            <div class="req-waiting" v-else>
              <span class="waiting-text">等待处理...</span>
            </div>
          </div>
        </div>

        <div v-if="!selectedNode.runStatus" class="empty-status">
          该节点暂无运行记录
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<script setup>
import { computed, reactive, provide, onMounted, ref, watch } from 'vue';
import { Drawer as ADrawer } from 'ant-design-vue';
import CanvasBoard from './canvas-board.vue';
import { createSelectionState, WORKFLOW_SELECTION_KEY } from '../../composables/use-workflow.js';

const props = defineProps({
  workflowRun: {
    type: Object,
    required: true
  },
  fetchEmitters: {
    type: Function,
    default: null
  }
});

const selectionState = createSelectionState();
provide(WORKFLOW_SELECTION_KEY, selectionState);
const { selection } = selectionState;

import { updateEmitters, getEventDisplayName, emitterOptions } from '../../composables/emitters.js';
import { parseObjectID } from 'es-object-id';

const drawerVisible = ref(false);
const selectedNode = ref(null);

const onNodeContextMenu = (node) => {
  selectedNode.value = node;
  drawerVisible.value = true;
};

const closeDrawer = () => {
  drawerVisible.value = false;
  selection.type = null;
  selection.showPanel = false;
};

watch(() => selection.type, (newType) => {
  if (!newType) {
    drawerVisible.value = false;
  }
});

const formatStatus = (status) => {
  const statusMap = {
    'initial': '初始',
    'in-progress': '进行中',
    'completed': '已完成',
    'ignored': '已忽略'
  };
  return statusMap[status] || status || '未知';
};

const getEventColor = (eventName, sourceState) => {
  if (sourceState?.emitter) {
    const emitterDef = emitterOptions.find(e => e.name === sourceState.emitter);
    if (emitterDef && emitterDef.spec?.allowedEvents) {
      const evtDef = emitterDef.spec.allowedEvents.find(e => e.name === eventName);
      if (evtDef && evtDef.color) {
        return evtDef.color;
      }
    }
  }

  // Fallback colors
  if (eventName === 'passed' || eventName === 'start') {
    return '#52c41a'; // Green
  } else if (eventName === 'rejected') {
    return '#f5222d'; // Red
  }
  return '#1890ff'; // Default Blue
};

const getActionDisplayName = (actionName, sourceState) => {
  if (sourceState?.emitter) {
    const emitterDef = emitterOptions.find(e => e.name === sourceState.emitter);
    if (emitterDef && emitterDef.spec?.allowedActions) {
      const actionDef = emitterDef.spec.allowedActions.find(a => a.action === actionName);
      if (actionDef && actionDef.title) {
        return actionDef.title;
      }
    }
  }
  return actionName;
};

const getTimestampFromId = (id) => {
  if (!id) return null;
  try {
    return parseObjectID(id).timestamp;
  } catch (e) {
    return null;
  }
};

const formatTime = (timeStr) => {
  if (!timeStr) return '-';
  const d = new Date(timeStr);
  return isNaN(d.getTime()) ? timeStr : d.toLocaleString();
};

onMounted(async () => {
  if (props.fetchEmitters) {
    const emitters = await props.fetchEmitters();
    if (emitters && Array.isArray(emitters)) {
      updateEmitters(emitters);
    }
  }
});

const enrichedWorkflowData = computed(() => {
  const config = props.workflowRun?.config;
  if (!config || !config.spec || !config.spec.states) return config;

  // Deep clone to avoid modifying original prop
  const data = JSON.parse(JSON.stringify(config));
  const layout = data.spec.layout || { states: {}, transitions: {} };

  // 提取最新任务状态
  const tasks = props.workflowRun?.tasks || [];
  const latestTaskMap = {};
  tasks.forEach(task => {
    const stateName = task.stateName;
    if (!latestTaskMap[stateName] || task.id > latestTaskMap[stateName].id) {
      latestTaskMap[stateName] = task;
    }
  });

  data.spec.states = data.spec.states.map((state, index) => {
    let ui = layout.states?.[state.name];
    // 如果存在布局，才直接应用。否则留空，由 canvas-board 自动布局
    return {
      ...state,
      ui: ui ? { ...ui } : undefined,
      runStatus: latestTaskMap[state.name] || null,
      hasRunInfo: true
    };
  });

  // Give transitions UI
  data.spec.states.forEach(state => {
    if (state.transitions) {
      state.transitions.forEach(t => {
        let tUi = layout.transitions?.[`${state.name}::${t.event}`];
        if (tUi) {
          t.ui = { ...tUi };
        } else {
          delete t.ui;
        }
      });
    } else {
      state.transitions = [];
    }
  });

  return reactive(data);
});
</script>

<style lang="less" scoped>
.workflow-run-viewer-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background: #f0f2f5;
  position: relative;
  /* 让抽屉基于此容器定位 */

  .viewer-main {
    flex: 1;
    display: flex;
    overflow: hidden;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    margin: 0;
    background: #fff;
  }
}

.run-details {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .detail-item {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .label {
      color: #8c8c8c;
      font-size: 13px;
    }

    .value {
      color: #262626;
      font-size: 14px;
      word-break: break-all;
    }

    .error-text {
      color: #cf1322;
      background: #fff1f0;
      padding: 8px;
      border-radius: 4px;
      border: 1px solid #ffa39e;
    }

    .status-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      width: fit-content;

      &.status-completed {
        background: #f6ffed;
        color: #52c41a;
        border: 1px solid #b7eb8f;
      }

      &.status-in-progress,
      &.status-initial {
        background: #e6f7ff;
        color: #1890ff;
        border: 1px solid #91d5ff;
      }

      &.status-ignored {
        background: #fff1f0;
        color: #cf1322;
        border: 1px solid #ffa39e;
      }

      &.status-none {
        background: #f5f5f5;
        color: #8c8c8c;
        border: 1px solid #d9d9d9;
      }
    }

    .event-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      width: fit-content;
    }
  }

  .empty-status {
    color: #bfbfbf;
    text-align: center;
    padding: 20px 0;
  }

  .requests-section {
    margin-top: 16px;
    border-top: 1px solid #f0f0f0;
    padding-top: 16px;

    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: #262626;
      margin-bottom: 12px;
    }

    .request-item {
      background: #ffffff;
      border: 1px solid #f0f0f0;
      border-radius: 6px;
      padding: 10px;
      margin-bottom: 10px;

      .req-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;

        .target {
          font-weight: 500;
          color: #1890ff;
        }

        .time {
          font-size: 12px;
          color: #8c8c8c;
        }
      }

      .req-response {
        font-size: 13px;
        background: #fafafa;
        padding: 8px;
        border-radius: 4px;

        .resp-row {
          display: flex;
          margin-bottom: 4px;

          &:last-child {
            margin-bottom: 0;
          }

          .label {
            color: #8c8c8c;
            width: 45px;
            flex-shrink: 0;
          }

          .value {
            color: #262626;
            word-break: break-all;
          }
        }
      }

      .req-waiting {
        font-size: 13px;
        color: #faad14;
        background: #fffbe6;
        padding: 4px 8px;
        border-radius: 4px;
        display: inline-block;
      }
    }
  }
}
</style>
