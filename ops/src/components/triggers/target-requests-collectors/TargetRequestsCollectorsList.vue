<template>
    <model-list
        :configurer="TargetRequestsCollectorConfigurer"
        :get-hash="getTargetRequestsCollectorsHash"
        :load="loadTargetRequestsCollectors"
        :remove="deleteTargetRequestsCollector"
        model-type-name="输出请求"/>
</template>

<script setup>
import {
    deleteTargetRequestsCollector,
    getTargetRequestsCollectorsHash,
    loadTargetRequestsCollectors
} from "../../../services/triggers/target-requests-collectors.js";
import ModelList from "../common/ModelList.vue";
import TargetRequestsCollectorConfigurer from "./TargetRequestsCollectorConfigurer.vue";</script>

<style scoped>

</style>
