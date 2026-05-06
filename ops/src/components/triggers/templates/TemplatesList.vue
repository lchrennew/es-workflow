<template>
    <model-list
        :get-hash="getTemplatesHash"
        :configurer="TemplateConfigurer"
        :remove="deleteTemplate"
        :load="loadTemplates"
        model-type-name="输出模板">

    </model-list>
</template>

<script setup>
import { loadTemplates, getTemplatesHash, deleteTemplate } from "../../../services/triggers/templates.js";
import ModelList from "../common/ModelList.vue";
import TemplateConfigurer from "./TemplateConfigurer.vue";
</script>

<style scoped>

</style>
