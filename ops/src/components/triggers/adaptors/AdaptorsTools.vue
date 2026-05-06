<template>
    <tools>
        <create-model
            :configurer="AdaptorsConfigurer"
            model-type-name="数据适配"/>
    </tools>
</template>

<script setup>
import Tools from "../../common/Tools.vue";
import CreateModel from "../common/CreateModel.vue";
import AdaptorsConfigurer from "./AdaptorsConfigurer.vue";</script>

<style scoped>

</style>
