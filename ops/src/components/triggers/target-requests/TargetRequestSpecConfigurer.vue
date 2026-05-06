<template>
    <a-form-item label="转发规则">
        <data-loader
            :load-data="loadTriggers"
            :load-data-args="{}"
            hash="*"
            #="{data}">
            <a-select v-model:value="model.metadata.trigger">
                <a-select-option v-for="item in data" :key="data.name" :value="item.name">
                    {{ item.metadata?.title ?? item.name }}
                </a-select-option>
            </a-select>
        </data-loader>
    </a-form-item>
    <a-form-item label="属性">
        <a-textarea v-model:value="modelProps"/>
    </a-form-item>
</template>

<script setup>
import { computed } from "vue";
import DataLoader from "data-loader-vue3";
import { loadTriggers } from "../../../services/triggers/triggers.js";

const props = defineProps({
    model: Object
})

const modelProps = computed({
    get() {
        return JSON.stringify(props.model.spec.props)
    },
    set(value) {
        try {
            props.model.spec.props = JSON.parse(value)
        } catch (error) {
        }
    }
})
</script>

<style scoped>

</style>
