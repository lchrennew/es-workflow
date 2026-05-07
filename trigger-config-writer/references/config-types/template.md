# Template (模板)

定义输出请求的格式。详细的变量替换规则请参考 [变量替换文档](../variables/README.md)。

## YAML 结构

```yaml
kind: template
name: <名称>
metadata:
  title: <标题>
spec:
  path: /api/endpoint/$PROJECT_ID$
  method: POST
  format: json
  headers:
    Content-Type: application/json
    Authorization: Bearer $TOKEN$
  query:
    param1: $KEY_1$
    encoded: $@URL$
  body:
    field1: $KEY_2$
    field2: value
    count: $(Number)COUNT$
    enabled: $(Boolean)ENABLED$
    data: $...DATA_OBJECT$
```

## 字段说明

- **kind**: 固定值 `template`
- **name**: 模板名称,使用 kebab-case
- **metadata.title**: 模板的标题描述
- **spec.path**: 请求路径,支持变量替换 `$变量名$`
- **spec.method**: HTTP 方法,默认 POST
- **spec.format**: 请求体格式,默认 json (可选: json, form, text 等)
- **spec.headers**: 请求头对象,支持变量替换
- **spec.query**: 查询参数对象,支持变量替换
- **spec.body**: 请求体,支持变量替换

## 变量替换

Template 支持 5 种变量替换格式:

| 格式 | 说明 | 示例 |
|------|------|------|
| `$变量名$` | 字符串替换 | `$PROJECT_ID$` |
| `$@变量名$` | URL 编码 | `$@URL$` |
| `$...变量名$` | 对象展开 | `$...DATA_OBJECT$` |
| `$(Number)变量名$` | 数字类型 | `$(Number)COUNT$` |
| `$(Boolean)变量名$` | 布尔类型 | `$(Boolean)ENABLED$` |

详细说明请参考 [变量替换文档](../variables/README.md)。
