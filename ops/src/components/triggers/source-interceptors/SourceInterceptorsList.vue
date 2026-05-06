<template>
    <model-list :get-hash="getSourceInterceptorsHash"
                :remove="deleteSourceInterceptor"
                :configurer="SourceInterceptorConfigurer"
                :load="loadSourceInterceptors"
                model-type-name="输入拦截">

    </model-list>
</template>

<script setup>
import {
    deleteSourceInterceptor,
    getSourceInterceptorsHash,
    loadSourceInterceptors
} from "../../../services/triggers/source-interceptors.js";
import ModelList from "../common/ModelList.vue";
import SourceInterceptorConfigurer from "./SourceInterceptorConfigurer.vue";</script>

<style scoped>

</style>
