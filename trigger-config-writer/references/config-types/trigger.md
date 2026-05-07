# Trigger (触发器)

触发器是核心配置,串联整个处理流程。

## YAML 结构

```yaml
kind: trigger
name: <名称>
metadata:
  title: <标题>
spec:
  sourceInterceptor: <源拦截器名称>
  targetInterceptor: <目标拦截器名称>
  template: <模板名称>
  binding: <绑定名称>
  targetSystem: <目标系统名称>
  namespace: |
    namespace = variables.ENVIRONMENT || '';
    return namespace;
  targetRequestsCollector: <目标请求收集器名称>
```

## 字段说明

- **kind**: 固定值 `trigger`
- **name**: 触发器名称,使用 kebab-case
- **metadata.title**: 触发器的标题描述
- **spec.sourceInterceptor**: 源拦截器名称,用于判断是否触发此流程
- **spec.targetInterceptor**: 目标拦截器名称,用于判断是否发送输出请求
- **spec.template**: 模板名称,定义输出请求的格式
- **spec.binding**: 绑定名称,定义如何从输入请求提取数据
- **spec.targetSystem**: 目标系统名称,定义请求发送的目标地址
- **spec.namespace**: 可选,JavaScript 脚本,用于动态生成 namespace
- **spec.targetRequestsCollector**: 可选,目标请求收集器名称

## namespace 脚本详解

### 脚本格式
必须给 `namespace` 变量赋值,然后 return namespace

### 执行时机
在 binding 执行后,获取 target-request 列表前

### 可用变量
- `method` (string): HTTP 方法
- `headers` (object): HTTP 请求头对象
- `body` (any): 请求体
- `query` (object): URL 查询参数对象
- `listener` (string): 监听器名称
- `trigger` (string): 触发器名称
- `variables` (object): 从 binding 传递过来的变量对象
- `api` (function): API 调用函数
- `namespace` (string): 需要赋值的命名空间变量

### namespace 的作用

**动态选择 target-request 集合**:
- target-request 的 name 格式为 `{trigger-name}{namespace}`
- 例如: trigger 名为 `my-trigger`,namespace 为 `/prod`,则会查找名为 `my-trigger/prod` 的 target-request
- 如果 namespace 为空字符串,则查找名为 `my-trigger` 的 target-request

**前缀匹配冲突问题**:
- CAC 使用 `startsWith()` 进行前缀匹配查找文件
- 如果 namespace = `/abc`,查找 prefix = `my-trigger/abc`,会匹配:
  - `my-trigger/abc.yaml` ✅
  - `my-trigger/abcd.yaml` ✅ (冲突!)
- **根本原因**: 查找时没有添加差异字符 `.` 来区分文件名边界
  - 如果 prefix = `my-trigger/abc.` 则只会匹配 `my-trigger/abc.yaml`
  - 核心原理: 找到前缀尾部的差异字符 (`.` 用于文件,`/` 用于目录)
- **当前解决方案**: 避免使用前缀重叠的 namespace 名称
  - ✅ 推荐: `/prod`, `/staging`, `/dev` (不会冲突)
  - ✅ 推荐: `/user-123`, `/user-456` (不会冲突)
  - ❌ 避免: `/abc` 和 `/abcd` (会冲突)
  - ❌ 避免: `/prod` 和 `/production` (会冲突)

**namespace 格式规范**:
- 必须以 `/` 开头或为空字符串 `''`
- 避免使用会产生前缀重叠的名称

**namespace 来源优先级**:
1. **trigger.spec.namespace 脚本**: 如果配置了此脚本,执行脚本动态生成
2. **variables['~']**: 如果没有配置脚本,使用 binding 中设置的 `variables['~']` 作为默认值
3. 如果都没有,则为空字符串 `''`

### 使用场景
- 多环境路由 (dev/staging/prod)
- 多租户隔离 (按项目ID、用户ID等)
- 动态工作流选择
- A/B测试分流

### 示例

**基于环境的 namespace**:
```javascript
namespace = variables.ENVIRONMENT ? `/${variables.ENVIRONMENT}` : '';
if (variables.PROJECT_ID) {
  namespace = `/${variables.PROJECT_ID}${namespace}`;
}
return namespace;
```

**基于用户角色的 namespace**:
```javascript
if (variables.USER_ROLE === 'admin') {
  namespace = '/admin';
} else if (variables.USER_ROLE === 'user') {
  namespace = '/user';
} else {
  namespace = '/guest';
}
return namespace;
```

**注意**: 所有 namespace 都以 `/` 开头,避免前缀匹配冲突
