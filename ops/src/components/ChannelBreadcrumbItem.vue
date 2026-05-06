<template>
    <a-dropdown>
        <router-link :to="{name: channelRouteName}">
            {{ getChannelName(route) }}
            <down-outlined/>
        </router-link>
        <template #overlay>
            <a-menu>
                <a-menu-item v-for="channel in channels" :key="channel.name">
                    <router-link :to="{name: channel.name}">{{ getChannelName(channel) }} ({{channel.path}})</router-link>
                </a-menu-item>
            </a-menu>
        </template>
    </a-dropdown>
</template>

<script setup>
import { useRoute } from "vue-router";
import { DownOutlined } from "@ant-design/icons-vue";
import { computed } from "vue";

const props = defineProps({
    channels: Object,
    level: { type: Number, default: 1 }
})

const route = useRoute()

const channelRouteName = computed(() => route.name.split('/', props.level).join('/'))

const getChannelName = channel => channel.name.split('/')[props.level - 1]

</script>


<style scoped>

</style>
