# URL 编码 `$@变量名$`

## 格式
```
$@变量名$
```

## 说明
- 使用 `encodeURIComponent()` 对变量值进行 URL 编码
- 用于 URL 查询参数或路径中包含特殊字符的场景
- 会编码空格、`&`、`=`、`?`、`/` 等特殊字符

## 示例

### Binding 中设置
```javascript
variables.REDIRECT_URL = 'https://example.com/path?query=value&foo=bar';
variables.SEARCH_TEXT = 'hello world';
```

### Template 中使用
```yaml
spec:
  query:
    redirect: $@REDIRECT_URL$
    q: $@SEARCH_TEXT$
```

### 结果
```yaml
query:
  redirect: https%3A%2F%2Fexample.com%2Fpath%3Fquery%3Dvalue%26foo%3Dbar
  q: hello%20world
```

## 编码规则

| 原始字符 | 编码后 |
|---------|--------|
| 空格 | `%20` |
| `&` | `%26` |
| `=` | `%3D` |
| `?` | `%3F` |
| `/` | `%2F` |
| `:` | `%3A` |
| `#` | `%23` |

## 使用场景
- 回调 URL
- 搜索关键词
- 包含特殊字符的参数值
- 需要在 URL 中传递完整 URL 的场景
