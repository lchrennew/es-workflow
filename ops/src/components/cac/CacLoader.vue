<template>
    <a-form layout="inline" :model="model">
        <a-form-item required>
            <a-input v-model:value="model.kind" placeholder="kind"/>
        </a-form-item>
        <a-form-item required>
            <a-input v-model:value="model.name" placeholder="name"/>
        </a-form-item>
        <a-form-item :wrapper-col="{offset: 2}">
            <a-button @click.stop.prevent="load" type="primary">加载</a-button>
        </a-form-item>
    </a-form>
</template>

<script setup>
import { loadConfig } from "../../services/cac.js";
import { reactive } from "vue";

const emit = defineEmits([ 'loaded' ])

const model = reactive({
    kind: '',
    name: '',
})

const load = async () => {
    const config = await loadConfig(model.kind, model.name)
    emit('loaded', config)
}
</script>

<style scoped>

</style>