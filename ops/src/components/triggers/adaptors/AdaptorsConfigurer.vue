<template>
    <model-configurer
        :get-hash="getAdaptorsHash"
        :default-model="defaultModel"
        :save="saveAdaptor"
        #="{model}">
        <a-form-item label="请求拦截">
            <model-picker :load-models="loadSourceInterceptors" v-model:value="model.spec.sourceInterceptor"/>
        </a-form-item>
        <a-form-item label="数据请求">
            <model-picker :load-models="loadAdaptorRequests" v-model:value="model.spec.adaptorRequests" multiple/>
        </a-form-item>
        <a-form-item label="响应转换">
            <a-textarea auto-size v-model:value="model.spec.transformResponse"/>
        </a-form-item>
        <adaptors-cache-configurer v-bind="{model}"/>
    </model-configurer>
</template>

<script setup>
import ModelConfigurer from "../common/ModelConfigurer.vue";
import { getAdaptorsHash, saveAdaptor } from "../../../services/triggers/adaptors.js";
import ModelPicker from "../common/ModelPicker.vue";
import { loadSourceInterceptors } from "../../../services/triggers/source-interceptors.js";
import { loadAdaptorRequests } from "../../../services/triggers/adaptor-requests.js";
import AdaptorsCacheConfigurer from "./AdaptorsCacheConfigurer.vue";

const defaultModel = {
    kind: 'adaptor',
    name: null,
    metadata: { title: null },
    spec: { sourceInterceptor: null, adaptorRequests: [], transformResponse: null, cache: {} }
}
</script>

<style scoped>

</style>
