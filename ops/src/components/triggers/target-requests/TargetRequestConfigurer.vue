<template>
    <model-configurer
        #="{model}"
        :default-model="defaultModel"
        :get-hash="getTargetRequestsHash"
        :save="saveTargetRequest">
        <target-request-spec-configurer :model="model"/>
    </model-configurer>
</template>

<script setup>

import ModelConfigurer from "../common/ModelConfigurer.vue";
import { getTargetRequestsHash, saveTargetRequest } from "../../../services/triggers/target-requests.js";
import TargetRequestSpecConfigurer from "./TargetRequestSpecConfigurer.vue";


const defaultModel = { kind: 'target-request', name: null, metadata: { title: null }, spec: { trigger: null } }

</script>

<style scoped>

</style>
