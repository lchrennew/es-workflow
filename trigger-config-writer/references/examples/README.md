# 脚本示例参考

本目录包含各种配置类型中脚本字段的实用示例。

## 脚本类型

### Binding 相关
- [binding-script.md](binding-script.md) - Binding script 和 perRequestScript 示例

### 拦截器相关
- [source-interceptor-script.md](source-interceptor-script.md) - SourceInterceptor script 示例
- [target-interceptor-script.md](target-interceptor-script.md) - TargetInterceptor script 示例

### Trigger 相关
- [trigger-namespace-script.md](trigger-namespace-script.md) - Trigger namespace script 示例

### Adaptor 相关
- [adaptor-transform-response-script.md](adaptor-transform-response-script.md) - Adaptor transformResponse script 示例

### TargetRequest 相关
- [post-response-script.md](post-response-script.md) - TargetRequest postResponseScript 示例

### 收集器相关
- [target-requests-collector-script.md](target-requests-collector-script.md) - TargetRequestsCollector script 示例

## 完整场景
- [complete-scenarios.md](complete-scenarios.md) - 完整的配置场景示例

## 脚本编写注意事项

### 通用规则
1. **ES6+ 语法**: 所有脚本支持 ES6+ 语法
2. **异步操作**: 可以使用 `async/await`
3. **dayjs 库**: 所有脚本都可以使用 `dayjs` 进行日期处理
4. **api 函数**: 所有脚本都可以使用 `api()` 函数进行 HTTP 调用

### 变量命名
- **variables 字段**: 必须使用 UPPER_SNAKE_CASE 格式
- **特殊字段**: `variables['@']` 和 `variables['~']` 除外

### 返回值
- **Binding script**: 不需要 return,variables 自动返回
- **Binding perRequestScript**: 必须 return variables
- **SourceInterceptor/TargetInterceptor**: 必须 return 布尔值
- **Trigger namespace**: 必须 return namespace
- **Adaptor transformResponse**: 必须对 result 对象赋值,最终返回 result
- **TargetRequestsCollector**: 必须 return variables
- **postResponseScript**: 不需要 return

## 相关文档

- [配置类型参考](../config-types/README.md)
- [变量替换参考](../variables/README.md)
