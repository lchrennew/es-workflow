<template>
    <a-typography-paragraph ref="render" class="markdown-renderer" />
</template>
<script>
import { marked } from "marked";
</script>
<script setup>
import { onMounted, ref, watchEffect } from "vue";
import { invokeApi } from "../../../utils/api.js";

const props = defineProps({
    md: { type: String, default: '' },
})

const render = ref(null)
onMounted(() => {
    watchEffect(async () => {
        render.value.innerHTML = await marked(props.md)
        render.value.querySelectorAll('a.download').forEach(a => a.addEventListener('click', event => {
            event.preventDefault()
            event.stopPropagation()
            event.stopImmediatePropagation()
            download(a.href, a.download)
        }))
    })
})

const download = async (downloadUrl, filename) => {
    const response = await invokeApi(downloadUrl)
    const url = URL.createObjectURL(await response.blob())
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    anchor.click()
    URL.revokeObjectURL(url)
}
</script>

<style lang="less">
.markdown-renderer {
    flex: 1;

    &.pippy-typography, &.pippy-typography > p:last-child {
        margin-bottom: 0;
    }

    .md-heading {
        position: relative;
        margin-left: -24px;
        padding-left: 24px;

        & > .md-heading-anchor {
            display: inline-block;
            position: absolute;
            opacity: 0;
            left: 0;
            width: 24px;
        }

        &:hover > .md-heading-anchor {
            opacity: 0.4;
        }
    }

    table {
        width: 100%;
        max-width: 100%;
        margin-bottom: 20px;
        background-color: transparent;
        border-spacing: 0;
        border-collapse: collapse;

        & > caption + thead > tr:first-child > th, & > colgroup + thead > tr:first-child > th, & > thead:first-child > tr:first-child > th, & > caption + thead > tr:first-child > td, & > colgroup + thead > tr:first-child > td, & > thead:first-child > tr:first-child > td {
            border-top: 0;
        }

        & > thead > tr > th {
            vertical-align: bottom;
            border-bottom: 2px solid #ddd;

            &[align="right"] {
                text-align: right;
            }
        }

        & > tbody > tr:nth-child(odd) > td, & > tbody > tr:nth-child(odd) > th {
            background-color: #f9f9f9;
        }

        & > thead > tr > th, & > tbody > tr > th, & > tfoot > tr > th, & > thead > tr > td, & > tbody > tr > td, & > tfoot > tr > td {
            padding: 8px;
            line-height: 1.42857143;
            vertical-align: top;
            border-top: 1px solid #ddd;
        }
    }
}
</style>