# Data服务 MongoDB 集成完成

## 完成的工作

### 1. Webhook接口MongoDB持久化

修改了 `/data/src/routes/webhook.js`，为三个webhook handler添加了MongoDB数据持久化逻辑。

#### handleRequestSent
- ✅ 更新/创建 Run 记录 (upsert)
- ✅ 更新/创建 Task 记录 (upsert)
- ✅ 创建 Request 记录 (status: 'sent')
- ✅ 记录 Event 到events collection

#### handleRequestVoid
- ✅ 更新/创建 Run 记录 (upsert)
- ✅ 更新/创建 Task 记录 (upsert)
- ✅ 更新 Request 状态为 'voided'，记录action和reason
- ✅ 记录 Event 到events collection

#### handleResponseReceived
- ✅ 将response添加到Request的responses数组 ($push)
- ✅ 仅当response.kind为'decision'时，更新Request状态为'responded'
- ✅ 记录respondedAt时间（仅decision响应）

### 2. MongoDB Collections

创建了4个collection来存储不同类型的数据:

| Collection | 用途 | 主要字段 |
|-----------|------|---------|
| **requests** | HTTP请求记录 | _id, runId, taskId, taskName, status, responses[], sentAt, voidedAt, respondedAt |

### 3. 数据持久化特性

#### 幂等性
- 使用 `updateOne` + `upsert: true` 确保重复事件不会导致数据重复
- Run和Task使用upsert操作，可以安全地重复处理

#### 时间戳处理
- 将Unix timestamp转换为Date对象: `new Date(timestamp * 1000)`
- 自动添加 `createdAt` 和 `updatedAt` 字段

#### 错误处理
- 所有数据库操作都包含在try-catch块中
- 错误会被记录到日志并返回500错误响应

### 4. 文档和脚本

创建了以下文档和脚本:

- ✅ `/data/MONGODB_INDEXES.md` - MongoDB索引配置文档
- ✅ `/data/scripts/create-indexes.js` - 索引创建脚本
- ✅ 更新了 `/docs/arch/data-architecture.md` - 添加MongoDB实现说明

## 数据流程

```
Engine发送webhook
  ↓
Triggers转发
  ↓
Data接收 (webhook.js)
  ↓
解析事件数据
  ↓
MongoDB持久化
  ├─→ runs collection (upsert)
  ├─→ tasks collection (upsert)
  ├─→ requests collection (insert/update)
  └─→ events collection (insert)
  ↓
返回成功响应
```

## 使用方法

### 1. 确保MongoDB运行
```bash
mongod
```

### 2. 配置MongoDB连接
编辑 `/data/.env`:
```
MONGO_URL=mongodb://localhost
```

### 3. 创建索引（可选但推荐）
```bash
cd data
node scripts/create-indexes.js
```

### 4. 启动Data服务
```bash
cd data
npm start
```

### 5. 测试webhook
使用 `/data/http/webhook.http` 或 `/cac-configs/data-webhooks.http` 测试

## 查询数据

### 查看所有runs
```javascript
db.runs.find().pretty()
```

### 查看某个run的所有tasks
```javascript
db.tasks.find({ runId: "507f1f77bcf86cd799439011" }).pretty()
```

### 查看某个run的所有requests
```javascript
db.requests.find({ runId: "507f1f77bcf86cd799439011" }).pretty()
```

### 查看某个run的所有events
```javascript
db.events.find({ runId: "507f1f77bcf86cd799439011" }).sort({ timestamp: 1 }).pretty()
```

### 统计各状态的requests数量
```javascript
db.requests.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
])
```

## 下一步

1. **实现查询API** - 在 `/data/src/routes/runs.js` 和 `/data/src/routes/requests.js` 中实现查询接口
2. **添加分页** - 为查询API添加分页支持
3. **添加聚合统计** - 实现运行统计、成功率等聚合查询
4. **添加事件去重** - 基于eventId实现事件去重机制
5. **添加数据清理** - 实现历史数据清理策略

## 注意事项

1. **_id字段**: MongoDB使用 `_id` 作为主键，我们直接使用Engine提供的ID
2. **时间戳转换**: Engine的timestamp是Unix秒，需要乘以1000转换为毫秒
3. **对象展开**: 使用 `...run`, `...task`, `...request` 展开对象，保留所有字段
4. **索引性能**: 建议在生产环境创建索引以提高查询性能
5. **数据一致性**: 使用upsert确保数据一致性，避免重复记录
