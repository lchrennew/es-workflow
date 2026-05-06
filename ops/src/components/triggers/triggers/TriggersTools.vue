<template>
    <tools>
        <create-model
            :configurer="TriggerConfigurer"
            model-type-name="分发规则"/>
    </tools>
</template>

<script setup>
import Tools from "../../common/Tools.vue";
import CreateModel from "../common/CreateModel.vue";
import TriggerConfigurer from "./TriggerConfigurer.vue";
</script>

<style scoped>

</style>
