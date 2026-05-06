import TriggersHome from "../pages/triggers/TriggersHome.vue";
import CacHome from '../pages/cac/CacHome.vue'
import { triggers } from "./triggers.js";
import ObjectIdHome from "../pages/oid/ObjectIdHome.vue";
import JsonYamlHome from "../pages/conversion/JsonYaml.vue";
import { props } from "./route-props.js";
import Base64Home from "../pages/conversion/Base64.vue";

export const channels = [
    {
        name: '请求转发',
        path: 'triggers',
        component: TriggersHome,
        children: triggers,
        redirect: { name: '请求转发/监听器' },
    },

    {
        name: '配置更新',
        path: 'cac',
        component: CacHome,
    },
    {
        name: 'ObjectID解析',
        path: 'oid',
        component: ObjectIdHome,
        props,
    },
    {
        name: 'JSON-YAML转换',
        path: 'json-yaml',
        component: JsonYamlHome,
        props,
    },
    {
        name: 'Base64转换',
        path: 'base64',
        component: Base64Home,
        props,
    },

]
