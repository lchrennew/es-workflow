# TargetInterceptor (目标拦截器)

判断输出请求是否应该发送。

## YAML 结构

```yaml
kind: target-interceptor
name: <名称>
metadata:
  title: <标题>
spec:
  script: |
    if (!variables.ENABLED) return true;
    if (variables.SKIP_SEND) return true;
    return false;
```

## 字段说明

- **kind**: 固定值 `target-interceptor`
- **name**: 目标拦截器名称,使用 kebab-case
- **metadata.title**: 目标拦截器的标题描述
- **spec.script**: JavaScript 脚本,判断是否拦截输出请求

## script 详解

### 脚本格式
必须 return 一个布尔值或 truthy/falsy 值

### 返回值含义
- 返回 `true` 或 truthy 值: **拦截**请求,不发送到目标系统
- 返回 `false` 或 falsy 值: **通过**请求,发送到目标系统

### 执行时机
在每个 target-request 准备发送前

### 可用变量
- `listener` (string): 监听器名称
- `trigger` (string): 触发器名称
- `props` (object): target-request 的 props 属性
- `variables` (object): 从 binding 传递过来的变量对象
- `targetSystem` (string): 目标系统名称
- `targetRequest` (string): 当前 target-request 的名称
- `api` (function): API 调用函数

## 常见用法

### 基于变量的条件发送
```javascript
if (!variables.ENABLED) {
  console.log('Disabled by variable');
  return true;
}
if (variables.SKIP_SEND === 'true') {
  console.log('Skip send flag is set');
  return true;
}
return false;
```

### 基于 props 的条件控制
```javascript
if (props.condition && !variables[props.condition]) {
  console.log(`Condition not met: ${props.condition}`);
  return true;
}
return false;
```

### 环境控制
```javascript
if (variables['@'] === 'production' && props.disable_in_prod) {
  console.log('Disabled in production');
  return true;
}
return false;
```

### 时间窗口控制
```javascript
const hour = dayjs().hour();
if (hour < 9 || hour > 18) {
  console.log('Outside business hours');
  return true;
}
return false;
```
