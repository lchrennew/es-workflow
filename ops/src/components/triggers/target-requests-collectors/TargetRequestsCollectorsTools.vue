<template>
    <tools>
        <create-model
            :configurer="TargetRequestsCollectorConfigurer"
            model-type-name="输出请求收集器"/>
    </tools>
</template>

<script setup>
import Tools from "../../common/Tools.vue";
import CreateModel from "../common/CreateModel.vue";
import TargetRequestsCollectorConfigurer from "./TargetRequestsCollectorConfigurer.vue";
</script>

<style scoped>

</style>
