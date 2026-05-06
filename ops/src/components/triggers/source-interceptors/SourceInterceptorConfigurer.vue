<template>
    <model-configurer
        #="{model}"
        :default-model="defaultModel"
        :get-hash="getSourceInterceptorsHash"
        :save="saveSourceInterceptor">
        <a-form-item label="拦截逻辑">
            <a-textarea v-model:value="model.spec.script"/>
        </a-form-item>
    </model-configurer>
</template>

<script setup>
import ModelConfigurer from "../common/ModelConfigurer.vue";
import { getSourceInterceptorsHash, saveSourceInterceptor } from "../../../services/triggers/source-interceptors.js";

const defaultModel = { kind: 'source-interceptor', name: null, metadata: { title: null }, spec: { script: null } }

</script>

<style scoped>

</style>
