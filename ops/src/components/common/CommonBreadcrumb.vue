<template>
    <teleport to=".layout-breadcrumb">
        <a-breadcrumb>
            <a-breadcrumb-item>
                <router-link :to="{name:'首页'}">OPS首页</router-link>
            </a-breadcrumb-item>
            <slot/>
        </a-breadcrumb>
    </teleport>
</template>

<style scoped>

</style>
