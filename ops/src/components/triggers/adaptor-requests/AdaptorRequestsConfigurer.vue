<template>
    <model-configurer
        :save="saveAdaptorRequest"
        :get-hash="getAdaptorRequestsHash"
        :default-model="defaultModel"
        #="{model}">
        <a-form-item label="数据绑定">
            <model-picker :load-models="loadBindings" v-model:value="model.spec.binding"/>
        </a-form-item>
        <a-form-item label="输出模板">
            <model-picker :load-models="loadTemplates" v-model:value="model.spec.template"/>
        </a-form-item>
        <a-form-item label="目标系统">
            <model-picker :load-models="loadTargetSystems" v-model:value="model.spec.targetSystem"/>
        </a-form-item>
    </model-configurer>

</template>

<script setup>
import ModelConfigurer from "../common/ModelConfigurer.vue";
import { getAdaptorRequestsHash, saveAdaptorRequest } from "../../../services/triggers/adaptor-requests.js";
import ModelPicker from "../common/ModelPicker.vue";
import { loadBindings } from "../../../services/triggers/bindings.js";
import { loadTemplates } from "../../../services/triggers/templates.js";
import { loadTargetSystems } from "../../../services/triggers/target-systems.js";

const defaultModel = {
    kind: 'adaptor-request',
    name: null,
    metadata: { title: null },
    spec: { binding: null, template: null, targetSystem: null }
}
</script>

<style scoped>

</style>
