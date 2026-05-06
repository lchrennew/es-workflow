<template>
    <a-form>
        <a-form-item label="明文">
            <a-textarea v-model:value="text"/>
        </a-form-item>
        <a-form-item label="Base64">
            <a-textarea v-model:value="base64"/>
        </a-form-item>
        <a-form-item>
            <a-button @click="Base64">明文->Base64</a-button>
            <a-button @click="Text">Base64->明文</a-button>
        </a-form-item>
    </a-form>
</template>

<script setup>
import { ref } from "vue";
import { toBase64, toText } from "../../utils/base64";

const text = ref('')
const base64 = ref('')

const Base64 = () => {
    try {
        base64.value = toBase64(text.value);
    } catch (error) {
        alert('数据无效')
    }
}

const Text = () => {
    try {
        text.value = toText(base64.value)
    } catch (error) {
        console.error(error)
        alert('数据无效')
    }
}
</script>

<style scoped>

</style>