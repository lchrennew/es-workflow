# Binding (绑定)

定义如何从输入请求中提取和转换数据。

## YAML 结构

```yaml
kind: binding
name: <名称>
metadata:
  title: <标题>
spec:
  script: |
    variables.PROJECT_ID = body.project?.id || 'default';
    variables.USER_NAME = body.user?.name || 'anonymous';
    variables.TIMESTAMP = dayjs().unix();
    variables.EVENT_TYPE = body.event_type;
    variables['@'] = body.environment || 'default';
    variables['~'] = body.namespace || '';
  perRequestScript: |
    variables.CUSTOM_VALUE = props.value1;
    variables.FINAL_VALUE = variables.KEY_1 + variables.KEY_2;
    return variables;
```

## 字段说明

- **kind**: 固定值 `binding`
- **name**: 绑定名称,使用 kebab-case
- **metadata.title**: 绑定的标题描述
- **spec.script**: JavaScript 脚本,从输入请求提取数据到 variables 对象
- **spec.perRequestScript**: 可选,JavaScript 脚本,在每个 target-request 执行时运行

## script 详解

### 脚本格式
直接编写语句,不需要 return,variables 对象会自动返回

### 执行时机
在 trigger 执行时,binding 阶段运行一次

### 可用变量
- `listener` (string): 监听器名称
- `trigger` (string): 触发器名称
- `method` (string): HTTP 方法 (GET, POST 等)
- `query` (object): URL 查询参数对象
- `headers` (object): HTTP 请求头对象
- `body` (any): 请求体 (通常是对象)
- `state` (object): 状态对象
- `eventID` (string): 事件 ID
- `api` (function): API 调用函数
- `dayjs` (function): dayjs 日期处理库
- `variables` (object): 变量对象 (需要在此对象上设置属性)

### 注意事项
- 必须将提取的数据赋值给 `variables` 对象的属性
- **variables 的字段名必须使用 UPPER_SNAKE_CASE 格式** (全大写+下划线分隔)
- 例如: `variables.PROJECT_ID`, `variables.USER_NAME`, `variables.EVENT_TYPE`

### 特殊字段

#### `variables['@']` - 环境选择器
用于选择 target-system 的环境配置。

**示例**:
```javascript
variables['@'] = 'production';
```

**作用**:
- 如果设置为 `'production'`,会使用 target-system.spec.production 的 URL
- 如果不设置或值为空,则使用 target-system.spec.default

#### `variables['~']` - 默认 Namespace
用于作为默认的 namespace (当 trigger 没有配置 namespace 脚本时)。

**示例**:
```javascript
variables['~'] = '/prod';
```

**作用**:
- 如果 trigger 没有配置 `namespace` 脚本,则使用此值作为 namespace
- 用于动态选择不同的 target-request 集合
- target-request 的 name 格式为 `{trigger-name}{namespace}`

## perRequestScript 详解

### 脚本格式
直接编写语句,必须 return variables 对象

### 执行时机
每个 target-request 触发时都会执行

### 可用变量
- `listener` (string): 监听器名称
- `trigger` (string): 触发器名称
- `method` (string): HTTP 方法
- `query` (object): URL 查询参数对象
- `headers` (object): HTTP 请求头对象
- `body` (any): 请求体
- `props` (object): target-request 的 props 属性
- `variables` (object): 从 binding.script 传递过来的变量对象
- `targetRequest` (string): 当前 target-request 的名称

### 注意事项
- 可以修改 variables 对象,为不同的 target-request 提供不同的变量值
- 同样需要遵循 UPPER_SNAKE_CASE 命名格式
