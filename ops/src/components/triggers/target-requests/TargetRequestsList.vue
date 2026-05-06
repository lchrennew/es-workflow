<template>
    <model-list
        :configurer="TargetRequestConfigurer"
        :get-hash="getTargetRequestsHash"
        :load="loadTargetRequests"
        :remove="deleteTargetRequest"
        model-type-name="输出请求">
        <a-table-column title="转发规则" #="{record}" :width="400">
            <edit-model-link
                :configurer="TriggerConfigurer"
                :name="record.metadata.trigger"
                :get-get="getGet"
                kind-name="转发规则"
                path="triggers"
            >
                {{ record.metadata.trigger }}
            </edit-model-link>
        </a-table-column>
    </model-list>
</template>

<script setup>
import {
    deleteTargetRequest,
    getTargetRequestsHash,
    loadTargetRequests
} from "../../../services/triggers/target-requests.js";
import ModelList from "../common/ModelList.vue";
import TargetRequestConfigurer from "./TargetRequestConfigurer.vue";
import TriggerConfigurer from "../triggers/TriggerConfigurer.vue";
import EditModelLink from "../common/EditModelLink.vue";
import { getGet } from "../../../services/triggers/models.js";</script>

<style scoped>

</style>
