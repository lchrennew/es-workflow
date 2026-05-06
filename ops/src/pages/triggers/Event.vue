<template>
    <data-loader
        :load-data="getEvent"
        :load-data-args="{id}"
        :hash="id"
    >
        <template #default="{data, loaded}">
            <event-tree :events="data" #="{selected}" v-if="loaded">
                <router-view/>
            </event-tree>
        </template>
        <template #error>
            请输入有效的事件ID
        </template>
    </data-loader>
</template>

<script setup>
import EventTree from "../../components/triggers/events/EventTree.vue";
import DataLoader from "data-loader-vue3";
import { getEvent } from "../../services/triggers/events.js";

const props = defineProps({
    id: String,
})


</script>

<style scoped>

</style>
