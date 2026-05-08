# Data Webhook 转发配置

## 概述

本配置实现了将Engine的request.sent、request.void、response.received三个webhook事件通过Triggers服务转发到Data服务。采用**多路分发**机制，在现有的listener上增加新的trigger，实现一个事件同时转发到多个目标。

## 架构

```
Engine (3000) 
  ↓ webhook
Triggers (4243) - listener接收事件
  ↓ 多路分发
  ├─→ Engine (3000) - 原有的engine-*-trigger
  └─→ Data (4244) - 新增的data-*-trigger
```

## 多路分发机制

每个listener配置了多个trigger，实现事件的多路分发：

### engine-request-sent-listener
```yaml
triggers:
  - engine-request-sent-trigger    # 转发回Engine
  - data-request-sent-trigger      # 转发到Data
```

### engine-request-void-listener
```yaml
triggers:
  - engine-request-void-trigger    # 转发回Engine
  - data-request-void-trigger      # 转发到Data
```

### engine-response-received-listener
```yaml
triggers:
  - engine-response-received-trigger    # 转发回Engine
  - data-response-received-trigger      # 转发到Data
```

## 配置文件

### 1. Triggers配置（独立文件）

按照es-triggers的规范，配置文件按类型分目录存储在 `cac-configs/{kind}/{name}.yaml`：

**新增的配置文件**：
- `target-system/data-webhook-api.yaml` - Data服务的目标系统地址
- `binding/data-webhook-binding.yaml` - 数据绑定脚本
- `template/data-request-sent-template.yaml` - request.sent事件模板
- `template/data-request-void-template.yaml` - request.void事件模板
- `template/data-response-received-template.yaml` - response.received事件模板
- `trigger/data-request-sent-trigger.yaml` - request.sent触发器
- `trigger/data-request-void-trigger.yaml` - request.void触发器
- `trigger/data-response-received-trigger.yaml` - response.received触发器
- `target-request/data-request-sent.yaml` - request.sent目标请求
- `target-request/data-request-void.yaml` - request.void目标请求
- `target-request/data-response-received.yaml` - response.received目标请求

**修改的配置文件**：
- `listener/engine-request-sent-listener.yaml` - 添加 `data-request-sent-trigger`
- `listener/engine-request-void-listener.yaml` - 添加 `data-request-void-trigger`
- `listener/engine-response-received-listener.yaml` - 添加 `data-response-received-trigger`

### 2. Engine配置
- **文件**: `/engine/.env.local`
- **保持不变**:
  ```
  WEBHOOK_REQUEST_SENT=http://localhost:4243/hook/engine-request-sent-listener
  WEBHOOK_REQUEST_VOID=http://localhost:4243/hook/engine-request-void-listener
  WEBHOOK_RESPONSE_RECEIVED=http://localhost:4243/hook/engine-response-received-listener
  ```

### 3. Data服务
- **文件**: `/data/src/routes/webhook.js`
- **端点**:
  - POST /webhook/request-sent
  - POST /webhook/request-void
  - POST /webhook/response-received

## 测试步骤

### 前置条件
1. 启动CAC服务: `cd cac && npm start` (端口4242)
2. 启动Triggers服务: `cd triggers && npm start` (端口4243)
3. 启动Data服务: `cd data && npm start` (端口4244)
4. 启动Engine服务: `cd engine && npm start` (端口3000)

### 测试方法1: 通过Triggers转发（推荐）
使用 `/cac-configs/data-webhooks.http` 文件测试:

```http
POST http://localhost:4243/hook/engine-request-sent-listener
Content-Type: application/json
X-Webhook-Event: request.sent

{
  "runId": "507f1f77bcf86cd799439011",
  "taskId": "507f191e810c19729de860ea",
  "requestId": "507f191e810c19729de860eb",
  "run": { ... },
  "task": { ... },
  "request": { ... }
}
```

**预期结果**:
- Triggers会同时触发两个trigger
- Engine会收到一个转发请求（engine-request-sent-trigger）
- Data会收到一个转发请求（data-request-sent-trigger）
- 控制台会输出两条日志

### 测试方法2: 直接测试Data端点
使用 `/data/http/webhook.http` 文件测试:

```http
POST http://localhost:4244/webhook/request-sent
Content-Type: application/json

{
  "eventType": "request.sent",
  "runId": "507f1f77bcf86cd799439011",
  ...
}
```

### 测试方法3: 通过Engine触发
触发一个实际的工作流运行，Engine会自动发送webhook事件到Triggers，Triggers再转发到Data。

## 事件数据格式

### request.sent
```json
{
  "eventType": "request.sent",
  "runId": "string",
  "taskId": "string",
  "requestId": "string",
  "workflowId": "string",
  "timestamp": 1234567890,
  "run": { ... },
  "task": { ... },
  "request": { ... }
}
```

### request.void
```json
{
  "eventType": "request.void",
  "runId": "string",
  "taskId": "string",
  "requestId": "string",
  "workflowId": "string",
  "action": "cancel|retry|skip",
  "reason": "string",
  "timestamp": 1234567890,
  "run": { ... },
  "task": { ... },
  "request": { ... }
}
```

### response.received
```json
{
  "eventType": "response.received",
  "runId": "string",
  "taskId": "string",
  "requestId": "string",
  "workflowId": "string",
  "timestamp": 1234567890,
  "run": { ... },
  "task": { ... },
  "request": { ... },
  "response": { ... }
}
```

## 日志查看

### Triggers日志
Triggers会在控制台输出转发日志:
```
request.sent forwarded to Data service: 200
```

### Data日志
Data服务会在控制台输出接收日志:
```
Received request.sent event: runId=xxx, taskId=xxx, requestId=xxx
```

## 故障排查

### 1. Triggers无法转发
- 检查CAC服务是否运行 (4242端口)
- 检查 `/cac-configs/data-webhooks.yaml` 是否被CAC加载
- 查看Triggers日志是否有错误

### 2. Data无法接收
- 检查Data服务是否运行 (4244端口)
- 检查 `/data/src/routes/webhook.js` 路由是否正确
- 查看Data日志是否有错误

### 3. Engine无法发送
- 检查 `/engine/.env.local` 配置是否正确
- 检查Engine是否能连接到Triggers (4243端口)
- 查看Engine日志是否有webhook发送错误

## 下一步

1. 实现Data服务的数据持久化逻辑
2. 添加数据模型 (Run/Task/Request)
3. 实现查询API
4. 添加事件去重和顺序保证机制
