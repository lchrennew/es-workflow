<template>
    <model-list
        :configurer="ListenerConfigurer"
        :get-hash="getListenersHash"
        model-type-name="监听器"
        :load="loadListeners"
        :remove="deleteListener">
        <a-table-column title="关联规则" #="{record}">
            <a-space>
                <edit-model-link
                    v-for="trigger in record.spec.triggers"
                    :configurer="TriggerConfigurer"
                    :name="trigger"
                    :get-get="getGet"
                    path="triggers"
                    kind-name="转发规则"
                >
                    {{ trigger }}
                </edit-model-link>
            </a-space>
        </a-table-column>
    </model-list>

</template>

<script setup>
import { deleteListener, getListenersHash, loadListeners } from "../../../services/triggers/listeners.js";
import ListenerConfigurer from './ListenerConfigurer.vue'
import TriggerConfigurer from '../triggers/TriggerConfigurer.vue'
import ModelList from "../common/ModelList.vue";
import EditModelLink from "../common/EditModelLink.vue";
import { getGet } from "../../../services/triggers/models.js";</script>

<style scoped>

</style>
