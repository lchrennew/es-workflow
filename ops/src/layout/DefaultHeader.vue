<template>
    <div class="layout-breadcrumb"/>
    <div class="layout-tools"/>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

</script>

<style lang="less" scoped>

.layout-breadcrumb {
    display: inline-flex;
    padding: 0 10px;

    &:first-child {
        padding: 0 10px 0 0;
    }
}

.layout-tools{
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
}

</style>
