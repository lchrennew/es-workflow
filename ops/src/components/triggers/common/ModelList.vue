<template>
    <data-loader
        :hash="hash"
        :load-data="load"
        :load-data-args="{}"
        #="{data, loaded}"
    >
        <a-table :data-source="data" :loading="!loaded" :pagination="{pageSize: 100,hideOnSinglePage: true}">
            <a-table-column #="{record}" :width="200" title="名称">
                {{ record.metadata.title }}
            </a-table-column>
            <a-table-column #="{record}" :width="400" title="标识">
                {{ record.name }}
            </a-table-column>
            <slot/>
            <a-table-column #="{record}" title="操作" :width="100">
                <a-space>
                    <edit-model :configurer="configurer" :model="record" :model-type-name="modelTypeName"/>
                    <delete-model :delete-model="remove" :get-hash="getHash" :model="record"/>
                </a-space>
            </a-table-column>
        </a-table>
    </data-loader>
</template>

<script setup>
import DataLoader from "data-loader-vue3";
import EditModel from "./EditModel.vue";
import DeleteModel from "./DeleteModel.vue";

const props = defineProps({
    load: { required: true, type: Function },
    configurer: { required: true, type: Object },
    modelTypeName: String,
    remove: { required: true, type: Function },
    getHash: { required: true, type: Function }
})

const hash = props.getHash()

</script>

<style scoped>

</style>
