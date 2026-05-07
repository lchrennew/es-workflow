# TargetInterceptor Script 示例

TargetInterceptor script 用于判断输出请求是否应该发送。

**返回值含义**:
- 返回 `true`: **拦截**请求,不发送到目标系统
- 返回 `false`: **通过**请求,发送到目标系统

## 基于变量的条件发送

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

## 基于 props 的条件控制

```javascript
if (props.condition && !variables[props.condition]) {
  console.log(`Condition not met: ${props.condition}`);
  return true;
}

if (props.required_field && !variables[props.required_field]) {
  console.log(`Required field missing: ${props.required_field}`);
  return true;
}

return false;
```

## 环境控制

```javascript
if (variables['@'] === 'production' && props.disable_in_prod) {
  console.log('Disabled in production');
  return true;
}

if (variables['@'] === 'development' && !props.allow_in_dev) {
  console.log('Not allowed in development');
  return true;
}

return false;
```

## 时间窗口控制

```javascript
const hour = dayjs().hour();

if (hour < 9 || hour > 18) {
  console.log('Outside business hours');
  return true;
}

if (dayjs().day() === 0 || dayjs().day() === 6) {
  console.log('Weekend, skipping');
  return true;
}

return false;
```
