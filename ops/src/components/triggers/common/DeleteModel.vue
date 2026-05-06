<template>
    <a href="#" @click.stop.prevent="remove">删除</a>
</template>

<script setup>
import { generateObjectID } from "es-object-id";

const props = defineProps({
    deleteModel: { type: Function, required: true },
    getHash: { type: Function, required: true },
    model: { type: Object, required: true }
})

const remove = async () => {
    await props.deleteModel(props.model)
    setTimeout(() => {
        const hashRef = props.getHash()
        return hashRef.value = generateObjectID();
    }, 1000)
}
</script>

<style scoped>

</style>
