<template>
    <div>
        <a-form layout="horizontal"
                :model="model"
                :wrapper-col="{span: 20}"
                :label-col="{span:2}">
            <a-form-item label="kind">
                <a-input v-model:value="model.kind"/>
            </a-form-item>
            <a-form-item label="name">
                <a-input v-model:value="model.name"/>
            </a-form-item>
            <a-form-item :wrapper-col="{offset: 2}">
                <a-button @click="removeConfig(model.kind, model.name)" type="primary">删除</a-button>
            </a-form-item>
        </a-form>
    </div>
</template>

<script setup>
import { reactive } from "vue";
import { removeConfig } from "../../services/cac.js";

const model = reactive({
    kind: null,
    name: null,
})
</script>

<style scoped>

</style>