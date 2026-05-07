# TargetSystem (目标系统)

定义请求发送的目标地址。

## YAML 结构

```yaml
kind: target-system
name: <名称>
metadata:
  title: <标题>
spec:
  default: https://api.example.com
  production: https://api-$REGION$.prod.example.com
  staging: https://api.staging.example.com
  development: https://api.dev.example.com
```

## 字段说明

- **kind**: 固定值 `target-system`
- **name**: 目标系统名称,使用 kebab-case
- **metadata.title**: 目标系统的标题描述
- **spec.default**: 默认的目标系统 URL (必填)
- **spec.<环境名>**: 可以定义多个环境的 URL,通过 `variables['@']` 选择

## 环境选择

在 binding 中设置 `variables['@']` 来选择环境:

```javascript
variables['@'] = 'production';
```

**选择规则**:
- 如果 `variables['@'] = 'production'`,则使用 `spec.production` 的 URL
- 如果 `variables['@']` 未设置或对应的环境不存在,则使用 `spec.default`

## URL 变量替换

URL 中支持变量替换,使用 `$变量名$` 格式:

**示例**:
```yaml
spec:
  production: https://api-$REGION$.prod.example.com
```

如果 `variables.REGION = 'us'`,则 URL 为 `https://api-us.prod.example.com`

**支持的替换格式**:
- 支持所有变量替换格式 (详见 [变量替换文档](../variables/README.md))
- **变量名必须使用 UPPER_SNAKE_CASE 格式**
