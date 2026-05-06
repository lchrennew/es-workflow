<template>
    <data-loader
        :load-data="loadModels"
        :load-data-args="loadModelsArgs"
        hash="*"
        #="{data}">
        <a-select
            :value="value"
            @change="x=>emit('update:value', x)"
            :mode="multiple?'multiple': 'combobox'"
            show-search
            allow-clear
        >
            <a-select-option v-for="item in data" :key="data.name" :value="item.name">
                {{ item.metadata?.title ?? item.name }}
            </a-select-option>
        </a-select>
    </data-loader>
</template>

<script setup>
import DataLoader from "data-loader-vue3";

const props = defineProps({
    value: { required: true },
    loadModels: { required: true },
    loadModelsArgs: { required: false, type: Object, default: () => ({}) },
    multiple: { type: Boolean, default: false }
})

const emit = defineEmits([ 'update:value' ])

</script>

<style scoped>

</style>
