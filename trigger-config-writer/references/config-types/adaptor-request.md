# AdaptorRequest (数据请求)

定义 Adaptor 中的单个数据请求。类似简化版的 Trigger,但不发送实际请求,而是将响应存入 context 供 Adaptor 使用。

## YAML 结构

```yaml
kind: adaptor-request
name: <名称>
metadata:
  title: <标题>
spec:
  binding: <绑定名称>
  template: <模板名称>
  targetSystem: <目标系统名称>
```

## 字段说明

- **kind**: 固定值 `adaptor-request`
- **name**: 数据请求名称,使用 kebab-case
- **metadata.title**: 数据请求的标题描述
- **spec.binding**: binding 配置名称,用于提取和转换变量
- **spec.template**: template 配置名称,用于构造 HTTP 请求
- **spec.targetSystem**: target-system 配置名称,定义目标地址

## 执行流程

1. **绑定变量**: 执行 binding 的 script,提取 variables
2. **构造请求**: 使用 template 和 variables 构造 HTTP 请求
3. **发送请求**: 向 targetSystem 发送请求
4. **存储响应**: 将响应存入 `context.responses[name]`

## 与 Trigger 的区别

| 特性 | Trigger | AdaptorRequest |
|------|---------|----------------|
| 独立使用 | ✅ 可以 | ❌ 必须在 Adaptor 中使用 |
| 源拦截器 | ✅ 有 | ❌ 无 (由 Adaptor 处理) |
| 目标拦截器 | ✅ 有 | ❌ 无 |
| namespace | ✅ 支持 | ❌ 不支持 |
| target-request | ✅ 支持多个 | ❌ 单个请求 |
| 响应处理 | 不返回 | 存入 responses |

## 完整示例

### 1. 用户信息请求

```yaml
kind: adaptor-request
name: user-profile
metadata:
  title: 获取用户资料
spec:
  binding: extract-user-id
  template: user-api-template
  targetSystem: user-service
```

### 2. 订单列表请求

```yaml
kind: adaptor-request
name: user-orders
metadata:
  title: 获取用户订单列表
spec:
  binding: extract-user-id-and-pagination
  template: order-list-template
  targetSystem: order-service
```

### 3. 配套的 Binding

```yaml
kind: binding
name: extract-user-id
metadata:
  title: 提取用户 ID
spec:
  script: |
    variables.USER_ID = body.userId || query.userId;
```

### 4. 配套的 Template

```yaml
kind: template
name: user-api-template
metadata:
  title: 用户 API 模板
spec:
  path: /api/users/$USER_ID$
  method: GET
  headers:
    Authorization: Bearer $TOKEN$
```

### 5. 配套的 TargetSystem

```yaml
kind: target-system
name: user-service
metadata:
  title: 用户服务
spec:
  default: https://user-api.example.com
  production: https://user-api.prod.example.com
```

### 6. 在 Adaptor 中使用

```yaml
kind: adaptor
name: user-dashboard
metadata:
  title: 用户仪表盘数据
spec:
  sourceInterceptor: auth-check
  adaptorRequests:
    - user-profile
    - user-orders
  transformResponse: |
    result.user = responses['user-profile'].data;
    result.orders = responses['user-orders'].items;
```

## 响应数据访问

在 Adaptor 的 transformResponse 脚本中访问响应:

### 非被动模式
```javascript
const userProfile = responses['user-profile'];
const userOrders = responses['user-orders'];

result.dashboard = {
  user: userProfile.data,
  orders: userOrders.items
};
```

### 被动模式
```javascript
const userProfile = await requests['user-profile'].response;

if (userProfile.data.isPremium) {
  const premiumOrders = await requests['premium-orders'].response;
  result.orders = premiumOrders.items;
} else {
  const basicOrders = await requests['basic-orders'].response;
  result.orders = basicOrders.items;
}
```

## 错误处理

AdaptorRequest 执行失败时:
- 记录 `adaptor-request-internal-error` 事件
- 不会中断 Adaptor 执行
- `responses[name]` 为 undefined
- 在 transformResponse 中需要检查响应是否存在

```javascript
const userProfile = responses['user-profile'];
if (!userProfile) {
  result.error = 'Failed to fetch user profile';
  return;
}

result.user = userProfile.data;
```

## 使用场景

1. **微服务聚合**: 从多个微服务获取数据并聚合
2. **数据关联**: 先获取主数据,再根据主数据获取关联数据
3. **并行请求**: 同时请求多个独立的数据源
4. **条件请求**: 根据条件决定请求哪些数据源 (被动模式)

## 相关配置

- [Adaptor (数据适配器)](adaptor.md) - 使用 adaptor-request 的容器
- [Binding (绑定)](binding.md) - 提取变量
- [Template (模板)](template.md) - 构造请求
- [TargetSystem (目标系统)](target-system.md) - 定义目标地址
