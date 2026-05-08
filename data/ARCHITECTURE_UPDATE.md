# Data服务架构更新总结

## 更新时间
2026-05-08

## 更新内容

### 1. 简化数据模型
**之前**: 管理4个collection (runs, tasks, requests, events)
**现在**: 只管理1个collection (requests)

**原因**: 
- 专注于请求数据管理，保持服务职责单一
- Run和Task数据由Engine服务管理
- 减少数据冗余和同步复杂度

### 2. 更新Webhook处理逻辑

#### handleRequestSent
- ✅ 只创建Request记录
- ✅ 包含taskName字段 (task.name || task.stateName)
- ❌ 不再创建Run记录
- ❌ 不再创建Task记录
- ❌ 不再记录Event

#### handleRequestVoid
- ✅ 只更新Request状态为'voided'
- ✅ 记录action和reason
- ❌ 不再更新Run记录
- ❌ 不再更新Task记录
- ❌ 不再记录Event

#### handleResponseReceived
- ✅ 将response添加到Request的responses数组
- ✅ 仅当response.kind为'decision'时更新状态为'responded'
- ✅ 记录respondedAt时间（仅decision响应）
- ❌ 不再更新Run记录
- ❌ 不再更新Task记录
- ❌ 不再记录Event

### 3. Request数据结构

```javascript
{
  _id: String,              // requestId
  runId: String,            // 所属运行ID
  taskId: String,           // 所属任务ID
  taskName: String,         // 任务显示名称 (新增)
  url: String,
  method: String,
  headers: Object,
  body: Object,
  status: 'sent' | 'voided' | 'responded',
  responses: [{             // 响应数组 (新增，支持多个响应)
    kind: String,           // 响应类型 (decision, notification等)
    status: Number,
    statusText: String,
    headers: Object,
    body: Object,
    receivedAt: Date
  }],
  sentAt: Date,
  voidedAt: Date,           // 可选
  respondedAt: Date,        // 可选，仅当收到decision响应时设置
  action: String,           // 可选
  reason: String,           // 可选
  createdAt: Date,
  updatedAt: Date
}
```

**响应处理规则**：
- 一个request可以收到多个response
- 所有response都会被添加到responses数组
- 只有当response.kind为'decision'时，才会更新request状态为'responded'

### 4. 更新架构文档

更新了 `/docs/arch/data-architecture.md`:
- ✅ 简化架构图，只保留Request Store
- ✅ 更新数据模型，只保留Request
- ✅ 更新事件处理逻辑说明
- ✅ 更新数据同步流程图
- ✅ 简化API路由说明
- ✅ 更新索引设计
- ✅ 更新关键设计说明

### 5. MongoDB索引

简化后的索引设计:
```javascript
db.requests.createIndex({ runId: 1, createdAt: -1 })
db.requests.createIndex({ taskId: 1, createdAt: -1 })
db.requests.createIndex({ status: 1, createdAt: -1 })
db.requests.createIndex({ sentAt: -1 })
db.requests.createIndex({ taskName: 1 })
```

## 优势

### 1. 职责单一
Data服务专注于请求数据管理，不再处理Run和Task数据。

### 2. 降低复杂度
- 减少数据同步逻辑
- 减少collection数量
- 减少索引数量

### 3. 提高性能
- 更少的数据库操作
- 更简单的查询逻辑
- 更小的数据存储

### 4. 易于维护
- 代码更简洁
- 逻辑更清晰
- 测试更容易

## 查询能力

Data服务提供以下查询能力:
- 按requestId查询单个请求
- 按runId查询运行的所有请求
- 按taskId查询任务的所有请求
- 按status筛选请求
- 按taskName搜索请求
- 按时间范围查询
- 聚合统计 (按状态、按运行等)

## 下一步

1. **实现查询API** - 在 `/data/src/routes/requests.js` 中实现查询接口
2. **添加分页支持** - 实现游标分页
3. **添加聚合统计** - 实现按状态、按运行的统计
4. **创建索引** - 运行 `node scripts/create-indexes.js`
5. **测试验证** - 测试webhook接口和查询接口

## 相关文件

- `/data/src/routes/webhook.js` - Webhook处理逻辑
- `/docs/arch/data-architecture.md` - 架构文档
- `/data/MONGODB_INTEGRATION.md` - MongoDB集成文档
- `/data/MONGODB_INDEXES.md` - 索引配置文档
- `/data/scripts/create-indexes.js` - 索引创建脚本
