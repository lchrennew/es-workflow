# Adaptor (数据适配器)

数据适配器,用于聚合多个数据源并返回转换后的结果。与 Trigger 不同,Adaptor 会直接返回响应数据。

## 与 Trigger 的区别

| 特性 | Trigger | Adaptor |
|------|---------|---------|
| 路由 | `/hook/:name` | `/adapt/:name` |
| 用途 | 请求转发和分发 | 数据聚合和适配 |
| 返回值 | 固定格式 `{ok, eventID}` | 自定义数据结构 |
| 数据源 | 单个 binding | 多个 adaptor-request |
| 输出 | 发送到目标系统 | 返回给调用方 |
| 缓存 | 不支持 | 支持输出缓存 |

## YAML 结构

```yaml
kind: adaptor
name: <名称>
metadata:
  title: <标题>
spec:
  sourceInterceptor: <源拦截器名称>
  adaptorRequests:
    - <adaptor-request-1>
    - <adaptor-request-2>
  transformResponse: |
    result.data = responses['adaptor-request-1'].data;
    result.meta = responses['adaptor-request-2'].meta;
    result.timestamp = Date.now();
  outputCache:
    enabled: true
    keyGetter: return `${listener}:${method}:${JSON.stringify(query)}`;
    expirationSeconds: 300
  passive: false
```

## 字段说明

- **kind**: 固定值 `adaptor`
- **name**: 适配器名称,使用 kebab-case
- **metadata.title**: 适配器的标题描述
- **spec.sourceInterceptor**: 源拦截器名称,用于判断是否执行适配
- **spec.adaptorRequests**: adaptor-request 名称数组,按顺序执行
- **spec.transformResponse**: JavaScript 脚本,转换和聚合响应数据
- **spec.outputCache**: 输出缓存配置 (可选)
  - `enabled`: 是否启用缓存
  - `keyGetter`: 生成缓存键的脚本
  - `expirationSeconds`: 缓存过期时间(秒)
- **spec.passive**: 是否被动模式,默认 false
  - `false`: 立即执行所有 adaptor-request
  - `true`: 延迟执行,在 transformResponse 中按需访问

## transformResponse 脚本详解

### 脚本格式
直接编写语句,必须对 `result` 对象赋值,最终返回 result

### 执行时机
- 非被动模式: 所有 adaptor-request 执行完成后
- 被动模式: 立即执行,可在脚本中按需访问 requests

### 可用变量
- `method` (string): HTTP 方法
- `query` (object): URL 查询参数对象
- `headers` (object): HTTP 请求头对象
- `body` (any): 请求体
- `responses` (object): 响应对象集合 (非被动模式)
  - 键: adaptor-request 名称
  - 值: 对应的响应数据
- `requests` (object): 请求对象集合 (被动模式)
  - 键: adaptor-request 名称
  - 值: PassiveRequest 对象,通过 `.response` 属性获取响应
- `redirect` (function): 重定向函数,返回 `redirect(url)` 可触发 HTTP 重定向
- `redis` (object): Redis 客户端
- `eventID` (string): 事件 ID

### 脚本示例

详细示例请参考: [Adaptor transformResponse Script 示例](../examples/adaptor-transform-response-script.md)

**快速示例 - 非被动模式**:
```javascript
result.user = responses['user-info'].data;
result.orders = responses['order-list'].items;
```

**快速示例 - 被动模式**:
```javascript
const userInfo = await requests['user-info'].response;
result.user = userInfo.data;
if (userInfo.data.isPremium) {
  const premiumData = await requests['premium-info'].response;
  result.premium = premiumData;
}
```

## outputCache 详解

### 缓存配置
```yaml
outputCache:
  enabled: true
  keyGetter: |
    return `${listener}:${method}:${JSON.stringify(query)}`;
  expirationSeconds: 300
```

### keyGetter 脚本
生成缓存键的脚本,可用变量:
- `method`, `headers`, `body`, `query`
- `listener`: 适配器名称
- `trigger`: 触发器名称 (如果有)
- `api`: HTTP 请求函数

### 缓存行为
- 命中缓存: 直接返回缓存结果,**不执行 adaptor-request 和 transformResponse**
- 未命中: 执行完整流程,并缓存 transformResponse 的返回值
- 缓存存储: 自动使用 Redis 存储,键格式为 `{adapter-cache/<adaptor-name>}:<hash>`

### 与 transformResponse 中 redis 的区别

| 特性 | outputCache | transformResponse 中的 redis |
|------|-------------|------------------------------|
| 配置位置 | spec.outputCache | 无需配置,自动传入 |
| 缓存内容 | 整个 transformResponse 的返回值 | 自定义任意数据 |
| 缓存时机 | Adaptor 自动管理 | 脚本中手动控制 |
| 缓存键 | keyGetter 脚本生成 | 脚本中自定义 |
| 使用场景 | 缓存整个 Adaptor 的输出 | 缓存中间数据或部分数据 |

## 被动模式 (passive)

### 非被动模式 (passive: false)
```yaml
spec:
  passive: false
  adaptorRequests:
    - request-1
    - request-2
  transformResponse: |
    result.data1 = responses['request-1'].data;
    result.data2 = responses['request-2'].data;
```
- 所有 adaptor-request **并行执行**
- transformResponse 中通过 `responses` 对象访问结果

### 被动模式 (passive: true)
```yaml
spec:
  passive: true
  adaptorRequests:
    - request-1
    - request-2
  transformResponse: |
    const data1 = await requests['request-1'].response;
    if (data1.needMore) {
      const data2 = await requests['request-2'].response;
      result.combined = { data1, data2 };
    } else {
      result.simple = data1;
    }
```
- adaptor-request **不会自动执行**
- transformResponse 中通过 `requests[name].response` **按需触发**
- 适用于条件加载、减少不必要的请求

## 完整示例

```yaml
kind: adaptor
name: user-dashboard-data
metadata:
  title: 用户仪表盘数据聚合
spec:
  sourceInterceptor: auth-check
  adaptorRequests:
    - user-profile
    - user-orders
    - user-notifications
  transformResponse: |
    const profile = responses['user-profile'].data;
    const orders = responses['user-orders'].items;
    const notifications = responses['user-notifications'].items;
    
    result.dashboard = {
      user: {
        id: profile.id,
        name: profile.name,
        avatar: profile.avatar
      },
      stats: {
        totalOrders: orders.length,
        unreadNotifications: notifications.filter(n => !n.read).length
      },
      recentOrders: orders.slice(0, 5),
      recentNotifications: notifications.slice(0, 10)
    };
  outputCache:
    enabled: true
    keyGetter: return `dashboard:${headers['x-user-id']}`;
    expirationSeconds: 60
  passive: false
```

## 使用场景

1. **数据聚合**: 从多个微服务聚合数据返回给前端
2. **API 网关**: 作为 BFF (Backend for Frontend) 层
3. **数据转换**: 将后端数据格式转换为前端需要的格式
4. **缓存层**: 为慢速 API 添加缓存层
5. **条件加载**: 根据条件按需加载不同数据源

## 相关配置

- [AdaptorRequest (数据请求)](adaptor-request.md) - 定义单个数据请求
- [SourceInterceptor (源拦截器)](source-interceptor.md) - 判断是否执行适配
- [Binding (绑定)](binding.md) - adaptor-request 中使用
- [Template (模板)](template.md) - adaptor-request 中使用
- [TargetSystem (目标系统)](target-system.md) - adaptor-request 中使用
