# TargetRequest (目标请求)

定义一个输出请求的配置。

## YAML 结构

```yaml
kind: target-request
name: <名称>
metadata:
  trigger: <所属trigger名称>
spec:
  props:
    customKey: customValue
  errorTracking: true
  postResponseScript: |
    console.log('Response received:', content);
    await api('https://callback.example.com', { body: content });
```

## 字段说明

- **kind**: 固定值 `target-request`
- **name**: 目标请求名称,格式为 `{trigger-name}{namespace}`
- **metadata.trigger**: 此目标请求所属的 trigger 名称
- **spec.props**: 可选,自定义属性对象,可在 binding.perRequestScript 中通过 `props` 变量访问
- **spec.errorTracking**: 可选,布尔值,是否启用错误追踪 (将错误记录到 Redis)
- **spec.postResponseScript**: 可选,JavaScript 脚本,在收到目标系统响应后执行

## name 命名规则

target-request 的 name 必须遵循 `{trigger-name}{namespace}` 格式:

**示例**:
- trigger 名称: `my-trigger`
- namespace: `/prod`
- target-request name: `my-trigger/prod`

**查找机制**:
- trigger 会根据 namespace 动态查找对应的 target-request
- 如果 namespace 为空,则查找名为 `my-trigger` 的 target-request
- 如果 namespace 为 `/prod`,则查找名为 `my-trigger/prod` 的 target-request

**重要**: namespace 必须以 `/` 开头,且避免前缀重叠:
- ✅ 正确: `my-trigger/prod`, `my-trigger/staging`
- ❌ 错误: 同时存在 `my-trigger/abc` 和 `my-trigger/abcd` (前缀冲突)
- **原因**: CAC 使用 `startsWith()` 查找文件,`my-trigger/abc` 会匹配:
  - `my-trigger/abc.yaml` ✅
  - `my-trigger/abcd.yaml` ✅ (冲突!)
- **核心原理**: 查找时缺少差异字符 `.` 来区分文件名边界
  - 如果 prefix = `my-trigger/abc.` 则只会匹配 `my-trigger/abc.yaml`

## postResponseScript 详解

### 脚本格式
直接编写语句,可以是异步操作

### 执行时机
目标系统响应后立即执行

### 可用变量
- `content` (object): 目标系统响应的完整内容对象
- `api` (function): API 调用函数
- `dayjs` (function): dayjs 日期处理库

### 用途
可用于回调通知、日志记录、后续处理等

### 示例

**失败回调**:
```javascript
if (!content.response?.ok) {
  console.error('Request failed:', content.response?.status);
  await api('https://alert.example.com/webhook', {
    method: 'POST',
    body: {
      message: 'Request failed',
      targetRequest: content.request,
      response: content.response
    }
  });
}
```

**成功通知**:
```javascript
if (content.response?.ok) {
  console.log('Request succeeded');
  await api('https://callback.example.com/success', {
    method: 'POST',
    body: {
      id: content.response.data?.id,
      timestamp: dayjs().format()
    }
  });
}
```
