# 命名规范

本文档定义了 es-triggers 配置中各种命名的规范。

## 配置名称 (name)

配置的 `name` 字段命名规范:

### 格式
- 使用 **kebab-case** (小写字母 + 连字符)
- 只包含小写字母、数字和连字符
- 以字母开头
- 不以连字符结尾

### 示例

**正确**:
- `github-webhook`
- `deploy-trigger`
- `extract-user-id`
- `slack-message-template`
- `user-service-v2`

**错误**:
- `githubWebhook` ❌ (应该用 kebab-case)
- `GitHub-Webhook` ❌ (不应该有大写字母)
- `github_webhook` ❌ (应该用连字符,不是下划线)
- `-github-webhook` ❌ (不应该以连字符开头)
- `github-webhook-` ❌ (不应该以连字符结尾)

### 命名建议

**描述性命名**:
- 名称应该清楚表达配置的用途
- 避免使用 `trigger1`, `binding2` 这样的通用名称

**长度适中**:
- 避免过短: `gh` ❌
- 避免过长: `extract-user-id-from-request-body-and-query-parameters` ❌
- 推荐长度: 2-5 个单词

**一致性**:
- 同类配置使用相似的命名模式
- 例如: `github-webhook`, `gitlab-webhook`, `bitbucket-webhook`

## 变量名称 (variables)

在 binding 脚本中定义的变量命名规范:

### 格式
- 使用 **UPPER_SNAKE_CASE** (大写字母 + 下划线)
- 只包含大写字母、数字和下划线
- 以字母开头

### 示例

**正确**:
```javascript
variables.USER_ID = body.userId;
variables.ACTION_TYPE = body.action;
variables.CREATED_AT = body.createdAt;
variables.IS_PREMIUM = body.isPremium;
variables.API_VERSION = 'v2';
```

**错误**:
```javascript
variables.userId = body.userId;        // ❌ 应该用大写
variables.user_id = body.userId;       // ❌ 应该用大写
variables.User_Id = body.userId;       // ❌ 应该全部大写
variables.USERID = body.userId;        // ⚠️ 可以,但不推荐(缺少下划线分隔)
```

### 特殊字段

有两个特殊的变量字段不遵循 UPPER_SNAKE_CASE 规范:

- `variables['@']` - 环境选择器
- `variables['~']` - 默认 namespace

```javascript
variables['@'] = 'production';
variables['~'] = '/default';
```

### 命名建议

**清晰表达含义**:
```javascript
variables.USER_ID = body.userId;           // ✅ 清晰
variables.UID = body.userId;               // ⚠️ 不够清晰
variables.U = body.userId;                 // ❌ 太简短
```

**使用标准缩写**:
```javascript
variables.API_KEY = headers['x-api-key'];  // ✅ API 是标准缩写
variables.URL = body.url;                  // ✅ URL 是标准缩写
variables.ID = body.id;                    // ✅ ID 是标准缩写
```

**布尔值前缀**:
```javascript
variables.IS_PREMIUM = body.isPremium;     // ✅ 使用 IS_ 前缀
variables.HAS_ACCESS = checkAccess();      // ✅ 使用 HAS_ 前缀
variables.CAN_EDIT = checkPermission();    // ✅ 使用 CAN_ 前缀
```

## 配置标题 (metadata.title)

配置的 `metadata.title` 字段命名规范:

### 格式
- 使用中文或英文
- 简短描述配置用途
- 不超过 50 个字符

### 示例

```yaml
metadata:
  title: GitHub Webhook 监听器
```

```yaml
metadata:
  title: 部署触发器
```

```yaml
metadata:
  title: 提取用户 ID
```

## 文件名

配置文件的文件名规范:

### 格式
- 与配置的 `name` 字段保持一致
- 使用 `.yaml` 扩展名 (不是 `.yml`)

### 示例

```yaml
# 文件: cac-configs/trigger/deploy-trigger.yaml
kind: trigger
name: deploy-trigger
```

文件名 `deploy-trigger.yaml` 与 `name: deploy-trigger` 一致。

## 目录名

### 格式
- 使用配置类型的完整名称
- 使用 kebab-case
- 与 `kind` 字段保持一致

### 示例

```
cac-configs/
├── listener/              # kind: listener
├── trigger/               # kind: trigger
├── adaptor/               # kind: adaptor
├── binding/               # kind: binding
├── template/              # kind: template
├── target-system/         # kind: target-system
├── source-interceptor/    # kind: source-interceptor
├── target-interceptor/    # kind: target-interceptor
├── target-request/        # kind: target-request
├── adaptor-request/       # kind: adaptor-request
└── target-requests-collector/  # kind: target-requests-collector
```

## 命名冲突

### 避免冲突

不同类型的配置可以使用相同的 name,因为它们在不同的目录中:

```
cac-configs/
├── binding/
│   └── github-webhook.yaml      # name: github-webhook
└── template/
    └── github-webhook.yaml      # name: github-webhook (不冲突)
```

### 推荐做法

虽然不同类型可以重名,但建议使用不同的名称以提高可读性:

```
cac-configs/
├── binding/
│   └── github-webhook-binding.yaml       # name: github-webhook-binding
└── template/
    └── github-webhook-template.yaml      # name: github-webhook-template
```

## 命名模式

### 按功能分组

**Webhook 相关**:
- `github-webhook-listener`
- `github-webhook-binding`
- `github-webhook-template`

**部署相关**:
- `deploy-trigger`
- `deploy-binding`
- `deploy-template`

**通知相关**:
- `slack-notification-template`
- `email-notification-template`

### 按环境区分

**Target Request**:
- `deploy-trigger/dev.yaml`
- `deploy-trigger/staging.yaml`
- `deploy-trigger/prod.yaml`

**Target System**:
- `api-service-dev`
- `api-service-staging`
- `api-service-prod`

## 相关文档

- [配置文件路径规则](FILE-PATH-RULES.md)
- [变量替换详细参考](variables/README.md)
