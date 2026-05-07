# 变量命名规范

## 必须使用 UPPER_SNAKE_CASE 格式

所有 variables 的字段名必须使用 **UPPER_SNAKE_CASE** 格式 (全大写+下划线分隔)。

## 正确示例

```javascript
variables.PROJECT_ID = 'proj-123';
variables.USER_NAME = 'john';
variables.EVENT_TYPE = 'webhook';
variables.IS_ENABLED = true;
variables.MAX_COUNT = 100;
variables.API_KEY = 'abc123';
variables.CREATED_AT = dayjs().unix();
```

## 错误示例

### ❌ 不要使用 camelCase
```javascript
variables.projectId = 'proj-123';
variables.userName = 'john';
variables.eventType = 'webhook';
```

### ❌ 不要使用 snake_case (小写)
```javascript
variables.project_id = 'proj-123';
variables.user_name = 'john';
variables.event_type = 'webhook';
```

### ❌ 不要使用 PascalCase
```javascript
variables.ProjectId = 'proj-123';
variables.UserName = 'john';
variables.EventType = 'webhook';
```

## 特殊字段例外

以下两个特殊字段不遵循 UPPER_SNAKE_CASE 规范:

1. **`variables['@']`** - 环境选择器
2. **`variables['~']`** - 默认 namespace

详见 [特殊字段文档](special-fields.md)。

## 为什么使用 UPPER_SNAKE_CASE?

1. **区分度高**: 在 template 中使用 `$PROJECT_ID$` 时,一眼就能看出这是一个变量
2. **团队约定**: 这是团队的统一命名规范
3. **避免冲突**: 与 JavaScript 变量命名风格区分开
4. **可读性强**: 全大写表示这是一个常量或配置值
