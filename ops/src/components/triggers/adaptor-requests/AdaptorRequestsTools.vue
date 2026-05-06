<template>
    <tools>
        <create-model
            :configurer="AdaptorRequestsConfigurer"
            model-type-name="数据请求"/>
    </tools>
</template>

<script setup>
import Tools from "../../common/Tools.vue";
import CreateModel from "../common/CreateModel.vue";
import AdaptorRequestsConfigurer from "./AdaptorRequestsConfigurer.vue";</script>

<style scoped>

</style>
