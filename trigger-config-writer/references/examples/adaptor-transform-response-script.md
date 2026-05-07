# Adaptor transformResponse Script 示例

transformResponse 脚本用于转换和聚合 adaptor-request 的响应数据。

## 脚本格式

直接编写语句,必须对 `result` 对象赋值,最终返回 result

## 执行时机

- **非被动模式**: 所有 adaptor-request 执行完成后
- **被动模式**: 立即执行,可在脚本中按需访问 requests

## 可用变量

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

## 示例 1: 非被动模式 - 聚合多个数据源

```javascript
result.user = responses['user-info'].data;
result.orders = responses['order-list'].items;
result.summary = {
  totalOrders: responses['order-list'].total,
  userName: responses['user-info'].data.name
};
```

## 示例 2: 被动模式 - 按需加载

```javascript
const userInfo = await requests['user-info'].response;
result.user = userInfo.data;

if (userInfo.data.isPremium) {
  const premiumData = await requests['premium-info'].response;
  result.premium = premiumData;
}
```

## 示例 3: 错误处理

```javascript
const userProfile = responses['user-profile'];
if (!userProfile || !userProfile.data) {
  result.error = 'Failed to fetch user profile';
  result.code = 'USER_PROFILE_ERROR';
  return;
}

result.user = userProfile.data;
result.orders = responses['user-orders']?.items || [];
```

## 示例 4: 数据转换和过滤

```javascript
const orders = responses['order-list'].items || [];
const notifications = responses['notification-list'].items || [];

result.dashboard = {
  recentOrders: orders
    .filter(order => order.status === 'active')
    .slice(0, 5)
    .map(order => ({
      id: order.id,
      title: order.title,
      amount: order.amount,
      createdAt: order.createdAt
    })),
  unreadNotifications: notifications
    .filter(n => !n.read)
    .length
};
```

## 示例 5: 使用 Redis 自定义缓存

```javascript
const cacheKey = `custom:user:${body.userId}`;
const cached = await redis.get(cacheKey);

if (cached) {
  result.fromCache = true;
  result.data = JSON.parse(cached);
} else {
  result.data = responses['user-info'].data;
  await redis.set(cacheKey, JSON.stringify(result.data), 'EX', 3600);
}
```

**注意**: 这是在 transformResponse 中自定义的缓存逻辑,与 outputCache 配置不同。

## 示例 6: 重定向

```javascript
if (responses['auth-check']?.status === 401) {
  return redirect('https://login.example.com');
}

result.data = responses['protected-resource'].data;
```

## 示例 7: 条件聚合

```javascript
const profile = responses['user-profile'].data;

result.user = {
  id: profile.id,
  name: profile.name,
  email: profile.email
};

if (profile.memberLevel === 'premium') {
  result.premiumFeatures = responses['premium-features'].data;
  result.premiumStats = responses['premium-stats'].data;
} else {
  result.basicFeatures = responses['basic-features'].data;
}
```

## 示例 8: 被动模式 - 串行请求

```javascript
const userInfo = await requests['user-info'].response;

if (!userInfo?.data) {
  result.error = 'User not found';
  return;
}

result.user = userInfo.data;

const ordersResponse = await requests['user-orders'].response;
result.orders = ordersResponse?.items || [];

if (result.orders.length > 0) {
  const detailsResponse = await requests['order-details'].response;
  result.orderDetails = detailsResponse?.data;
}
```

## 示例 9: 使用 api() 函数发送额外请求

```javascript
result.user = responses['user-info'].data;
result.orders = responses['order-list'].items;

if (result.orders.length > 10) {
  await api('https://alert.example.com/api/notify', {
    method: 'POST',
    body: {
      userId: result.user.id,
      message: `User has ${result.orders.length} orders`
    }
  });
}
```

## 示例 10: 复杂数据聚合

```javascript
const profile = responses['user-profile'].data;
const orders = responses['user-orders'].items || [];
const notifications = responses['user-notifications'].items || [];
const preferences = responses['user-preferences'].data || {};

result.dashboard = {
  user: {
    id: profile.id,
    name: profile.name,
    avatar: profile.avatar,
    memberLevel: profile.memberLevel
  },
  stats: {
    totalOrders: orders.length,
    activeOrders: orders.filter(o => o.status === 'active').length,
    completedOrders: orders.filter(o => o.status === 'completed').length,
    unreadNotifications: notifications.filter(n => !n.read).length
  },
  recentActivity: [
    ...orders.slice(0, 3).map(o => ({
      type: 'order',
      id: o.id,
      title: o.title,
      time: o.createdAt
    })),
    ...notifications.slice(0, 3).map(n => ({
      type: 'notification',
      id: n.id,
      title: n.title,
      time: n.createdAt
    }))
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5),
  preferences: preferences,
  timestamp: Date.now()
};
```

## 最佳实践

1. **错误处理**: 始终检查响应是否存在
2. **数据验证**: 验证必要的字段是否存在
3. **性能考虑**: 被动模式适合条件加载,非被动模式适合并行请求
4. **缓存策略**: 根据数据更新频率选择合适的缓存方式
5. **数据脱敏**: 过滤敏感信息
6. **日志记录**: 使用 console.log 记录关键信息便于调试

## 相关文档

- [Adaptor 配置](../config-types/adaptor.md)
- [AdaptorRequest 配置](../config-types/adaptor-request.md)
- [Binding Script 示例](binding-script.md)
