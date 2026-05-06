<template>
    <model-configurer
        #="{model}"
        :default-model="defaultModel"
        :get-hash="getTargetSystemsHash"
        :save="saveTargetSystem"
    >
        <a-form-item label="地址">
            <a-input v-model:value="model.spec.default"/>
        </a-form-item>
    </model-configurer>
</template>

<script setup>
import { getTargetSystemsHash, saveTargetSystem } from "../../../services/triggers/target-systems.js";
import ModelConfigurer from "../common/ModelConfigurer.vue";

const defaultModel = { kind: 'target-system', name: null, metadata: { title: null }, spec: { default: null } }
</script>

<style scoped>

</style>
