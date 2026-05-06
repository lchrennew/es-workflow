<template>
    <tools>
        <create-model
            :configurer="TargetConfigurer"
            model-type-name="目标系统"/>
    </tools>
</template>

<style scoped>

</style>
<script setup>
import Tools from "../../common/Tools.vue";
import TargetConfigurer from './TargetSystemConfigurer.vue'
import CreateModel from "../common/CreateModel.vue";

</script>
