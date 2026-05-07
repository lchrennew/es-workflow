# 变量替换详细参考

本目录包含 es-triggers 项目中变量替换的详细文档。

## 变量替换格式

Template 和 TargetSystem 配置中支持使用变量替换,格式为 `$变量名$` (注意不是 `${变量名}`)。

系统支持 5 种变量替换格式:

| 格式 | 说明 | 文档 |
|------|------|------|
| `$变量名$` | 基本字符串替换 | [string-substitution.md](string-substitution.md) |
| `$@变量名$` | URL 编码 | [url-encoding.md](url-encoding.md) |
| `$...变量名$` | 对象展开 | [object-expansion.md](object-expansion.md) |
| `$(Number)变量名$` | 数字类型转换 | [number-type.md](number-type.md) |
| `$(Boolean)变量名$` | 布尔类型转换 | [boolean-type.md](boolean-type.md) |

## 命名规范

- [naming-convention.md](naming-convention.md) - 变量命名必须使用 UPPER_SNAKE_CASE 格式

## 特殊字段

- [special-fields.md](special-fields.md) - `variables['@']` 和 `variables['~']` 的用法

## 完整示例

### Binding 中设置

```javascript
variables.PROJECT_ID = 'proj-123';
variables.TOKEN = 'abc123';
variables.URL = 'https://example.com/path?query=value';
variables.COUNT = '42';
variables.ENABLED = 'true';
variables.DATA_OBJECT = { key1: 'value1', key2: 'value2' };
variables['@'] = 'production';
```

### Template 中使用

```yaml
spec:
  path: /api/$PROJECT_ID$/endpoint
  headers:
    Authorization: Bearer $TOKEN$
  query:
    redirect: $@URL$
  body:
    count: $(Number)COUNT$
    enabled: $(Boolean)ENABLED$
    data: $...DATA_OBJECT$
```

### 结果

```
path: /api/proj-123/endpoint
headers:
  Authorization: Bearer abc123
query:
  redirect: https%3A%2F%2Fexample.com%2Fpath%3Fquery%3Dvalue
body:
  count: 42
  enabled: true
  data:
    key1: value1
    key2: value2
```

## 相关文档

- [配置类型参考](../config-types/README.md)
- [脚本示例参考](../examples/README.md)
