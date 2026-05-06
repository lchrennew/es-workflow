<template>
    <a-form-item label="方法">
        <a-input v-model:value="model.spec.method"/>
    </a-form-item>
    <a-form-item label="路径">
        <a-input v-model:value="model.spec.path"/>
    </a-form-item>
    <a-form-item label="查询">
        <a-textarea :default-value="query" @update:value="query=$event"/>
    </a-form-item>
    <a-form-item label="头">
        <a-textarea :default-value="headers" @update:value="headers=$event"/>
    </a-form-item>
    <a-form-item label="格式">
        <a-select v-model:value="format">
            <a-select-option value="json">JSON</a-select-option>
            <a-select-option value="form">Form</a-select-option>
        </a-select>
    </a-form-item>
    <a-form-item label="内容">
        <a-textarea :default-value="body" @update:value="body=$event"/>
    </a-form-item>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
    model: Object
})


const query = computed({
    get() {
        return JSON.stringify(props.model.spec.query)
    },
    set(value) {
        try {
            props.model.spec.query = JSON.parse(value)
        } catch (error) {
        }
    }
})

const headers = computed({
    get() {
        return JSON.stringify(props.model.spec.headers)
    },
    set(value) {
        try {
            props.model.spec.headers = JSON.parse(value)
        } catch (error) {
        }
    }
})

const body = computed({
    get() {
        return JSON.stringify(props.model.spec.body)
    },
    set(value) {
        try {
            props.model.spec.body = JSON.parse(value)
        } catch (error) {
        }
    }
})

const format = computed({
    get: () => props.model.spec.format ?? 'json',
    set: value => props.model.spec.format = value,
})
</script>

<style scoped>

</style>
