<template>
    <drawer-opener #="{open}"
                   :props="{title: `新建${modelTypeName}`}"
                   :component="configurer"
                   :component-props="{}"
                   footer>
        <a-button @click="open">新建</a-button>
    </drawer-opener>
</template>

<script setup>
import DrawerOpener from "drawer-vue3/src/DrawerOpener.vue";

const props = defineProps({
    configurer: Object,
    modelTypeName: String,
})
</script>

<style scoped>

</style>
