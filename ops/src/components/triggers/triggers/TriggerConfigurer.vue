<template>
    <model-configurer
        #="{model}"
        :default-model="defaultModel"
        :get-hash="getTriggersHash"
        :save="saveTrigger">
        <a-form-item label="输入拦截">
            <model-picker
                :load-models="loadSourceInterceptors"
                v-model:value="model.spec.sourceInterceptor"/>
        </a-form-item>
        <a-form-item label="输出拦截">
            <model-picker
                :load-models="loadTargetInterceptors"
                v-model:value="model.spec.targetInterceptor"/>
        </a-form-item>
        <a-form-item label="目标系统">
            <model-picker
                :load-models="loadTargetSystems"
                v-model:value="model.spec.targetSystem"/>
        </a-form-item>
        <a-form-item label="数据绑定">
            <model-picker
                :load-models="loadBindings"
                v-model:value="model.spec.binding"/>
        </a-form-item>
        <a-form-item label="输出模版">
            <model-picker
                :load-models="loadTemplates"
                v-model:value="model.spec.template"/>
        </a-form-item>
        <a-form-item label="输出收集器">
            <model-picker
                :load-models="loadTargetRequestsCollectors"
                v-model:value="model.spec.targetRequestsCollector"/>
        </a-form-item>
        <a-form-item label="有配置界面" :name="['metadata', 'configurable']">
            <a-switch v-model:checked="model.metadata.configurable"/>
        </a-form-item>
        <a-form-item label="名称空间">
            <a-textarea v-model:value="model.spec.namespace"/>
        </a-form-item>
    </model-configurer>
</template>

<script setup>
import ModelConfigurer from "../common/ModelConfigurer.vue";
import { getTriggersHash, saveTrigger } from "../../../services/triggers/triggers.js";
import { loadSourceInterceptors } from "../../../services/triggers/source-interceptors.js";
import { loadTargetInterceptors } from "../../../services/triggers/target-interceptors.js";
import { loadBindings } from "../../../services/triggers/bindings.js";
import { loadTemplates } from "../../../services/triggers/templates.js";
import { loadTargetSystems } from "../../../services/triggers/target-systems.js";
import ModelPicker from "../common/ModelPicker.vue";
import { loadTargetRequestsCollectors } from "../../../services/triggers/target-requests-collectors.js";


const defaultModel = {
    kind: 'trigger',
    name: null,
    metadata: { title: null },
    spec: { sourceInterceptor: null, targetInterceptor: null, binding: null, template: null, targetSystem: null }
}

</script>

<style scoped>

</style>
