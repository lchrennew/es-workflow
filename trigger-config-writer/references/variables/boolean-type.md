# 布尔类型 `$(Boolean)变量名$`

## 格式
```
$(Boolean)变量名$
```

## 说明
- 将变量值转换为布尔类型
- **必须单独作为字段值使用**,不能与其他文本混合
- 特殊的转换规则 (见下方)

## 示例

### Binding 中设置
```javascript
variables.ENABLED = 'true';
variables.DISABLED = 'false';
variables.ACTIVE = '1';
variables.EMPTY = '';
```

### Template 中使用
```yaml
spec:
  body:
    enabled: $(Boolean)ENABLED$
    disabled: $(Boolean)DISABLED$
    active: $(Boolean)ACTIVE$
    empty: $(Boolean)EMPTY$
```

### 结果
```yaml
body:
  enabled: true
  disabled: false
  active: true
  empty: false
```

## 转换规则

### 转换为 `false` 的值
以下值会被转换为 `false`:
- `''` (空字符串)
- `'0'`
- `'false'`
- `'null'`
- `'undefined'`
- `'NaN'`

### 转换为 `true` 的值
其他所有值都转换为 `true`,包括:
- `'true'` → `true`
- `'1'` → `true`
- `'yes'` → `true`
- `'any string'` → `true`

## 使用场景
- 开关标志
- 功能启用/禁用
- 条件判断
- 布尔配置项
