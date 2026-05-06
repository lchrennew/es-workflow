<template>

    <a-form :wrapper-col="{span: 20}" :label-col="{span:2}" :model="model" :rules="rules" ref="form" @finish="save">
        <a-form-item label="加载配置">
            <cac-loader @loaded="load" />
        </a-form-item>
        <a-form-item label="配置内容" name="content">
            <a-textarea v-model:value="model.content" :auto-size="{minRows: 6}" />
        </a-form-item>
        <a-form-item :wrapper-col="{offset: 2}">
            <a-button type="primary" html-type="submit">保存</a-button>
        </a-form-item>
    </a-form>
</template>

<script setup>
import { reactive, ref } from "vue";
import { saveConfigs } from "../../services/cac.js";
import * as YAML from 'yaml';
import { message } from "ant-design-vue";
import CacLoader from "./CacLoader.vue";


const model = reactive({
    content: null
})

const rules = {
    content: [
        {
            required: true,
            message: '请填写内容'
        },
        {
            validator: async () => {
                try {
                    YAML.parseAllDocuments(model.content)
                } catch (error) {
                    throw 'yaml格式错误'
                }
            }
        },
    ]
}
const form = ref(null)
const save = async () => {
    await saveConfigs(model.content)
    message.success('保存成功')
}

const load = config => model.content = YAML.parse(config, { lineWidth: 200 })
</script>

<style scoped>

</style>