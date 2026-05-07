# TargetRequestsCollector (目标请求收集器)

收集和处理所有目标请求的结果。

## YAML 结构

```yaml
kind: target-requests-collector
name: <名称>
metadata:
  title: <标题>
spec:
  script: |
    const successCount = targetRequests.filter(r => r.ok.status === 'fulfilled').length;
    const failedCount = targetRequests.length - successCount;
    console.log(`Completed: ${successCount} success, ${failedCount} failed`);
    
    if (failedCount > 0) {
      await api('https://alert.example.com', {
        body: { message: `${failedCount} requests failed` }
      });
    }
    
    return variables;
```

## 字段说明

- **kind**: 固定值 `target-requests-collector`
- **name**: 收集器名称,使用 kebab-case
- **metadata.title**: 收集器的标题描述
- **spec.script**: JavaScript 脚本,处理所有目标请求的结果

## script 详解

### 脚本格式
直接编写语句,可以是异步操作,必须 return variables

### 执行时机
所有 target-request 执行完成后 (无论成功或失败)

### 可用变量
- `listener` (string): 监听器名称
- `trigger` (string): 触发器名称
- `method` (string): HTTP 方法
- `query` (object): URL 查询参数对象
- `headers` (object): HTTP 请求头对象
- `body` (any): 请求体
- `props` (object): 属性对象
- `variables` (object): 变量对象
- `targetRequests` (array): 目标请求结果数组,每个元素包含:
  - `targetRequest` (object): target-request 对象
  - `ok` (object): Promise.allSettled 的结果对象
    - `status` (string): 'fulfilled' 或 'rejected'
    - `value` (any): 成功时的返回值
    - `reason` (any): 失败时的错误原因
- `eventID` (string): 事件 ID
- `api` (function): API 调用函数
- `dayjs` (function): dayjs 日期处理库

## 常见用法

### 统计和日志
```javascript
const fulfilled = targetRequests.filter(r => r.ok.status === 'fulfilled');
const rejected = targetRequests.filter(r => r.ok.status === 'rejected');

console.log(`Total: ${targetRequests.length}, Success: ${fulfilled.length}, Failed: ${rejected.length}`);

if (rejected.length > 0) {
  const failedNames = rejected.map(r => r.targetRequest.name);
  console.error('Failed requests:', failedNames);
}

return variables;
```

### 失败告警
```javascript
const failedCount = targetRequests.filter(r => r.ok.status === 'rejected').length;

if (failedCount > 0) {
  await api('https://alert.example.com/webhook', {
    method: 'POST',
    body: {
      trigger,
      listener,
      failedCount,
      totalCount: targetRequests.length,
      timestamp: dayjs().format()
    }
  });
}

return variables;
```

### 条件后续处理
```javascript
const allSuccess = targetRequests.every(r => r.ok.status === 'fulfilled');

if (allSuccess) {
  console.log('All requests succeeded');
  await api('https://workflow.example.com/next-step', {
    method: 'POST',
    body: {
      eventID,
      status: 'completed',
      timestamp: dayjs().format()
    }
  });
} else {
  console.log('Some requests failed, triggering retry');
  const failedRequests = targetRequests
    .filter(r => r.ok.status === 'rejected')
    .map(r => r.targetRequest.name);
  
  await api('https://workflow.example.com/retry', {
    method: 'POST',
    body: { eventID, failedRequests }
  });
}

return variables;
```
