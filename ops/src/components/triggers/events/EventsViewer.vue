<template>
    <div class="events-viewer">
        <events-list/>
    </div>
</template>

<script setup>
import { useRoute } from "vue-router";
import { computed } from "vue";
import EventsList from "./EventsList.vue";

const route = useRoute()
const id = computed(() => route.query.id)

</script>

<style scoped lang="less">
.events-viewer {
    display: flex;
    flex-direction: row;
    flex: 1;

    .event-detail {
        flex: 1;
    }
}
</style>
