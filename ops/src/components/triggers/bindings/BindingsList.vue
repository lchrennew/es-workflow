<template>
    <model-list
        :get-hash="getBindingsHash"
        :configurer="BindingConfigurer"
        :load="loadBindings"
        :remove="deleteBinding"
        model-type-name="数据绑定">

    </model-list>
</template>

<script setup>
import { loadBindings, deleteBinding, getBindingsHash } from "../../../services/triggers/bindings.js";
import ModelList from "../common/ModelList.vue";
import BindingConfigurer from './BindingConfigurer.vue'

</script>

<style scoped>

</style>
