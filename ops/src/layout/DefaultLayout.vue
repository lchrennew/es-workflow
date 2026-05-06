<template>
    <a-layout class="layout">
        <a-layout-header class="layout-header">
            <default-header/>
        </a-layout-header>
        <a-layout-content>
            <div class="layout-content">
                <router-view/>
            </div>
        </a-layout-content>
    </a-layout>
</template>

<script setup>
import DefaultHeader from './DefaultHeader.vue'
</script>

<style lang="less" scoped>
.layout {
    min-height: 100vh;

    .layout-header {
        background-color: #fff;
        position: sticky;
        position: -webkit-sticky;
        top: 0;
        padding: 0 1em;
        z-index: 999;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #f0f0f0;
    }

    & > main {
        display: flex;
        flex-direction: column;

        .layout-content {
            display: flex;
            flex-direction: column;
            flex-grow: 1;
            background-color: #fff;
            padding: 1em 1em;
            position: relative;
        }

        .layout-footer {
            background-color: #000000aa;
            color: #eeeeee;
            text-align: right;
        }
    }
}


</style>
