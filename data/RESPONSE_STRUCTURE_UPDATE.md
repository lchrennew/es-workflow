# Request响应数据结构调整

## 调整时间
2026-05-08

## 调整原因

### 业务需求
1. **一个request可以有多个response** - 一个HTTP请求可能收到多次响应（如通知、进度更新、最终决策等）
2. **区分响应类型** - 需要根据response.kind来判断响应的性质
3. **条件状态更新** - 只有收到'decision'类型的响应时，才认为请求真正完成

## 数据结构变化

### 之前的结构
```javascript
{
  _id: String,
  // ... 其他字段
  status: 'sent' | 'voided' | 'responded',
  response: {              // 单个响应对象
    status: Number,
    headers: Object,
    body: Object
  },
  respondedAt: Date
}
```

**问题**：
- 只能存储一个response
- 无法区分响应类型
- 收到任何响应都会更新状态为'responded'

### 调整后的结构
```javascript
{
  _id: String,
  // ... 其他字段
  status: 'sent' | 'voided' | 'responded',
  responses: [{            // 响应数组，支持多个响应
    kind: String,          // 响应类型 (decision, notification等)
    status: Number,
    statusText: String,
    headers: Object,
    body: Object,
    receivedAt: Date       // 每个响应的接收时间
  }],
  respondedAt: Date        // 仅当收到decision响应时设置
}
```

**优势**：
- 支持存储多个response
- 每个response都有kind字段标识类型
- 每个response都有独立的receivedAt时间
- 只有decision响应才会更新request状态

## 代码变化

### handleRequestSent
```javascript
// 初始化responses为空数组
await mongo.collection('requests').insertOne({
  _id: requestId,
  ...request,
  runId,
  taskId,
  taskName: task?.name || task?.stateName || '',
  status: 'sent',
  responses: [],          // 新增：初始化空数组
  sentAt: new Date(timestamp * 1000),
  createdAt: new Date()
})
```

### handleResponseReceived
```javascript
// 使用$push添加response到数组
const updateData = {
  $push: {
    responses: {
      ...response,
      receivedAt: new Date(timestamp * 1000)
    }
  },
  $set: {
    updatedAt: new Date()
  }
}

// 只有decision响应才更新状态
if (response?.kind === 'decision') {
  updateData.$set.status = 'responded'
  updateData.$set.respondedAt = new Date(timestamp * 1000)
}

await mongo.collection('requests').updateOne(
  { _id: requestId },
  updateData
)
```

## 响应处理规则

### 1. 所有响应都会被记录
无论response.kind是什么值，都会被添加到responses数组中。

### 2. 只有decision响应会更新状态
```javascript
if (response?.kind === 'decision') {
  // 更新status为'responded'
  // 记录respondedAt时间
}
```

### 3. 响应顺序保证
responses数组按接收顺序存储，每个响应都有receivedAt时间戳。

### 4. 状态流转
```
sent → responded (仅当收到decision响应)
sent → voided (请求被作废)
```

## 查询示例

### 查询所有响应
```javascript
db.requests.findOne({ _id: requestId })
// 返回完整的request对象，包含responses数组
```

### 查询decision响应
```javascript
db.requests.aggregate([
  { $match: { _id: requestId } },
  { $project: {
    decisionResponse: {
      $filter: {
        input: "$responses",
        as: "resp",
        cond: { $eq: ["$$resp.kind", "decision"] }
      }
    }
  }}
])
```

### 统计响应数量
```javascript
db.requests.aggregate([
  { $project: {
    responseCount: { $size: "$responses" }
  }}
])
```

### 查询有多个响应的请求
```javascript
db.requests.find({
  $expr: { $gt: [{ $size: "$responses" }, 1] }
})
```

## 兼容性说明

### 向后兼容
- 旧的request记录如果有response字段，不会自动迁移
- 新的代码只操作responses数组
- 建议运行数据迁移脚本（如果需要）

### 数据迁移脚本（可选）
```javascript
// 将旧的response字段迁移到responses数组
db.requests.updateMany(
  { response: { $exists: true } },
  [{
    $set: {
      responses: [{
        $mergeObjects: [
          "$response",
          { receivedAt: "$respondedAt" }
        ]
      }]
    },
    $unset: "response"
  }]
)
```

## 相关文件

- `/data/src/routes/webhook.js` - Webhook处理逻辑
- `/docs/arch/data-architecture.md` - 架构文档
- `/data/MONGODB_INTEGRATION.md` - MongoDB集成文档
- `/data/ARCHITECTURE_UPDATE.md` - 架构更新文档

## 测试建议

1. **测试单个响应** - 发送一个decision响应，验证状态更新
2. **测试多个响应** - 发送多个不同kind的响应，验证都被记录
3. **测试非decision响应** - 发送notification响应，验证状态不变
4. **测试响应顺序** - 验证responses数组按接收顺序存储
5. **测试查询** - 验证可以正确查询和过滤responses数组
