<template>
    <tools>
        <create-model
            model-type-name="输入拦截"
            :configurer="SourceInterceptorConfigurer"
        />
    </tools>
</template>

<script setup>
import Tools from "../../common/Tools.vue";
import CreateModel from "../common/CreateModel.vue";
import SourceInterceptorConfigurer from "./SourceInterceptorConfigurer.vue";

</script>

<style scoped>

</style>
