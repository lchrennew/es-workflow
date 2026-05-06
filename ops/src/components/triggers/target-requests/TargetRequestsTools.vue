<template>
    <tools>
        <create-model
            :configurer="TargetRequestConfigurer"
            model-type-name="输出请求"/>
    </tools>
</template>

<script setup>
import Tools from "../../common/Tools.vue";
import CreateModel from "../common/CreateModel.vue";
import TargetRequestConfigurer from "./TargetRequestConfigurer.vue";
</script>

<style scoped>

</style>
