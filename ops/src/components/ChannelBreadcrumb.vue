<template>
    <common-breadcrumb>
        <a-breadcrumb-item>
            <channel-breadcrumb-item :channels="channels" :level="1"/>
        </a-breadcrumb-item>
        <slot/>
    </common-breadcrumb>
</template>

<script setup>
import CommonBreadcrumb from "./common/CommonBreadcrumb.vue";
import { channels } from "../routes/channels.js";
import ChannelBreadcrumbItem from "./ChannelBreadcrumbItem.vue";

</script>

<style scoped>

</style>
