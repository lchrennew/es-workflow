<template>
    <model-configurer
        #="{model}"
        :default-model="defaultModel"
        :get-hash="getTargetInterceptorsHash"
        :save="saveTargetInterceptor">
        <a-form-item label="拦截逻辑">
            <a-textarea v-model:value="model.spec.script"/>
        </a-form-item>
    </model-configurer>
</template>

<script setup>

import { getTargetInterceptorsHash, saveTargetInterceptor } from "../../../services/triggers/target-interceptors.js";
import ModelConfigurer from "../common/ModelConfigurer.vue";

const defaultModel = { kind: 'target-interceptor', name: null, metadata: { title: null }, spec: { content: null } }

</script>

<style scoped>

</style>
