# 对象展开 `$...变量名$`

## 格式
```
$...变量名$
```

## 说明
- 将对象序列化为 JSON 字符串,然后解析为对象
- **必须单独作为字段值使用**,不能与其他文本混合
- 用于将整个对象作为字段值传递

## 示例

### Binding 中设置
```javascript
variables.USER_DATA = {
  id: 123,
  name: 'John',
  email: 'john@example.com'
};

variables.METADATA = {
  timestamp: 1234567890,
  source: 'webhook'
};
```

### Template 中使用
```yaml
spec:
  body:
    user: $...USER_DATA$
    meta: $...METADATA$
    extra: value
```

### 结果
```yaml
body:
  user:
    id: 123
    name: John
    email: john@example.com
  meta:
    timestamp: 1234567890
    source: webhook
  extra: value
```

## 注意事项

### ❌ 错误用法
```yaml
field: prefix-$...DATA$-suffix
```
不能与其他文本混合使用

### ✅ 正确用法
```yaml
field: $...DATA$
```
必须单独作为字段值

## 使用场景
- 传递用户信息对象
- 传递元数据对象
- 传递配置对象
- 需要保持对象结构的场景
