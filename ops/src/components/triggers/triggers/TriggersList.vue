<template>
    <model-list
        :get-hash="getTriggersHash"
        :load="loadTriggers"
        :remove="deleteTrigger"
        :configurer="TriggerConfigurer"
        model-type-name="分发规则">
        <a-table-column title="输入拦截" #="{record}">
            <edit-model-link
                :configurer="SourceInterceptorConfigurer"
                :name="record.spec.sourceInterceptor"
                :get-get="getGet"
                kind-name="输入拦截"
                path="source-interceptors"
            >
                {{ record.spec.sourceInterceptor }}
            </edit-model-link>
        </a-table-column>
        <a-table-column title="输出拦截" #="{record}">
            <edit-model-link
                :configurer="TargetInterceptorConfigurer"
                :name="record.spec.targetInterceptor"
                :get-get="getGet"
                kind-name="输出拦截"
                path="target-interceptors"
            >
                {{ record.spec.targetInterceptor }}
            </edit-model-link>
        </a-table-column>
        <a-table-column title="输出模版" #="{record}">
            <edit-model-link
                :configurer="TemplateConfigurer"
                :name="record.spec.template"
                :get-get="getGet"
                kind-name="输出模版"
                path="templates"
            >
                {{ record.spec.template }}
            </edit-model-link>
        </a-table-column>
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
        <a-table-column title="收集器" #="{record}">
            <edit-model-link
                :configurer="TargetRequestsCollectorConfigurer"
                :name="record.spec.targetRequestsCollector"
                :get-get="getGet"
                kind-name="收集器"
                path="target-requests-collector"
            >
                {{ record.spec.targetRequestsCollector }}
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
import { deleteTrigger, getTriggersHash, loadTriggers } from "../../../services/triggers/triggers.js";
import ModelList from "../common/ModelList.vue";
import TriggerConfigurer from "./TriggerConfigurer.vue";
import SourceInterceptorConfigurer from "../source-interceptors/SourceInterceptorConfigurer.vue";
import TargetInterceptorConfigurer from "../target-interceptors/TargetInterceptorConfigurer.vue";
import TemplateConfigurer from "../templates/TemplateConfigurer.vue";
import BindingConfigurer from "../bindings/BindingConfigurer.vue";
import TargetSystemConfigurer from "../target-systems/TargetSystemConfigurer.vue";
import EditModelLink from "../common/EditModelLink.vue";
import { getGet } from "../../../services/triggers/models.js";
import TargetRequestsCollectorConfigurer from "../target-requests-collectors/TargetRequestsCollectorConfigurer.vue";</script>

<style scoped>

</style>
