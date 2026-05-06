<template>
    <model-list
        :configurer="TargetSystemConfigurer"
        :get-hash="getTargetSystemsHash"
        :remove="deleteTargetSystem"
        :load="loadTargetSystems"
        model-type-name="目标系统">
        <a-table-column title="地址" #="{record}">
            {{ record.spec }}
        </a-table-column>
    </model-list>
</template>

<script setup>
import {
    deleteTargetSystem,
    getTargetSystemsHash,
    loadTargetSystems
} from "../../../services/triggers/target-systems.js";
import TargetSystemConfigurer from './TargetSystemConfigurer.vue'
import ModelList from "../common/ModelList.vue";


</script>

<style scoped>

</style>
