# 配置类型详细参考

本目录包含 es-triggers 项目中所有配置类型的详细文档。

## 配置类型列表

### 核心配置
- [Listener (监听器)](listener.md) - 定义输入请求入口
- [Trigger (触发器)](trigger.md) - 串联请求转发流程
- [Adaptor (数据适配器)](adaptor.md) - 聚合多个数据源并返回结果
- [Binding (绑定)](binding.md) - 从输入请求提取数据
- [Template (模板)](template.md) - 定义输出请求格式
- [TargetSystem (目标系统)](target-system.md) - 定义目标地址
- [TargetRequest (目标请求)](target-request.md) - 定义单个输出请求
- [AdaptorRequest (数据请求)](adaptor-request.md) - 定义 Adaptor 中的单个数据请求

### 控制配置
- [SourceInterceptor (源拦截器)](source-interceptor.md) - 判断是否触发流程
- [TargetInterceptor (目标拦截器)](target-interceptor.md) - 判断是否发送请求
- [TargetRequestsCollector (目标请求收集器)](target-requests-collector.md) - 收集处理结果

## 基本结构

所有配置文件都遵循以下基本结构:

```yaml
kind: <配置类型>
name: <配置名称>
metadata:
  title: <标题>
  # 其他 metadata 字段...
spec:
  # 具体配置字段
```

## 命名规范

- **name**: 使用 kebab-case 格式 (小写+连字符)
- **variables 字段**: 使用 UPPER_SNAKE_CASE 格式 (大写+下划线)

## 相关文档

- [变量替换详细参考](../variables/README.md)
- [脚本示例参考](../examples/README.md)
- [完整配置示例](../../assets/workflow-example.yaml)
