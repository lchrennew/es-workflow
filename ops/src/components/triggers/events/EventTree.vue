<template>
    <div class="event-tree">
        <a-tree
            :tree-data="treeData"
            :load-data="loadData"
            :selected-keys="[selected]"
            @select="onSelect"
        />
    </div>
    <router-view/>
</template>

<script setup>
import { computed, provide, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const props = defineProps({
    events: Object
})
const route = useRoute()
const selected = computed(() => route.params.sub)
const rootEvent = computed(() => props.events.find(({ chain }) => !chain.length))

const toNode = ({ eventID: key, type: title }) => ({ key, title })
const treeData = ref([ toNode(rootEvent.value) ])

const loadData = async node => {
    const { key } = node
    node.dataRef.children = props.events.filter(({ chain }) => chain[chain.length - 1] === key).map(toNode)
    treeData.value = [ ...treeData.value ]
}

const router = useRouter()
const onSelect = ([ sub ]) => router.push({ name: '请求转发/转发日志/事件项/详情', params: { sub } })
provide('event', computed(() => props.events.find(event => event.eventID === selected.value)))
</script>

<style scoped lang="less">
.event-tree {
    width: 400px;
    border-right: solid 1px #f0f0f0;
    display: flex;
}
</style>
