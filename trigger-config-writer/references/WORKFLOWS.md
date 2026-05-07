# 常见工作流

本文档介绍 es-triggers 的常见使用场景和配置模式。

## Workflow 1: 简单的 Webhook 转发

### 场景描述
接收外部 webhook (如 GitHub, GitLab),转发到内部 API 进行处理。

### 适用场景
- CI/CD 触发
- 代码审查通知
- Issue 跟踪
- 自动化部署

### 需要的配置

按依赖顺序:

1. **target-system** - 定义内部 API 地址
2. **template** - 定义转发请求格式
3. **binding** - 提取 webhook 数据
4. **source-interceptor** - 过滤不需要的请求
5. **target-interceptor** - 控制发送条件
6. **trigger** - 串联所有配置
7. **target-request** - 定义输出请求
8. **listener** - 定义 webhook 入口

### 配置示例

完整示例请参考: [workflow-example.yaml](../assets/workflow-example.yaml)

### 关键配置点

**Listener**:
```yaml
kind: listener
name: github-webhook
spec:
  triggers:
    - deploy-trigger
```

**Trigger**:
```yaml
kind: trigger
name: deploy-trigger
spec:
  sourceInterceptor: filter-push-events
  binding: extract-github-data
  template: deploy-api-template
  targetSystem: internal-api
```

**Binding**:
```yaml
kind: binding
name: extract-github-data
spec:
  script: |
    variables.REPO_NAME = body.repository.name;
    variables.BRANCH = body.ref.replace('refs/heads/', '');
    variables.COMMIT_SHA = body.after;
```

### 访问方式

```bash
POST /hook/github-webhook
Content-Type: application/json

{
  "repository": {"name": "my-repo"},
  "ref": "refs/heads/main",
  "after": "abc123"
}
```

---

## Workflow 2: 数据聚合和适配

### 场景描述
聚合多个微服务的数据,转换格式后返回给前端,作为 BFF (Backend for Frontend) 层。

### 适用场景
- 用户仪表盘数据聚合
- 报表数据整合
- 多数据源查询
- API 网关

### 需要的配置

按依赖顺序:

1. **target-system** - 定义各个微服务地址
2. **template** - 定义各个请求格式
3. **binding** - 提取请求参数
4. **source-interceptor** - 验证请求权限
5. **adaptor-request** - 定义各个数据请求
6. **adaptor** - 聚合数据并返回

### 配置示例

完整示例请参考: [adaptor-example.yaml](../assets/adaptor-example.yaml)

### 关键配置点

**Adaptor**:
```yaml
kind: adaptor
name: user-dashboard
spec:
  sourceInterceptor: auth-check
  adaptorRequests:
    - user-profile
    - user-orders
    - user-notifications
  transformResponse: |
    result.user = responses['user-profile'].data;
    result.orders = responses['user-orders'].items;
    result.notifications = responses['user-notifications'].items;
  outputCache:
    enabled: true
    keyGetter: return `dashboard:${query.userId}`;
    expirationSeconds: 60
```

**AdaptorRequest**:
```yaml
kind: adaptor-request
name: user-profile
spec:
  binding: extract-user-params
  template: user-profile-template
  targetSystem: user-service
```

### 访问方式

```bash
GET /adapt/user-dashboard?userId=12345
Authorization: Bearer <token>
```

### 返回示例

```json
{
  "user": {
    "id": "12345",
    "name": "张三"
  },
  "orders": [...],
  "notifications": [...]
}
```

### 与 Trigger 的对比

| 特性 | Trigger | Adaptor |
|------|---------|---------|
| 路由 | `/hook/:name` | `/adapt/:name` |
| 返回值 | `{ok, eventID}` | 自定义数据结构 |
| 用途 | 请求转发 | 数据聚合 |
| 缓存 | 不支持 | 支持输出缓存 |
| 被动模式 | 不支持 | 支持按需加载 |

---

