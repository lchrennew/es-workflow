import Antd from 'ant-design-vue';
import { createApp } from 'vue';
import App from './App.vue';
import { routes } from './routes/routes.js';
import { createMemoryHistory, createRouter, createWebHashHistory, createWebHistory } from "vue-router";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc.js'
import duration from 'dayjs/plugin/duration.js'
import relativeTime from 'dayjs/plugin/relativeTime.js'
import zhCN from 'dayjs/locale/zh-cn.js'
import weekday from 'dayjs/plugin/weekday.js'
import localData from 'dayjs/plugin/localeData.js'
import { loadSettings } from "./services/settings";


dayjs.extend(utc)
dayjs.extend(localData)
dayjs.extend(duration)
dayjs.extend(relativeTime)
dayjs.extend(weekday)
dayjs.locale(zhCN)
await loadSettings()

const historyModes = { createWebHashHistory, createWebHistory, createMemoryHistory }

const router = createRouter({
    history: createWebHistory(),
    routes,
})
const app = createApp(App).use(Antd)
    .use(router)
    .mount('#app')

// createApp(App).use(router).use(Antd).mount('#app')
