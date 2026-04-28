<template>
  <div v-if="nodeData && nodeData.runStatus" class="run-details">
    <div class="detail-item">
      <span class="label">运行状态：</span>
      <span v-if="nodeData.runStatus.status === 'completed' && nodeData.runStatus.endEvent" class="value status-badge"
        :style="{ backgroundColor: getEventColor(nodeData.runStatus.endEvent, nodeData) + '20', color: getEventColor(nodeData.runStatus.endEvent, nodeData), border: '1px solid ' + getEventColor(nodeData.runStatus.endEvent, nodeData) }">
        {{ getEventDisplayName(nodeData.runStatus.endEvent, nodeData) }}
      </span>
      <span v-else class="value status-badge" :class="`status-${nodeData.runStatus.status}`">
        {{ formatStatus(nodeData.runStatus.status) }}
      </span>
    </div>
    <div class="detail-item" v-if="nodeData.runStatus?.id">
      <span class="label">开始时间：</span>
      <span class="value">{{ formatTime(getTimestampFromId(nodeData.runStatus.id)) }}</span>
    </div>
    <div class="detail-item" v-if="nodeData.runStatus?.endEventId">
      <span class="label">
        <template v-if="nodeData.runStatus.status === 'completed'">完成时间</template>
        <template v-else>结束时间</template>：
      </span>
      <span class="value">{{ formatTime(getTimestampFromId(nodeData.runStatus.endEventId)) }}</span>
    </div>

    <!-- 请求与响应列表 -->
    <div class="requests-section" v-if="nodeData.runStatus?.requests?.length">
      <div class="section-title">处理记录</div>
      <div class="request-item" v-for="req in nodeData.runStatus.requests">
        <div class="req-header">
          <span class="target">{{ req.target }}</span>
          <span class="time">{{ formatTime(getTimestampFromId(req.id) || req.createdAt) }}</span>
        </div>
        <div class="req-response" v-if="req.response">
          <div class="resp-row">
            <span class="label">动作：</span>
            <span class="value">{{ getActionDisplayName(req.response.action, nodeData) }}</span>
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
  </div>
  <div v-else class="empty-status">
    该节点暂无运行记录
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { parseObjectID } from 'es-object-id';
import { emitterOptions, getEventDisplayName } from '../../composables/emitters.js';

const props = defineProps({
  selectedNode: { type: Object, default: () => null }
});

const nodeData = ref(props.selectedNode);
watch(() => props.selectedNode, (val) => {
  if (val) nodeData.value = val;
}, { immediate: true });

const formatStatus = (status) => {
  const statusMap = {
    'initial': '初始',
    'in-progress': '进行中',
    'completed': '已完成',
    'ignored': '已忽略'
  };
  return statusMap[status] || status;
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
  if (eventName === 'passed' || eventName === 'start') {
    return '#52c41a';
  } else if (eventName === 'rejected') {
    return '#f5222d';
  }
  return '#1890ff';
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
</script>

<style lang="less" scoped>
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

.empty-status {
  color: #bfbfbf;
  text-align: center;
  padding: 20px 0;
}
</style>