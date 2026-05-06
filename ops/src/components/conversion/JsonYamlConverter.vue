<template>
    <a-form>
        <a-form-item label="YAML">
            <a-textarea v-model:value="yaml" />
        </a-form-item>
        <a-form-item label="JSON">
            <a-textarea v-model:value="json" />
        </a-form-item>
        <a-form-item>
            <a-button @click="yaml2Json">YAML->JSON</a-button>
            <a-button @click="json2Yaml">JSON->YAML</a-button>
        </a-form-item>
    </a-form>
</template>

<script setup>
import { ref } from "vue";
import * as YAML from 'yaml'

const yaml = ref('')
const json = ref('')

const yaml2Json = () => {
    try {
        json.value = JSON.stringify(YAML.parseAllDocuments(yaml.value))
    } catch (error) {
        alert('数据无效')
    }
}

const json2Yaml = () => {
    try {
        yaml.value = YAML.stringify(JSON.parse(json.value), { lineWidth: 200 })
    } catch (error) {
        console.error(error)
        alert('数据无效')
    }
}
</script>

<style scoped>

</style>