<template>
    <model-configurer
        #="{model}"
        :default-model="defaultModel"
        :get-hash="getBindingsHash"
        :save="saveBinding"
    >
        <a-form-item label="绑定脚本">
            <a-textarea v-model:value="model.spec.script" auto-size/>
        </a-form-item>
        <a-form-item label="输出请求绑定">
            <a-textarea v-model:value="model.spec.perRequestScript" auto-size/>
        </a-form-item>
    </model-configurer>
</template>

<script setup>
import ModelConfigurer from "../common/ModelConfigurer.vue";
import { getBindingsHash, saveBinding } from "../../../services/triggers/bindings.js";

const defaultModel = { kind: 'binding', name: null, metadata: { title: null }, spec: {} }
</script>

<style scoped>

</style>
