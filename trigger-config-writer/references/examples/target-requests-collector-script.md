# TargetRequestsCollector Script 示例

TargetRequestsCollector script 在所有 target-request 执行完成后运行,用于统计、告警、后续处理等。

## 统计和日志

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

## 失败告警

```javascript
const successCount = targetRequests.filter(r => r.ok.status === 'fulfilled').length;
const failedCount = targetRequests.length - successCount;

console.log(`Completed: ${successCount} success, ${failedCount} failed`);

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

## 结果汇总

```javascript
const results = targetRequests.map(r => ({
  name: r.targetRequest.name,
  status: r.ok.status,
  success: r.ok.status === 'fulfilled',
  data: r.ok.status === 'fulfilled' ? r.ok.value : null,
  error: r.ok.status === 'rejected' ? r.ok.reason : null
}));

console.log('All results:', JSON.stringify(results, null, 2));

await api('https://logging.example.com/batch', {
  method: 'POST',
  body: {
    eventID,
    trigger,
    listener,
    results,
    timestamp: dayjs().format()
  }
});

return variables;
```

## 条件后续处理

```javascript
const allSuccess = targetRequests.every(r => r.ok.status === 'fulfilled');
const anyFailed = targetRequests.some(r => r.ok.status === 'rejected');

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
} else if (anyFailed) {
  console.log('Some requests failed, triggering retry');
  
  const failedRequests = targetRequests
    .filter(r => r.ok.status === 'rejected')
    .map(r => r.targetRequest.name);
  
  await api('https://workflow.example.com/retry', {
    method: 'POST',
    body: {
      eventID,
      failedRequests,
      timestamp: dayjs().format()
    }
  });
}

return variables;
```

## 多环境部署通知示例

```javascript
const allSuccess = targetRequests.every(r => r.ok.status === 'fulfilled');

if (allSuccess) {
  await api('https://slack.example.com/webhook', {
    method: 'POST',
    body: {
      channel: variables.NOTIFY_CHANNEL,
      text: `✅ ${variables.APP_NAME} v${variables.VERSION} deployed to ${variables.ENVIRONMENT} by ${variables.DEPLOYER}`,
      priority: variables.PRIORITY
    }
  });
} else {
  await api('https://slack.example.com/webhook', {
    method: 'POST',
    body: {
      channel: 'alerts',
      text: `❌ Deployment failed for ${variables.APP_NAME} v${variables.VERSION} to ${variables.ENVIRONMENT}`,
      priority: 'high'
    }
  });
}

return variables;
```
