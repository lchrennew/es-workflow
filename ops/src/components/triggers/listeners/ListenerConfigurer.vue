<template>
    <model-configurer
        :get-hash="getListenersHash"
        :default-model="defaultModel"
        :save="saveListener"
        #="{model}"
    >
        <a-form-item label="转发规则">
            <model-picker
                :load-models="loadTriggers"
                v-model:value="model.spec.triggers"
                multiple/>
        </a-form-item>
    </model-configurer>
</template>

<script setup>
import { getListenersHash, saveListener } from "../../../services/triggers/listeners.js";
import ModelConfigurer from "../common/ModelConfigurer.vue";
import { loadTriggers } from "../../../services/triggers/triggers.js";
import ModelPicker from "../common/ModelPicker.vue";

const defaultModel = { kind: 'listener', name: null, metadata: { title: null }, spec: { triggers: [] } }
</script>

<style scoped>

</style>
