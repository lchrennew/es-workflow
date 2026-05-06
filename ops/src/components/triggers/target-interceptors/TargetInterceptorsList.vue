<template>
    <model-list
        :configurer="TargetInterceptorConfigurer"
        :get-hash="getTargetInterceptorsHash"
        :load="loadTargetInterceptors"
        :remove="deleteTargetInterceptor"
        model-type-name="输出拦截">

    </model-list>
</template>

<script setup>
import {
    deleteTargetInterceptor,
    getTargetInterceptorsHash,
    loadTargetInterceptors
} from "../../../services/triggers/target-interceptors.js";
import ModelList from "../common/ModelList.vue";
import TargetInterceptorConfigurer from "./TargetInterceptorConfigurer.vue";</script>

<style scoped>

</style>
