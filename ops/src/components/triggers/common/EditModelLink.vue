<template>
    <drawer-opener
        :props="{title: `编辑${kindName}`, width: '800px'}"
        :component="configurer"
        :component-props="configurerProps"
        footer
        #="{open}"
    >
        <a href="#" @click.stop.prevent="onClick(open)">{{ name }}</a>
    </drawer-opener>
</template>

<script setup>
import { reactive } from "vue";
import DrawerOpener from "drawer-vue3/src/DrawerOpener.vue";

const props = defineProps({
    path: String,
    name: String,
    kindName: String,
    configurer: Object,
    getGet: Function,
})

const configurerProps = reactive({ model: null })

const onClick = async open => {
    const findOne = props.getGet(props.path)
    configurerProps.model = await findOne(props.name)
    open()
}
</script>

<style scoped lang="less">
.link {

}
</style>