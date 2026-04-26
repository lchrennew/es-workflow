<template>
  <div class="property-panel-content">
    <!-- Node/状态 编辑 -->
    <property-panel-node v-if="type === 'node'" />

    <!-- Transition/事件 编辑 -->
    <property-panel-transition v-else-if="type === 'transition'" />

    <!-- Target Edge/目标连线 编辑 -->
    <property-panel-target-edge v-else-if="type === 'target-edge'" />

    <div v-else class="empty-tip">
      请选择节点、事件或连线
    </div>
  </div>
</template>

<script setup>
import PropertyPanelNode from './property-panel-node.vue';
import PropertyPanelTransition from './property-panel-transition.vue';
import PropertyPanelTargetEdge from './property-panel-target-edge.vue';

defineProps({
  type: String
});
</script>

<style lang="less" scoped>
.property-panel-content {
  .empty-tip {
    text-align: center;
    color: #999;
    margin-top: 50px;
  }
}
</style>