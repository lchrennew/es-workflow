<template>
    <tools>
        <a-space>
            <a-input-search
                class="search"
                :default-value="id"
                placeholder="事件ID"
                @search="search"
            />
            <a-button @click="toggleEvents">启用/禁用</a-button>
        </a-space>
    </tools>
</template>

<script setup>
import Tools from "../../common/Tools.vue";
import { useRoute, useRouter } from "vue-router";
import { computed } from "vue";
import { message } from "ant-design-vue";
import { toggle } from "../../../services/triggers/events.js";

const route = useRoute()
const id = computed(() => route.query.id ?? '')

const router = useRouter()
const search = id => router.push({ query: { id } })

const toggleEvents = async () => message.success(await toggle())
</script>

<style scoped lang="less">
.search {
    display: block;
}
</style>