## Workflow 3: 条件转发

### 场景描述
根据请求内容或变量条件,决定是否转发请求。

### 适用场景
- 环境过滤 (只在生产环境转发)
- 事件类型过滤 (只转发特定事件)
- 权限验证
- 开关控制

### 关键配置

**SourceInterceptor** - 输入拦截:
```yaml
kind: source-interceptor
name: filter-production-only
spec:
  script: |
    if (headers['x-environment'] !== 'production') {
      console.log('Not production, intercepted');
      return true;
    }
    return false;
```

**TargetInterceptor** - 输出拦截:
```yaml
kind: target-interceptor
name: check-feature-flag
spec:
  script: |
    const enabled = await redis.get('feature:new-api:enabled');
    if (enabled !== 'true') {
      console.log('Feature disabled, intercepted');
      return true;
    }
    return false;
```

**Binding** - 设置条件变量:
```yaml
kind: binding
name: set-conditions
spec:
  script: |
    variables.ENVIRONMENT = headers['x-environment'] || 'dev';
    variables.EVENT_TYPE = body.event_type;
    variables.IS_CRITICAL = body.priority === 'critical';
```

### 拦截器返回值

- `return true` = 拦截 (不执行)
- `return false` = 通过 (执行)

---

## Workflow 4: 一对多转发

### 场景描述
一个输入请求触发多个输出请求,发送到不同的目标系统。

### 适用场景
- 多渠道通知 (Slack + Email + 钉钉)
- 多环境部署 (同时部署到多个环境)
- 数据同步 (同步到多个系统)
- 事件广播

### 关键配置

**Trigger**:
```yaml
kind: trigger
name: multi-notification
spec:
  binding: extract-notification-data
  template: notification-template
  targetSystem: notification-service
```

**多个 TargetRequest**:
```yaml
---
kind: target-request
name: slack-notification
metadata:
  title: Slack 通知
spec:
  props:
    trigger: multi-notification
    binding: extract-notification-data
    template: slack-template
    targetSystem: slack-webhook

---
kind: target-request
name: email-notification
metadata:
  title: Email 通知
spec:
  props:
    trigger: multi-notification
    binding: extract-notification-data
    template: email-template
    targetSystem: email-service

---
kind: target-request
name: dingtalk-notification
metadata:
  title: 钉钉通知
spec:
  props:
    trigger: multi-notification
    binding: extract-notification-data
    template: dingtalk-template
    targetSystem: dingtalk-webhook
```

### 结果收集

可选的 TargetRequestsCollector:
```yaml
kind: target-requests-collector
name: notification-collector
spec:
  script: |
    const results = targetRequests.map(tr => ({
      name: tr.name,
      success: tr.response?.ok,
      error: tr.error
    }));
    
    console.log('Notification results:', results);
    
    const failedCount = results.filter(r => !r.success).length;
    if (failedCount > 0) {
      await api('https://alert.example.com/api/notify', {
        method: 'POST',
        body: { message: `${failedCount} notifications failed` }
      });
    }
```

---

## Workflow 5: 多环境配置

### 场景描述
根据环境动态选择目标系统,支持 dev, staging, production 等多个环境。

### 适用场景
- 多环境部署
- 灰度发布
- A/B 测试
- 区域路由

### 方式 1: 使用 variables['@'] 选择环境

**Binding**:
```yaml
kind: binding
name: set-environment
spec:
  script: |
    variables['@'] = headers['x-environment'] || 'default';
    variables.USER_ID = body.userId;
```

**TargetSystem**:
```yaml
kind: target-system
name: api-service
spec:
  default: https://api.dev.example.com
  staging: https://api.staging.example.com
  production: https://api.prod.example.com
```

### 方式 2: 使用 namespace 选择 target-request

**Trigger**:
```yaml
kind: trigger
name: deploy-trigger
spec:
  binding: set-environment
  namespace: |
    namespace = `/${variables['ENVIRONMENT']}`;
    return namespace;
```

