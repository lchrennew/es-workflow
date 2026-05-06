<template>
    <tools>
        <create-model
            model-type-name="监听器"
            :configurer="ListenerConfigurer"/>
    </tools>
</template>

<style scoped>

</style>
<script setup>
import Tools from "../../common/Tools.vue";
import ListenerConfigurer from './ListenerConfigurer.vue'
import CreateModel from "../common/CreateModel.vue";

</script>
