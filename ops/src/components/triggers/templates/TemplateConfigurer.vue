<template>
    <model-configurer
        :get-hash="getTemplatesHash"
        :save="saveTemplate"
        :default-model="defaultModel"
        #="{model}">
        <template-spec-configurer :model="model"/>
    </model-configurer>
</template>

<script setup>
import ModelConfigurer from "../common/ModelConfigurer.vue";
import { getTemplatesHash, saveTemplate } from "../../../services/triggers/templates.js";
import TemplateSpecConfigurer from "./TemplateSpecConfigurer.vue";

const defaultModel = {
    kind: 'template',
    name: null,
    metadata: { title: null },
    spec: { path: null, headers: null, query: null, body: null }
}


</script>

<style scoped>

</style>
