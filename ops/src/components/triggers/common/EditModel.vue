<template>
    <drawer-opener
        :props="{title: `编辑${modelTypeName}`, width: '800px'}"
        :component="configurer"
        :component-props="{model}"
        footer
        #="{open}"
    >
        <a href="#" @click.stop.prevent="open">编辑</a>
    </drawer-opener>

</template>

<script setup>
import DrawerOpener from "drawer-vue3/src/DrawerOpener.vue";

const props = defineProps({
    configurer: Object,
    modelTypeName: String,
    model: Object,
})
</script>
