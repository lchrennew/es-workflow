# Data服务查询API更新

## 更新概述

为 Data 服务的 requests 路由添加了根据 `target` 和 `status` 查询请求的接口。

## 更新内容

### 1. 新增查询接口

**路由**: `GET /requests/query`

**功能**: 根据 target 和 status 查询请求列表，支持分页

**查询参数**:
- `target` (可选): 请求目标，例如 "user1"
- `status` (可选): 请求状态，值为 "sent"、"voided" 或 "responded"
- `page` (可选): 页码，默认为 1
- `pageSize` (可选): 每页数量，默认为 20

**响应格式**:
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "_id": "507f191e810c19729de860eb",
        "runId": "507f1f77bcf86cd799439011",
        "taskId": "507f191e810c19729de860ea",
        "taskName": "审核",
        "target": "user1",
        "status": "sent",
        "responses": [],
        "sentAt": "2024-01-01T00:00:00.000Z",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

### 2. 查询示例

```http
# 查询所有请求
GET http://localhost:4244/requests/query

# 按 target 查询
GET http://localhost:4244/requests/query?target=user1

# 按 status 查询
GET http://localhost:4244/requests/query?status=sent

# 组合查询
GET http://localhost:4244/requests/query?target=user1&status=sent

# 分页查询
GET http://localhost:4244/requests/query?target=user1&status=sent&page=1&pageSize=10
```

### 3. 索引优化

为了支持高效的 target 和 status 查询，添加了以下索引：

```javascript
db.requests.createIndex({ target: 1, status: 1, createdAt: -1 })
db.requests.createIndex({ target: 1, createdAt: -1 })
db.requests.createIndex({ status: 1, createdAt: -1 })
```

**索引说明**:
- `{ target: 1, status: 1, createdAt: -1 }`: 支持 target+status 组合查询，并按创建时间倒序排序
- `{ target: 1, createdAt: -1 }`: 支持仅按 target 查询
- `{ status: 1, createdAt: -1 }`: 支持仅按 status 查询

## 修改的文件

### 1. 代码文件
- `/data/src/routes/requests.js`: 添加 `queryRequests` 方法实现查询接口

### 2. 测试文件
- `/data/http/requests.http`: 新增 HTTP 测试文件，包含各种查询场景的测试用例

### 3. 索引文件
- `/data/scripts/create-indexes.js`: 更新索引创建脚本，添加 target 相关索引

### 4. 文档文件
- `/docs/arch/data-architecture.md`: 更新架构文档，添加查询接口说明
- `/data/MONGODB_INDEXES.md`: 更新索引文档，添加 target 索引说明

## 使用场景

### 场景1: 查询某个用户的待处理请求
```http
GET /requests/query?target=user1&status=sent
```

### 场景2: 查询某个用户的所有请求历史
```http
GET /requests/query?target=user1
```

### 场景3: 查询所有已响应的请求
```http
GET /requests/query?status=responded
```

### 场景4: 查询所有被作废的请求
```http
GET /requests/query?status=voided
```

## 性能考虑

1. **复合索引优先**: `{ target: 1, status: 1, createdAt: -1 }` 索引可以同时支持：
   - target + status 查询
   - 仅 target 查询（索引前缀）
   - 按 createdAt 排序

2. **分页查询**: 使用 `skip` 和 `limit` 实现分页，避免一次性加载大量数据

3. **查询优化**: MongoDB 会根据查询条件自动选择最优索引

## 后续优化建议

1. **缓存**: 对于高频查询，可以考虑添加 Redis 缓存
2. **聚合查询**: 可以添加统计接口，如按 target 统计请求数量
3. **全文搜索**: 如果需要按任务名称搜索，可以考虑添加文本索引
4. **时间范围查询**: 可以添加按时间范围筛选的功能

## 测试建议

1. 使用 `/data/http/requests.http` 文件测试各种查询场景
2. 测试分页功能，确保 pagination 信息正确
3. 测试空结果场景
4. 测试参数缺失场景
5. 性能测试：在大数据量下测试查询性能
