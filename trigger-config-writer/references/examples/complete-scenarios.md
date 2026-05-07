# 完整场景示例

本文档提供完整的配置场景示例。

## 场景 1: GitHub Webhook 转发

将 GitHub Pull Request 事件转发到内部系统。

### SourceInterceptor

```javascript
if (method !== 'POST') return true;
if (!headers['x-github-event']) return true;
if (body.action === 'opened' || body.action === 'closed') return false;
return true;
```

### Binding

```javascript
variables.REPO_NAME = body.repository?.name || '';
variables.REPO_OWNER = body.repository?.owner?.login || '';
variables.PR_NUMBER = String(body.pull_request?.number || 0);
variables.PR_TITLE = body.pull_request?.title || '';
variables.PR_URL = body.pull_request?.html_url || '';
variables.ACTION = body.action;
variables.USER = body.sender?.login || '';
variables.TIMESTAMP = dayjs().unix();
```

### TargetInterceptor

```javascript
if (variables.ACTION !== 'opened' && variables.ACTION !== 'closed') {
  return true;
}
return false;
```

---

## 场景 2: 多环境部署通知

根据部署环境发送不同的通知。

### Binding

```javascript
variables.APP_NAME = body.app_name;
variables.VERSION = body.version;
variables.ENVIRONMENT = body.environment;
variables.DEPLOYER = body.user;
variables.TIMESTAMP = dayjs().format('YYYY-MM-DD HH:mm:ss');

variables['@'] = body.environment;

if (body.environment === 'production') {
  variables.NOTIFY_CHANNEL = 'production-alerts';
  variables.PRIORITY = 'high';
} else {
  variables.NOTIFY_CHANNEL = 'dev-notifications';
  variables.PRIORITY = 'normal';
}
```

### TargetRequestsCollector

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

---

## 场景 3: 多租户路由

根据项目ID和环境动态路由到不同的 target-request。

### Binding

```javascript
variables.PROJECT_ID = body.project_id;
variables.ENVIRONMENT = body.environment || 'default';
variables.USER_ID = body.user_id;
variables.ACTION = body.action;

variables['~'] = `/${variables.PROJECT_ID}/${variables.ENVIRONMENT}`;
```

### Trigger Namespace

```javascript
namespace = variables['~'] || '';
return namespace;
```

**说明**: 
- 如果 `variables.PROJECT_ID = 'proj-123'` 且 `variables.ENVIRONMENT = 'prod'`
- 则 namespace 为 `/proj-123/prod`
- 会查找名为 `my-trigger/proj-123/prod` 的 target-request
- namespace 以 `/` 开头,且避免使用前缀重叠的名称

---

## 场景 4: 条件转发

根据请求内容决定是否转发,以及转发到哪个环境。

### SourceInterceptor

```javascript
if (!body.project_id) {
  console.log('Missing project_id');
  return true;
}

if (body.test_mode === true) {
  console.log('Test mode, skipping');
  return true;
}

return false;
```

### Binding

```javascript
variables.PROJECT_ID = body.project_id;
variables.EVENT_TYPE = body.event_type;
variables.PRIORITY = body.priority || 'normal';

if (body.priority === 'urgent') {
  variables['@'] = 'production';
  variables.NOTIFY = 'true';
} else {
  variables['@'] = 'staging';
  variables.NOTIFY = 'false';
}
```

### TargetInterceptor

```javascript
if (variables.PRIORITY === 'low' && variables['@'] === 'production') {
  console.log('Low priority requests not allowed in production');
  return true;
}

return false;
```
