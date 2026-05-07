# 数字类型 `$(Number)变量名$`

## 格式
```
$(Number)变量名$
```

## 说明
- 使用 `Number()` 将变量值转换为数字类型
- **必须单独作为字段值使用**,不能与其他文本混合
- 用于需要数字类型的字段 (而不是字符串)

## 示例

### Binding 中设置
```javascript
variables.COUNT = '42';
variables.PRICE = '99.99';
variables.TIMEOUT = '3000';
```

### Template 中使用
```yaml
spec:
  body:
    count: $(Number)COUNT$
    price: $(Number)PRICE$
    timeout: $(Number)TIMEOUT$
```

### 结果
```yaml
body:
  count: 42
  price: 99.99
  timeout: 3000
```

## 转换规则

| 原始值 | 转换后 |
|--------|--------|
| `'42'` | `42` |
| `'3.14'` | `3.14` |
| `'0'` | `0` |
| `''` | `0` |
| `'abc'` | `NaN` |

## 使用场景
- 数量、计数
- 价格、金额
- 超时时间
- ID (数字类型)
- 任何需要数字类型而非字符串的字段
