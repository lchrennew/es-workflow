# Data Webhook 配置清单

## 配置文件结构

按照es-triggers规范，所有配置文件按类型分目录存储：`cac-configs/{kind}/{name}.yaml`

## 新增配置文件

### Target System (1个)
- ✅ `target-system/data-webhook-api.yaml`
  - 定义Data服务的webhook端点地址
  - 支持多环境：default, development, staging, production

### Binding (1个)
- ✅ `binding/data-webhook-binding.yaml`
  - 从webhook事件中提取数据到variables
  - 提取字段：EVENT_TYPE, RUN_ID, TASK_ID, REQUEST_ID, WORKFLOW_ID, ACTION, REASON, TIMESTAMP
  - 序列化对象：RUN, TASK, REQUEST, RESPONSE

### Template (3个)
- ✅ `template/data-request-sent-template.yaml`
  - 定义request.sent事件的转发格式
  - 路径：POST /request-sent
  
- ✅ `template/data-request-void-template.yaml`
  - 定义request.void事件的转发格式
  - 路径：POST /request-void
  - 额外字段：action, reason
  
- ✅ `template/data-response-received-template.yaml`
  - 定义response.received事件的转发格式
  - 路径：POST /response-received
  - 额外字段：response

### Trigger (3个)
- ✅ `trigger/data-request-sent-trigger.yaml`
  - 关联：engine-webhook-filter + never-intercept + data-webhook-binding + data-request-sent-template + data-webhook-api
  
- ✅ `trigger/data-request-void-trigger.yaml`
  - 关联：engine-webhook-filter + never-intercept + data-webhook-binding + data-request-void-template + data-webhook-api
  
- ✅ `trigger/data-response-received-trigger.yaml`
  - 关联：engine-webhook-filter + never-intercept + data-webhook-binding + data-response-received-template + data-webhook-api

### Target Request (3个)
- ✅ `target-request/data-request-sent.yaml`
  - 执行request.sent事件的转发
  - 包含错误追踪和日志记录
  
- ✅ `target-request/data-request-void.yaml`
  - 执行request.void事件的转发
  - 包含错误追踪和日志记录
  
- ✅ `target-request/data-response-received.yaml`
  - 执行response.received事件的转发
  - 包含错误追踪和日志记录

## 修改的配置文件

### Listener (3个)
- ✅ `listener/engine-request-sent-listener.yaml`
  - 添加trigger：data-request-sent-trigger
  - 现在触发2个trigger：engine-request-sent-trigger + data-request-sent-trigger
  
- ✅ `listener/engine-request-void-listener.yaml`
  - 添加trigger：data-request-void-trigger
  - 现在触发2个trigger：engine-request-void-trigger + data-request-void-trigger
  
- ✅ `listener/engine-response-received-listener.yaml`
  - 添加trigger：data-response-received-trigger
  - 现在触发2个trigger：engine-response-received-trigger + data-response-received-trigger

## 配置依赖关系

```
listener (修改)
  ├─→ engine-*-trigger (已存在)
  │     └─→ engine-webhook-api
  └─→ data-*-trigger (新增)
        ├─→ source-interceptor: engine-webhook-filter (复用)
        ├─→ target-interceptor: never-intercept (复用)
        ├─→ binding: data-webhook-binding (新增)
        ├─→ template: data-*-template (新增)
        └─→ target-system: data-webhook-api (新增)
```

## 配置加载顺序

CAC服务会按以下顺序加载配置：

1. **target-system** - 目标系统地址
2. **source-interceptor** - 源拦截器（复用已有）
3. **target-interceptor** - 目标拦截器（复用已有）
4. **binding** - 数据绑定
5. **template** - 请求模板
6. **trigger** - 触发器
7. **target-request** - 目标请求
8. **listener** - 监听器

## 验证清单

- [x] 所有配置文件都按 `{kind}/{name}.yaml` 结构创建
- [x] 配置名称使用 kebab-case
- [x] variables 字段名使用 UPPER_SNAKE_CASE
- [x] 所有引用的配置都存在（engine-webhook-filter, never-intercept）
- [x] listener的triggers数组包含新增的data-*-trigger
- [x] 每个trigger都有对应的target-request
- [x] 所有template都指向正确的Data服务端点

## 测试步骤

1. 启动CAC服务，确认配置加载成功
2. 启动Triggers服务，确认listener注册成功
3. 启动Data服务，确认webhook端点可用
4. 使用 `data-webhooks.http` 测试转发功能
5. 检查日志确认多路分发正常工作

## 相关文档

- [DATA_WEBHOOKS_README.md](DATA_WEBHOOKS_README.md) - 详细使用说明
- [data-webhooks.http](data-webhooks.http) - HTTP测试文件
