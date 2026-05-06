import Home from "../pages/Home.vue";
import Ops from "../pages/Ops.vue";
import { channels } from "./channels.js";

export const routes = [
    {
        name: '默认页',
        path: '/',
        redirect: '/pippy-ops'
    },
    {
        name: '首页',
        path: '/pippy-ops/:path(.*)*',
        component: Home,
    },
    {
        name: 'Ops管理',
        path: '/pippy-ops/channels',
        component: Ops,
        children: channels
    },
]


