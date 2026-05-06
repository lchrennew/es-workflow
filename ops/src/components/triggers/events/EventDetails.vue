<template>
    <div class="event-details">
        <a-form :label-col="{span: 2}" :wrapper-col="{span: 22}">
            <a-form-item label="事件ID">
                <a-input :value="event.eventID"/>
            </a-form-item>
            <a-form-item label="事件类型">
                <a-input :value="event.type"/>
            </a-form-item>
            <a-form-item label="事件内容">
                <a-textarea auto-size :value="JSON.stringify(event.content, null, 4)"/>
            </a-form-item>
        </a-form>
    </div>
</template>

<script setup>
import { inject } from "vue";

const event = inject('event')
</script>

<style scoped lang="less">
.event-details{
    flex: 1;
    padding: 1em;
}
</style>
