# Data服务 MongoDB 索引配置

## 概述

为了提高查询性能,需要为MongoDB的各个collection创建合适的索引。

## Collections 和索引

### 1. runs Collection

**用途**: 存储工作流运行实例

**索引**:
```javascript
db.runs.createIndex({ _id: 1 })
db.runs.createIndex({ workflowId: 1, createdAt: -1 })
db.runs.createIndex({ status: 1, createdAt: -1 })
db.runs.createIndex({ createdAt: -1 })
```

**查询场景**:
- 按runId查询单个运行
- 按workflowId查询历史运行列表
- 按状态筛选运行
- 按时间范围查询

### 2. tasks Collection

**用途**: 存储任务实例

**索引**:
```javascript
db.tasks.createIndex({ _id: 1 })
db.tasks.createIndex({ runId: 1, createdAt: -1 })
db.tasks.createIndex({ status: 1, createdAt: -1 })
db.tasks.createIndex({ stateName: 1 })
```

**查询场景**:
- 按taskId查询单个任务
- 按runId查询某个运行的所有任务
- 按状态筛选任务
- 按stateName查询特定状态的任务

### 3. requests Collection

**用途**: 存储HTTP请求记录

**索引**:
```javascript
db.requests.createIndex({ _id: 1 })
db.requests.createIndex({ target: 1, status: 1, createdAt: -1 })
db.requests.createIndex({ target: 1, createdAt: -1 })
db.requests.createIndex({ status: 1, createdAt: -1 })
db.requests.createIndex({ runId: 1, createdAt: -1 })
db.requests.createIndex({ taskId: 1, createdAt: -1 })
db.requests.createIndex({ sentAt: -1 })
db.requests.createIndex({ taskName: 1 })
```

**查询场景**:
- 按requestId查询单个请求
- 按target和status组合查询（主要查询场景）
- 按target查询某个目标的所有请求
- 按status筛选请求
- 按runId查询某个运行的所有请求
- 按taskId查询某个任务的所有请求
- 按发送时间排序
- 按任务名称查询

### 4. events Collection

**用途**: 存储所有事件的完整记录

**索引**:
```javascript
db.events.createIndex({ runId: 1, timestamp: -1 })
db.events.createIndex({ taskId: 1, timestamp: -1 })
db.events.createIndex({ requestId: 1, timestamp: -1 })
db.events.createIndex({ eventType: 1, timestamp: -1 })
db.events.createIndex({ timestamp: -1 })
db.events.createIndex({ createdAt: -1 })
```

**查询场景**:
- 按runId查询某个运行的所有事件
- 按taskId查询某个任务的所有事件
- 按requestId查询某个请求的所有事件
- 按事件类型筛选
- 按时间范围查询事件流

## 索引创建脚本

可以使用以下脚本一次性创建所有索引:

```javascript
// runs collection
db.runs.createIndex({ workflowId: 1, createdAt: -1 })
db.runs.createIndex({ status: 1, createdAt: -1 })
db.runs.createIndex({ createdAt: -1 })

// tasks collection
db.tasks.createIndex({ runId: 1, createdAt: -1 })
db.tasks.createIndex({ status: 1, createdAt: -1 })
db.tasks.createIndex({ stateName: 1 })

// requests collection
db.requests.createIndex({ target: 1, status: 1, createdAt: -1 })
db.requests.createIndex({ target: 1, createdAt: -1 })
db.requests.createIndex({ status: 1, createdAt: -1 })
db.requests.createIndex({ runId: 1, createdAt: -1 })
db.requests.createIndex({ taskId: 1, createdAt: -1 })
db.requests.createIndex({ sentAt: -1 })
db.requests.createIndex({ taskName: 1 })

// events collection
db.events.createIndex({ runId: 1, timestamp: -1 })
db.events.createIndex({ taskId: 1, timestamp: -1 })
db.events.createIndex({ requestId: 1, timestamp: -1 })
db.events.createIndex({ eventType: 1, timestamp: -1 })
db.events.createIndex({ timestamp: -1 })
db.events.createIndex({ createdAt: -1 })
```

## 执行方式

### 方式1: MongoDB Shell
```bash
mongosh
use <database_name>
# 复制粘贴上面的索引创建脚本
```

### 方式2: 通过Node.js脚本
创建 `data/scripts/create-indexes.js`:

```javascript
import { MongoClient } from 'mongodb'

const client = new MongoClient(process.env.MONGO_URL)

async function createIndexes() {
  await client.connect()
  const db = client.db()
  
  console.log('Creating indexes for runs collection...')
  await db.collection('runs').createIndex({ workflowId: 1, createdAt: -1 })
  await db.collection('runs').createIndex({ status: 1, createdAt: -1 })
  await db.collection('runs').createIndex({ createdAt: -1 })
  
  console.log('Creating indexes for tasks collection...')
  await db.collection('tasks').createIndex({ runId: 1, createdAt: -1 })
  await db.collection('tasks').createIndex({ status: 1, createdAt: -1 })
  await db.collection('tasks').createIndex({ stateName: 1 })
  
  console.log('Creating indexes for requests collection...')
  await db.collection('requests').createIndex({ runId: 1, createdAt: -1 })
  await db.collection('requests').createIndex({ taskId: 1, createdAt: -1 })
  await db.collection('requests').createIndex({ status: 1, createdAt: -1 })
  await db.collection('requests').createIndex({ sentAt: -1 })
  
  console.log('Creating indexes for events collection...')
  await db.collection('events').createIndex({ runId: 1, timestamp: -1 })
  await db.collection('events').createIndex({ taskId: 1, timestamp: -1 })
  await db.collection('events').createIndex({ requestId: 1, timestamp: -1 })
  await db.collection('events').createIndex({ eventType: 1, timestamp: -1 })
  await db.collection('events').createIndex({ timestamp: -1 })
  await db.collection('events').createIndex({ createdAt: -1 })
  
  console.log('All indexes created successfully!')
  await client.close()
}

createIndexes().catch(console.error)
```

运行:
```bash
cd data
node scripts/create-indexes.js
```

## 性能优化建议

1. **复合索引优先**: 对于常见的组合查询,使用复合索引而不是多个单字段索引

2. **索引顺序**: 复合索引的字段顺序很重要,遵循"等值-排序-范围"原则

3. **定期维护**: 使用 `db.collection.stats()` 监控索引使用情况

4. **避免过度索引**: 索引会占用存储空间并影响写入性能,只创建必要的索引

5. **TTL索引**: 如果events数据需要定期清理,可以添加TTL索引:
   ```javascript
   db.events.createIndex({ createdAt: 1 }, { expireAfterSeconds: 2592000 })
   ```

## 验证索引

查看已创建的索引:
```javascript
db.runs.getIndexes()
db.tasks.getIndexes()
db.requests.getIndexes()
db.events.getIndexes()
```

查看索引使用情况:
```javascript
db.runs.aggregate([{ $indexStats: {} }])
```