**TargetRequest 文件组织**:
```
cac-configs/target-request/deploy-trigger/
├── dev.yaml       # namespace = '/dev'
├── staging.yaml   # namespace = '/staging'
└── prod.yaml      # namespace = '/prod'
```

**TargetRequest 配置**:
```yaml
# dev.yaml
kind: target-request
name: dev
spec:
  props:
    trigger: deploy-trigger
    template: deploy-template
    targetSystem: dev-cluster

# prod.yaml
kind: target-request
name: prod
spec:
  props:
    trigger: deploy-trigger
    template: deploy-template
    targetSystem: prod-cluster
```

---

## Workflow 6: 被动模式数据加载

### 场景描述
根据条件按需加载数据,避免不必要的请求,提升性能。

### 适用场景
- 条件数据加载
- 权限相关数据
- 大数据量场景
- 性能优化

### 关键配置

**Adaptor (被动模式)**:
```yaml
kind: adaptor
name: conditional-data
spec:
  passive: true
  adaptorRequests:
    - user-profile
    - basic-data
    - premium-data
  transformResponse: |
    const profile = await requests['user-profile'].response;
    
    if (!profile?.data) {
      result.error = 'User not found';
      return;
    }
    
    result.user = profile.data;
    
    const basicData = await requests['basic-data'].response;
    result.basic = basicData?.data;
    
    if (profile.data.memberLevel === 'premium') {
      const premiumData = await requests['premium-data'].response;
      result.premium = premiumData?.data;
    }
```

### 执行流程

1. transformResponse 立即执行
2. 通过 `await requests[name].response` 按需触发请求
3. 只有满足条件才会发送 premium-data 请求

---

## Workflow 7: 错误处理和重试

### 场景描述
处理请求失败,记录错误,发送告警。

### 适用场景
- 关键业务流程
- 需要告警的场景
- 错误追踪
- 日志记录

### 关键配置

**TargetRequest (错误追踪)**:
```yaml
kind: target-request
name: critical-request
spec:
  props:
    trigger: my-trigger
    template: api-template
    targetSystem: critical-service
  errorTracking:
    enabled: true
    eventName: critical-request-failed
```

**postResponseScript**:
```yaml
kind: target-request
name: monitored-request
spec:
  props:
    trigger: my-trigger
    template: api-template
    targetSystem: api-service
  postResponseScript: |
    if (response.status >= 500) {
      await api('https://alert.example.com/api/notify', {
        method: 'POST',
        body: {
          level: 'error',
          message: `API request failed: ${response.status}`,
          details: { eventID, response }
        }
      });
    }
```

**TargetRequestsCollector (统计)**:
```yaml
kind: target-requests-collector
name: error-collector
spec:
  script: |
    const failed = targetRequests.filter(tr => tr.error || tr.response?.status >= 400);
    
    if (failed.length > 0) {
      console.error('Failed requests:', failed.map(tr => ({
        name: tr.name,
        error: tr.error,
        status: tr.response?.status
      })));
      
      await redis.incr(`errors:${dayjs().format('YYYY-MM-DD')}`);
    }
```

---

## 配置生成顺序

### Trigger 流程
```
TargetSystem
    ↓
Template
    ↓
Binding
    ↓
SourceInterceptor (可选)
    ↓
TargetInterceptor (可选)
    ↓
Trigger
    ↓
TargetRequest
    ↓
Listener
    ↓
TargetRequestsCollector (可选)
```

### Adaptor 流程
```
TargetSystem
    ↓
Template
    ↓
Binding
    ↓
SourceInterceptor (可选)
    ↓
AdaptorRequest
    ↓
Adaptor
```

## 相关文档

- [配置类型参考](config-types/README.md)
- [脚本示例参考](examples/README.md)
- [完整配置示例](../assets/workflow-example.yaml)
- [Adaptor 配置示例](../assets/adaptor-example.yaml)
