# Listener (监听器)

监听器定义输入请求的入口和要触发的处理流程。

## YAML 结构

```yaml
kind: listener
name: <名称>
metadata:
  title: <标题>
spec:
  triggers:
    - <trigger名称1>
    - <trigger名称2>
```

## 字段说明

- **kind**: 固定值 `listener`
- **name**: 监听器名称,使用 kebab-case
- **metadata.title**: 监听器的标题描述
- **spec.triggers**: 字符串数组,列出此监听器要触发的所有 trigger 名称

## 使用场景

- 定义 webhook 入口
- 配置 API 端点的处理流程
- 一个监听器可以触发多个 trigger
