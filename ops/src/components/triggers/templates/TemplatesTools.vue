<template>
    <tools>
        <create-model
            :configurer="TemplateConfigurer"
            model-type-name="输出模板"/>
    </tools>
</template>

<script setup>
import Tools from "../../common/Tools.vue";
import CreateModel from "../common/CreateModel.vue";
import TemplateConfigurer from "./TemplateConfigurer.vue";

</script>

<style scoped>

</style>
