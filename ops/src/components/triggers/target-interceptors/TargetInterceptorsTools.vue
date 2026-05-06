<template>
<tools>
    <create-model
        :configurer="TargetInterceptorConfigurer"
        model-type-name="输出拦截"/>
</tools>
</template>

<script setup>
import Tools from "../../common/Tools.vue";
import CreateModel from "../common/CreateModel.vue";
import TargetInterceptorConfigurer from "./TargetInterceptorConfigurer.vue";
</script>

<style scoped>

</style>
