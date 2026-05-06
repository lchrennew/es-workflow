<template>
    <common-breadcrumb/>
    <a-row :gutter="16" wrap>
        <a-col :span="4">
            <a-card title="基础设施维护">
                <router-link :to="{name: '配置更新'}">配置更新</router-link>
                <router-link :to="{name: '请求转发'}">请求转发</router-link>
            </a-card>
        </a-col>
        <a-col :span="4">
            <a-card title="公共工具">
                <router-link :to="{name: 'ObjectID解析'}">ObjectId解析</router-link>
                <router-link :to="{name: 'JSON-YAML转换'}">JSON-YAML转换</router-link>
                <router-link :to="{name: 'Base64转换'}">Base64转换</router-link>
            </a-card>
        </a-col>
    </a-row>
</template>

<script setup>
import CommonBreadcrumb from "../components/common/CommonBreadcrumb.vue";</script>

<style scoped lang="less">
a {
    display: block;
}
</style>
