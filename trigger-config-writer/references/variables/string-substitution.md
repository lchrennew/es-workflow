# 基本字符串替换 `$变量名$`

## 格式
```
$变量名$
```

## 说明
- 替换为 `variables.变量名` 的值 (字符串形式)
- 如果变量不存在,替换为空字符串 `''`
- 可以在任何位置使用,可以与其他文本混合

## 示例

### Binding 中设置
```javascript
variables.PROJECT_ID = 'proj-123';
variables.USER_NAME = 'john';
variables.TOKEN = 'abc123xyz';
```

### Template 中使用
```yaml
spec:
  path: /api/projects/$PROJECT_ID$/users/$USER_NAME$
  headers:
    Authorization: Bearer $TOKEN$
    X-User: $USER_NAME$
```

### 结果
```
path: /api/projects/proj-123/users/john
headers:
  Authorization: Bearer abc123xyz
  X-User: john
```

## 使用场景
- 路径参数
- 请求头值
- 查询参数
- 请求体中的字符串字段
- 任何需要字符串替换的地方
