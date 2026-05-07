# SourceInterceptor (源拦截器)

判断输入请求是否应该触发此流程。

## YAML 结构

```yaml
kind: source-interceptor
name: <名称>
metadata:
  title: <标题>
spec:
  script: |
    if (method !== 'POST') return true;
    if (body.type !== 'webhook') return true;
    return false;
```

## 字段说明

- **kind**: 固定值 `source-interceptor`
- **name**: 源拦截器名称,使用 kebab-case
- **metadata.title**: 源拦截器的标题描述
- **spec.script**: JavaScript 脚本,判断是否拦截输入请求

## script 详解

### 脚本格式
必须 return 一个布尔值或 truthy/falsy 值

### 返回值含义
- 返回 `true` 或 truthy 值: **拦截**请求,不触发后续流程
- 返回 `false` 或 falsy 值: **通过**请求,触发后续流程

### 执行时机
在 trigger 执行的最开始

### 可用变量
- `method` (string): HTTP 方法
- `headers` (object): HTTP 请求头对象
- `body` (any): 请求体
- `query` (object): URL 查询参数对象
- `listener` (string): 监听器名称
- `trigger` (string): 触发器名称
- `api` (function): API 调用函数

## 常见用法

### 请求方法检查
```javascript
if (method !== 'POST') {
  console.log('Only POST requests are allowed');
  return true;
}
return false;
```

### 请求体验证
```javascript
if (!body || typeof body !== 'object') {
  console.log('Invalid request body');
  return true;
}
if (!body.project_id) {
  console.log('Missing project_id');
  return true;
}
return false;
```

### 白名单/黑名单
```javascript
const allowedSources = ['github', 'gitlab', 'bitbucket'];
if (!allowedSources.includes(body.source)) {
  console.log(`Source ${body.source} not allowed`);
  return true;
}
return false;
```

### 基于 header 的验证
```javascript
const apiKey = headers['x-api-key'];
if (!apiKey || apiKey !== 'expected-api-key') {
  console.log('Invalid API key');
  return true;
}
return false;
```
