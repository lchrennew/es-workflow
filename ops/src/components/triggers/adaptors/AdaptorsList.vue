<template>
    <model-list
        :configurer="AdaptorsConfigurer"
        :remove="deleteAdaptor"
        :load="loadAdaptors"
        :get-hash="getAdaptorsHash"
        model-type-name="数据适配">
        <a-table-column title="数据请求" #="{record}">
            <a-space>
                <edit-model-link
                    v-for="adapterRequest in record.spec.adaptorRequests"
                    :configurer="AdaptorRequestsConfigurer"
                    :name="adapterRequest"
                    :get-get="getGet"
                    kind-name="数据请求"
                    path="adaptor-requests"
                >
                    {{ adapterRequest }}
                </edit-model-link>
            </a-space>
        </a-table-column>
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
    </model-list>
</template>

<script setup>
import ModelList from "../common/ModelList.vue";
import AdaptorsConfigurer from "./AdaptorsConfigurer.vue";
import AdaptorRequestsConfigurer from "../adaptor-requests/AdaptorRequestsConfigurer.vue";
import SourceInterceptorConfigurer from "../source-interceptors/SourceInterceptorConfigurer.vue";
import { deleteAdaptor, getAdaptorsHash, loadAdaptors } from "../../../services/triggers/adaptors.js";
import EditModelLink from "../common/EditModelLink.vue";
import { getGet } from "../../../services/triggers/models.js";</script>

<style scoped>

</style>
