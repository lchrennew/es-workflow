<template>
    <a-config-provider :locale="zhCN">
        <drawer-provider>
            <default-layout/>
        </drawer-provider>
    </a-config-provider>
</template>
<script setup>
import DefaultLayout from './layout/DefaultLayout.vue';
import DrawerProvider from 'drawer-vue3/src/DrawerProvider.vue';
import zhCN from 'ant-design-vue/es/locale/zh_CN';

import { message } from "ant-design-vue";

message.config({ prefixCls: 'pippy-ops' })
</script>

<style></style>
