<template>
    <tools>
        <create-model
            :configurer="BindingConfigurer"
            model-type-name="数据绑定"/>
    </tools>
</template>

<script setup>
import Tools from "../../common/Tools.vue";
import CreateModel from "../common/CreateModel.vue";
import BindingConfigurer from './BindingConfigurer.vue'

</script>

<style scoped>

</style>
