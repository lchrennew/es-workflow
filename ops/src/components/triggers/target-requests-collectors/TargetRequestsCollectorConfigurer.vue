<template>
    <model-configurer
        #="{model}"
        :default-model="defaultModel"
        :get-hash="getTargetRequestsCollectorsHash"
        :save="saveTargetRequestsCollector">
      <a-form-item label="脚本">
        <a-textarea v-model:value="model.spec.script" auto-size/>
      </a-form-item>
    </model-configurer>
</template>

<script setup>

import ModelConfigurer from "../common/ModelConfigurer.vue";
import {
    getTargetRequestsCollectorsHash,
    saveTargetRequestsCollector
} from "../../../services/triggers/target-requests-collectors.js";


const defaultModel = { kind: 'target-request', name: null, metadata: { title: null }, spec: { trigger: null } }

</script>

<style scoped>

</style>
