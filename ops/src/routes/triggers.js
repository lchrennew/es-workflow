import Listeners from "../pages/triggers/Listeners.vue";
import TargetSystems from "../pages/triggers/TargetSystems.vue";
import Triggers from "../pages/triggers/Triggers.vue";
import SourceInterceptors from "../pages/triggers/SourceInterceptors.vue";
import Bindings from "../pages/triggers/Bindings.vue";
import TargetInterceptors from "../pages/triggers/TargetInterceptors.vue";
import Templates from "../pages/triggers/Templates.vue";
import TargetRequests from "../pages/triggers/TargetRequests.vue";
import Events from "../pages/triggers/Events.vue";
import Event from "../pages/triggers/Event.vue";
import Adaptors from "../pages/triggers/Adaptors.vue";
import DomainEvent from "../pages/triggers/DomainEvent.vue";
import AdaptorRequests from "../pages/triggers/AdaptorRequests.vue";
import TargetRequestsCollectors from "../pages/triggers/TargetRequestsCollectors.vue";

export const triggers = [
    {
        name: '请求转发/数据适配',
        path: 'adaptors',
        component: Adaptors
    },
    {
        name: '请求转发/数据请求',
        path: 'adaptor-requests',
        component: AdaptorRequests
    },
    {
        name: '请求转发/数据绑定',
        path: 'bindings',
        component: Bindings
    },
    {
        name: '请求转发/监听器',
        path: 'listeners',
        component: Listeners
    },
    {
        name: '请求转发/输入拦截',
        path: 'source-interceptors',
        component: SourceInterceptors
    },
    {
        name: '请求转发/输出拦截',
        path: 'target-interceptors',
        component: TargetInterceptors
    },
    {
        name: '请求转发/输出请求',
        path: 'target-requests',
        component: TargetRequests
    },
    {
        name: '请求转发/输出请求收集器',
        path: 'target-requests-collectors',
        component: TargetRequestsCollectors
    },
    {
        name: '请求转发/目标系统',
        path: 'target-systems',
        component: TargetSystems
    },
    {
        name: '请求转发/输出模板',
        path: 'templates',
        component: Templates
    },
    {
        name: '请求转发/转发规则',
        path: 'triggers',
        component: Triggers
    },
    {
        name: '请求转发/转发日志',
        path: 'events',
        component: Events,
        children: [
            {
                name: '请求转发/转发日志/事件项',
                path: ':id',
                component: Event,
                props: route => ({ id: route.params.id }),
                children: [
                    {
                        name: '请求转发/转发日志/事件项/详情',
                        path: ':sub',
                        component: DomainEvent,
                        props: route => ({ sub: route.params.sub })
                    }
                ]
            }
        ]
    }
];
