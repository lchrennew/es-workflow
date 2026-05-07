# 特殊字段

variables 对象中有两个特殊字段,不遵循 UPPER_SNAKE_CASE 命名规范。

## `variables['@']` - 环境选择器

用于选择 target-system 中的环境配置。

### 设置方式

在 Binding 中设置:
```javascript
variables['@'] = 'production';
```

### 作用

选择 target-system 的环境 URL:

**TargetSystem 配置**:
```yaml
kind: target-system
name: my-api
spec:
  default: https://api.example.com
  production: https://api.prod.example.com
  staging: https://api.staging.example.com
```

**选择规则**:
- 如果 `variables['@'] = 'production'`,使用 `https://api.prod.example.com`
- 如果 `variables['@']` 未设置或值不存在,使用 `default` 的 URL

### 使用场景
- 多环境部署 (dev/staging/prod)
- 根据请求内容动态选择环境
- 环境隔离

---

## `variables['~']` - 默认 Namespace

用于作为默认的 namespace (当 trigger 没有配置 namespace 脚本时)。

### 设置方式

在 Binding 中设置:
```javascript
variables['~'] = '/prod';
```

### 作用

**动态选择 target-request 集合**:
- 如果 trigger 没有配置 `namespace` 脚本,则使用此值作为 namespace
- target-request 的 name 格式为 `{trigger-name}{namespace}`
- 用于动态选择不同的 target-request 集合

**示例**:
- trigger 名称: `my-trigger`
- `variables['~'] = '/prod'`
- 系统会查找名为 `my-trigger/prod` 的 target-request

**重要**: 必须以 `/` 开头,且避免前缀重叠:
- ✅ 正确: `variables['~'] = '/prod'`
- ❌ 错误: 同时使用 `/abc` 和 `/abcd` (前缀冲突)
- 原因: CAC 使用 `startsWith()` 查找,缺少差异字符 `.` 导致 `/abc` 会匹配 `/abc.yaml` 和 `/abcd.yaml`
- 核心原理: 找到前缀尾部的差异字符 (`.` 用于文件,`/` 用于目录)

### namespace 优先级

1. **trigger.spec.namespace 脚本**: 如果配置了,执行脚本动态生成
2. **variables['~']**: 如果没有配置脚本,使用此值
3. 如果都没有,则为空字符串 `''`

### 使用场景
- 多环境路由
- 多租户隔离
- 动态工作流选择
- 根据请求内容选择不同的处理流程

---

## 相关文档

- [Trigger 配置](../config-types/trigger.md) - 了解 namespace 脚本
- [TargetSystem 配置](../config-types/target-system.md) - 了解环境配置
- [TargetRequest 配置](../config-types/target-request.md) - 了解 name 命名规则
