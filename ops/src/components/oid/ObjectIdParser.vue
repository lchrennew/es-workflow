<template>
    <a-input v-model:value="objectId"/>
    <a-descriptions title="解析结果">
        <a-descriptions-item label="时间戳">{{ timestamp }}</a-descriptions-item>
        <a-descriptions-item label="时间">{{ time }}</a-descriptions-item>
        <a-descriptions-item label="机器">{{ machine }}</a-descriptions-item>
        <a-descriptions-item label="PID">{{ pid }}</a-descriptions-item>
        <a-descriptions-item label="增量">{{ inc }}</a-descriptions-item>
    </a-descriptions>
</template>

<script setup>
import { computed, ref } from "vue";
import { parseObjectID } from 'es-object-id'
import dayjs from "dayjs";

const objectId = ref(null)
const parsed = computed(() => {
    try {
        return parseObjectID(objectId.value)
    } catch (error) {
        return {}
    }
})
const timestamp = computed(() => parsed.value.timestamp)
const time = computed(() => {
    try {
        return dayjs.utc(timestamp.value).toISOString()
    } catch (error) {
        return '无效时间'
    }
})
const inc = computed(() => parsed.value.inc)
const pid = computed(() => parsed.value.pid)
const machine = computed(() => parsed.value.machine)
</script>

<style scoped>

</style>