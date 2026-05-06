<template>
    <channel-breadcrumb>
        <a-breadcrumb-item>
            <channel-breadcrumb-item :channels="triggers" :level="2"/>
        </a-breadcrumb-item>
        <slot/>
    </channel-breadcrumb>
</template>

<script setup>
import ChannelBreadcrumb from "../ChannelBreadcrumb.vue";
import { triggers } from "../../routes/triggers.js";
import ChannelBreadcrumbItem from "../ChannelBreadcrumbItem.vue";

</script>

<style scoped>

</style>
