# 配置文件路径规则

所有生成的配置文件必须遵循 CAC 的文件组织规则。

## 基本规则

- **根目录**: 项目根目录下的 `cac-configs/` 目录
- **路径格式**: `cac-configs/{kind}/{name}.yaml`
- **kind**: 配置类型（listener, trigger, adaptor, binding 等）
- **name**: 配置名称（使用 kebab-case）
- **扩展名**: 必须是 `.yaml`

## 完整目录结构示例

```
cac-configs/
├── listener/
│   ├── github-webhook.yaml
│   └── gitlab-webhook.yaml
├── trigger/
│   ├── deploy-trigger.yaml
│   └── notify-trigger.yaml
├── adaptor/
│   └── user-dashboard.yaml
├── binding/
│   ├── extract-user-id.yaml
│   └── github-webhook-binding.yaml
├── template/
│   ├── slack-message-template.yaml
│   └── api-request-template.yaml
├── target-system/
│   ├── internal-api.yaml
│   └── slack-webhook.yaml
├── source-interceptor/
│   └── auth-check.yaml
├── target-interceptor/
│   └── production-only.yaml
├── target-request/
│   ├── deploy-trigger/
│   │   ├── dev.yaml
│   │   └── prod.yaml
│   └── notify-trigger/
│       └── slack-notification.yaml
├── adaptor-request/
│   ├── user-profile.yaml
│   └── user-orders.yaml
└── target-requests-collector/
    └── deployment-collector.yaml
```

## 各配置类型的路径

| Kind | 路径示例 |
|------|----------|
| listener | `cac-configs/listener/github-webhook.yaml` |
| trigger | `cac-configs/trigger/deploy-trigger.yaml` |
| adaptor | `cac-configs/adaptor/user-dashboard.yaml` |
| binding | `cac-configs/binding/extract-user-id.yaml` |
| template | `cac-configs/template/slack-message-template.yaml` |
| target-system | `cac-configs/target-system/internal-api.yaml` |
| source-interceptor | `cac-configs/source-interceptor/auth-check.yaml` |
| target-interceptor | `cac-configs/target-interceptor/production-only.yaml` |
| target-request | `cac-configs/target-request/deploy-trigger/dev.yaml` |
| adaptor-request | `cac-configs/adaptor-request/user-profile.yaml` |
| target-requests-collector | `cac-configs/target-requests-collector/deployment-collector.yaml` |

## 特殊情况

### target-request 的路径组织

target-request 可以有两种组织方式:

**方式 1: 平铺在 target-request 目录下**
```
cac-configs/target-request/
├── dev-deployment.yaml
├── prod-deployment.yaml
└── slack-notification.yaml
```

**方式 2: 按 trigger 分组（推荐）**
```
cac-configs/target-request/
├── deploy-trigger/
│   ├── dev.yaml
│   └── prod.yaml
└── notify-trigger/
    └── slack-notification.yaml
```

按 trigger 分组的优点:
- 更清晰的组织结构
- 便于管理同一个 trigger 的多个 target-request
- 与 namespace 机制配合更好

### namespace 相关的文件命名

当使用 namespace 动态选择 target-request 时,文件名应该反映 namespace:

**示例 1: 环境 namespace**
```yaml
# trigger 配置
spec:
  binding: set-environment
  namespace: |
    namespace = variables['ENVIRONMENT'];
    return namespace;
```

对应的 target-request 文件:
```
cac-configs/target-request/my-trigger/
├── prod.yaml      # namespace = '/prod'
├── staging.yaml   # namespace = '/staging'
└── dev.yaml       # namespace = '/dev'
```

**示例 2: 区域 namespace**
```yaml
# trigger 配置
spec:
  namespace: |
    namespace = `/region/${variables['REGION']}`;
    return namespace;
```

对应的 target-request 文件:
```
cac-configs/target-request/my-trigger/region/
├── us-east.yaml   # namespace = '/region/us-east'
├── us-west.yaml   # namespace = '/region/us-west'
└── eu-west.yaml   # namespace = '/region/eu-west'
```

**注意**: 文件名和目录结构应该与 namespace 的前缀匹配规则对应。

### adaptor-request 的路径组织

adaptor-request 通常平铺在目录下:

```
cac-configs/adaptor-request/
├── user-profile.yaml
├── user-orders.yaml
├── user-notifications.yaml
└── premium-benefits.yaml
```

如果 adaptor-request 很多,也可以按 adaptor 分组:

```
cac-configs/adaptor-request/
├── user-dashboard/
│   ├── user-profile.yaml
│   ├── user-orders.yaml
│   └── user-notifications.yaml
└── admin-dashboard/
    ├── system-stats.yaml
    └── user-stats.yaml
```

## 命名规范

### 配置名称 (name)
- 使用 kebab-case
- 描述性命名,体现配置用途
- 避免过长的名称

**好的命名**:
- `github-webhook`
- `deploy-trigger`
- `extract-user-id`
- `slack-message-template`

**不好的命名**:
- `githubWebhook` (应该用 kebab-case)
- `trigger1` (不够描述性)
- `extract-user-id-from-request-body-and-query` (太长)

### 文件名
- 与配置的 `name` 字段保持一致
- 使用 `.yaml` 扩展名 (不是 `.yml`)

## YAML 格式规范

### 基本格式
```yaml
kind: <配置类型>
name: <配置名称>
metadata:
  title: <配置标题>
spec:
  <配置字段>
```

### 缩进规则
- 使用 2 个空格缩进
- 不使用 Tab 字符

### 多行字符串
使用 `|` 符号表示多行字符串,保留换行:

```yaml
spec:
  script: |
    variables.USER_ID = body.userId;
    variables.ACTION = body.action;
    console.log('Processing:', variables.ACTION);
```

### 注释
添加注释说明关键字段:

```yaml
spec:
  # 从请求中提取用户 ID 和操作类型
  script: |
    variables.USER_ID = body.userId;
    variables.ACTION = body.action;
```

## 文件提交流程

生成配置文件后:

1. **本地保存**: 文件保存到 `cac-configs/{kind}/{name}.yaml`
2. **验证格式**: 确保 YAML 格式正确
3. **提交到 CAC**: 通过 CAC API 提交到 Git 仓库
4. **触发加载**: CAC 自动检测变更并加载新配置
5. **验证生效**: 测试配置是否正常工作

## 相关文档

- [配置类型参考](config-types/README.md)
- [命名规范](NAMING-CONVENTIONS.md)
