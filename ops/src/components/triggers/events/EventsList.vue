<template>
    <data-loader
        :load-data="getEvents"
        :load-data-args="{}"
        hash="*"
        #="{data, loaded}">
        <template v-if="loaded">
            <div class="wrapper">
                <div class="events-list">
                    <router-link class="event-list-item" v-for="id in data" :key="id"
                                 :to="{name:'请求转发/转发日志/事件项/详情', params: {id, sub: id}}">
                        {{ dayjs.utc(parseObjectID(id).timestamp).format('MM/DD HH:mm:ss') }}
                    </router-link>
                </div>
            </div>
            <router-view />
        </template>
    </data-loader>
</template>

<script setup>
import DataLoader from "data-loader-vue3";
import { getEvents } from "../../../services/triggers/events.js";
import { parseObjectID } from "es-object-id";
import dayjs from "dayjs";
</script>
<style scoped lang="less">
.wrapper {
    position: relative;
    width: 150px;
    overflow: auto;
    border-right: solid 1px #f0f0f0;

    .events-list {
        display: flex;
        flex-direction: column;
        position: absolute;

        .event-list-item {
            padding: 0.5em 1em;
            color: #f0f0f0;
            transition: all 0.3s ease;

        }
    }
}


</style>
