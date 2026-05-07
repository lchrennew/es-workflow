# Binding Script 示例

Binding script 用于从输入请求中提取和转换数据。

## 基本数据提取

```javascript
variables.PROJECT_ID = body.project?.id || 'default';
variables.USER_NAME = body.user?.name || 'anonymous';
variables.TIMESTAMP = dayjs().unix();
variables.EVENT_TYPE = body.event_type;

if (body.data) {
  variables.DATA_KEYS = Object.keys(body.data);
}

variables['@'] = body.environment || 'production';

if (body.namespace) {
  variables['~'] = `/${body.namespace}`;
}
```

## 复杂数据转换

```javascript
variables.USER_ID = body.user?.id || 0;
variables.USER_EMAIL = body.user?.email || '';
variables.USER_ROLE = body.user?.role || 'guest';

variables.TIMESTAMP = dayjs().format('YYYY-MM-DD HH:mm:ss');
variables.DATE = dayjs().format('YYYY-MM-DD');

if (body.items && Array.isArray(body.items)) {
  variables.ITEM_COUNT = String(body.items.length);
  variables.FIRST_ITEM_ID = body.items[0]?.id || '';
}

variables.REQUEST_ID = `${trigger}-${eventID}`;

if (body.metadata) {
  variables.SOURCE = body.metadata.source || 'unknown';
  variables.VERSION = body.metadata.version || '1.0';
}
```

## 条件逻辑

```javascript
if (body.type === 'urgent') {
  variables.PRIORITY = 'high';
  variables.NOTIFY = 'true';
} else {
  variables.PRIORITY = 'normal';
  variables.NOTIFY = 'false';
}

variables.IS_ADMIN = body.user?.role === 'admin' ? 'true' : 'false';

if (body.tags && body.tags.includes('production')) {
  variables['@'] = 'production';
} else if (body.tags && body.tags.includes('staging')) {
  variables['@'] = 'staging';
} else {
  variables['@'] = 'development';
}
```

## API 调用

```javascript
variables.USER_ID = body.user_id;

const userInfo = await api(`https://api.example.com/users/${body.user_id}`);
variables.USER_NAME = userInfo.name;
variables.USER_EMAIL = userInfo.email;

variables.TIMESTAMP = dayjs().unix();
```

## perRequestScript 示例

### 基于 props 的变量修改

```javascript
if (props.prefix) {
  variables.FINAL_PATH = props.prefix + variables.PATH;
}

variables.REQUEST_ID = `${targetRequest}-${variables.TIMESTAMP}`;
return variables;
```

### 条件变量设置

```javascript
if (props.environment) {
  variables['@'] = props.environment;
}

if (props.enabled === false) {
  variables.SKIP_SEND = 'true';
}

variables.TARGET_NAME = targetRequest;
return variables;
```

### 动态值计算

```javascript
if (props.multiplier) {
  const count = Number(variables.COUNT) || 0;
  variables.FINAL_COUNT = String(count * props.multiplier);
}

if (props.suffix) {
  variables.FINAL_NAME = variables.NAME + props.suffix;
}

return variables;
```
