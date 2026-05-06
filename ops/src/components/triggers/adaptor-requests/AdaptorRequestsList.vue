<template>
    <model-list
        :configurer="AdaptorRequestsConfigurer"
        :get-hash="getAdaptorRequestsHash"
        :load="loadAdaptorRequests"
        :remove="deleteAdaptorRequest"
        model-type-name="数据请求">
        <a-table-column title="数据绑定" #="{record}">
            <edit-model-link
                :configurer="BindingConfigurer"
                :name="record.spec.binding"
                :get-get="getGet"
                kind-name="数据绑定"
                path="bindings"
            >
                {{ record.spec.binding }}
            </edit-model-link>
        </a-table-column>
        <a-table-column title="输出模板" #="{record}">
            <edit-model-link
                :configurer="TemplateConfigurer"
                :name="record.spec.template"
                :get-get="getGet"
                kind-name="输出模板"
                path="templates"
            >
                {{ record.spec.template }}
            </edit-model-link>
        </a-table-column>
        <a-table-column title="目标系统" #="{record}">
            <edit-model-link
                :configurer="TargetSystemConfigurer"
                :name="record.spec.targetSystem"
                :get-get="getGet"
                kind-name="目标系统"
                path="target-systems"
            >
                {{ record.spec.targetSystem }}
            </edit-model-link>

        </a-table-column>
    </model-list>
</template>

<script setup>
import ModelList from "../common/ModelList.vue";
import AdaptorRequestsConfigurer from "./AdaptorRequestsConfigurer.vue";
import BindingConfigurer from "../bindings/BindingConfigurer.vue";
import TemplateConfigurer from "../templates/TemplateConfigurer.vue";
import TargetSystemConfigurer from "../target-systems/TargetSystemConfigurer.vue";
import {
    deleteAdaptorRequest,
    getAdaptorRequestsHash,
    loadAdaptorRequests
} from "../../../services/triggers/adaptor-requests.js";
import EditModelLink from "../common/EditModelLink.vue";
import { getGet } from "../../../services/triggers/models.js";</script>

<style scoped>

</style>
