<template>
    <a-form :model="modelRef"
            :rules="rules"
            :label-col="{span: 4}"
            :wrapper-col="{span:20}">
        <a-form-item label="名称">
            <a-input v-model:value="modelRef.metadata.title"/>
        </a-form-item>
        <a-form-item label="标识" name="name">
            <a-input v-model:value="modelRef.name" :disabled="immutableName"/>
        </a-form-item>
        <slot :model="modelRef"/>
    </a-form>
    <drawer-footer>
        <a-button type="primary" @click="saveAndReload">保存</a-button>
    </drawer-footer>
</template>

<script setup>
import DrawerFooter from "drawer-vue3/src/DrawerFooter.vue";
import { computed, inject, ref } from "vue";
import { generateObjectID } from "es-object-id";

const props = defineProps({
    model: { type: Object },
    defaultModel: { type: Object },
    getHash: { type: Function },
    save: { type: Function }
})

const immutableName = computed(() => !!props.model)

const modelRef = ref(JSON.parse(JSON.stringify(props.model || props.defaultModel)))
const closeDrawer = inject('closeDrawer')
const saveAndReload = async () => {
    await props.save(modelRef.value)
    const modelHash = props.getHash()
    modelHash.value = generateObjectID()
    closeDrawer()
}

const rules = {
    name: [
        { required: true, message: '请填写标识' },
        {
            async validator() {
                modelRef.value.name.split('/').forEach(name => {
                    if (!name.match(/^[a-z][a-z\d]*(?:-[a-z\d]+)*$/))
                        throw '格式错误，只允许小写字母、数字，使用中划线分词符'
                })
            }
        }
    ]
}
</script>

<style scoped>

</style>
