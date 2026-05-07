# SourceInterceptor Script 示例

SourceInterceptor script 用于判断输入请求是否应该触发此流程。

**返回值含义**:
- 返回 `true`: **拦截**请求,不触发后续流程
- 返回 `false`: **通过**请求,触发后续流程

## 请求方法检查

```javascript
if (method !== 'POST') {
  console.log('Only POST requests are allowed');
  return true;
}

if (!body.event_type) {
  console.log('Missing event_type');
  return true;
}

if (body.event_type === 'test') {
  console.log('Ignoring test event');
  return true;
}

return false;
```

## 请求体验证

```javascript
if (!body || typeof body !== 'object') {
  console.log('Invalid request body');
  return true;
}

if (!body.project_id) {
  console.log('Missing project_id');
  return true;
}

if (!body.user || !body.user.id) {
  console.log('Missing user information');
  return true;
}

return false;
```

## 白名单/黑名单

```javascript
const allowedSources = ['github', 'gitlab', 'bitbucket'];
if (!allowedSources.includes(body.source)) {
  console.log(`Source ${body.source} not allowed`);
  return true;
}

const blockedUsers = ['spam-user', 'test-user'];
if (blockedUsers.includes(body.user?.name)) {
  console.log(`User ${body.user.name} is blocked`);
  return true;
}

return false;
```

## 基于 header 的验证

```javascript
const apiKey = headers['x-api-key'];
if (!apiKey) {
  console.log('Missing API key');
  return true;
}

if (apiKey !== 'expected-api-key') {
  console.log('Invalid API key');
  return true;
}

return false;
```

## GitHub Webhook 示例

```javascript
if (method !== 'POST') return true;
if (!headers['x-github-event']) return true;
if (body.action === 'opened' || body.action === 'closed') return false;
return true;
```
