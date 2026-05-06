<template>
    <a-form-item label="输出缓存">
        <a-switch v-model:checked="model.spec.outputCache.enabled"/>
    </a-form-item>
    <a-form-item label="缓存键计算">
        <a-textarea auto-size v-model:value="model.spec.outputCache.keyGetter"/>
    </a-form-item>
    <a-form-item label="超时时长（秒）">
        <a-input-number v-model:value="model.spec.outputCache.expirationSeconds"/>
    </a-form-item>
</template>

<script setup>
import { computed, watchEffect } from "vue";

const props = defineProps({
    model: Object,
})

watchEffect(() => {
    props.model.spec.outputCache ??= {}
})

const cache = computed({
    get() {
        return props.model.spec.outputCache ?? {}
    },
    set(value) {
        props.model.spec.outputCache = value ?? {}
    }
})
</script>

<style scoped>

</style>