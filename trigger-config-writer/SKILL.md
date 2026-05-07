---
name: trigger-config-writer
description: 帮助用户创建、生成和验证 es-triggers 项目的 YAML 配置文件。支持根据描述自动生成配置、交互式创建、格式验证和批量生成。适用于创建 listener、trigger、binding、template、target-system 等转发配置。
---

# trigger-config-writer

这个技能用于帮助用户创建和管理 es-triggers 项目的配置文件。所有配置都以 YAML 格式存储在 Git 仓库中，通过 CAC (Configuration as Code) 服务进行管理。

## When to use

当用户需要以下操作时使用此技能：
- 创建新的 trigger 配置文件（listener、trigger、binding、template、target-system 等）
- 根据需求描述自动生成完整的配置文件
- 交互式地创建配置（逐步询问用户配置细节）
- 验证现有配置文件的格式和字段是否正确
- 批量生成一组相关的配置文件（如一个完整的转发流程）

## Configuration Types Overview

es-triggers 支持 11 种配置类型：

| Kind | 用途 | 关键字段 |
|------|------|----------|
| **listener** | 定义输入请求入口 | triggers (数组) |
| **trigger** | 串联请求转发流程 | sourceInterceptor, targetInterceptor, template, binding, targetSystem |
| **adaptor** | 聚合多个数据源并返回结果 | sourceInterceptor, adaptorRequests, transformResponse, outputCache, passive |
| **target-request** | 定义输出请求 | props, errorTracking, postResponseScript |
| **adaptor-request** | 定义 Adaptor 中的单个数据请求 | binding, template, targetSystem |
| **binding** | 提取和转换数据 | script, perRequestScript |
| **template** | 定义输出请求格式 | path, method, headers, query, body |
| **target-system** | 定义目标地址 | default, <环境名> |
| **source-interceptor** | 判断是否触发 | script (返回 true=拦截) |
| **target-interceptor** | 判断是否发送 | script (返回 true=拦截) |
| **target-requests-collector** | 收集处理结果 | script |

**详细说明**：参见 [配置类型参考](references/config-types/README.md)

## Basic Structure

所有配置文件都遵循以下基本结构：

```yaml
kind: <配置类型>
name: <配置名称>
metadata:
  title: <标题>
spec:
  # 具体配置字段
```

## Variable Substitution

Template 和 TargetSystem 中支持 5 种变量替换格式：

| 格式 | 说明 | 示例 |
|------|------|------|
| `$变量名$` | 字符串替换 | `$PROJECT_ID$` |
| `$@变量名$` | URL 编码 | `$@URL$` |
| `$...变量名$` | 对象展开 | `$...DATA$` |
| `$(Number)变量名$` | 数字类型 | `$(Number)COUNT$` |
| `$(Boolean)变量名$` | 布尔类型 | `$(Boolean)ENABLED$` |

**详细说明**：参见 [变量替换参考](references/variables/README.md)

## Naming Conventions

- **配置名称 (name)**: 使用 kebab-case (例如: `github-webhook`, `deploy-trigger`)
- **变量名称 (variables)**: 使用 UPPER_SNAKE_CASE (例如: `USER_ID`, `ACTION_TYPE`)
- **特殊变量**: `variables['@']` (环境选择器), `variables['~']` (默认 namespace)
- **Namespace**: 必须以 `/` 开头或为空字符串,避免前缀重叠 (例如: `/prod`, `/staging`)

**详细规范**: 参见 [命名规范](references/NAMING-CONVENTIONS.md)

**重要提醒**:
- ⚠️ **Namespace 前缀冲突**: 避免使用前缀重叠的 namespace 名称
  - ❌ 避免: `/abc` 和 `/abcd`, `/prod` 和 `/production`
  - ✅ 推荐: `/prod`, `/staging`, `/dev`
  - 详见: [Trigger 配置文档](references/config-types/trigger.md)

## Instructions

### 1. 理解用户需求
- 询问用户想要创建什么类型的配置
- 了解具体的业务场景和需求
- 确定是单个配置还是批量配置

### 2. 交互式创建配置
当用户需要交互式创建时：
1. 根据配置类型，逐个询问必填字段
2. 对于可选字段，询问用户是否需要
3. 对于脚本字段，参考 [脚本示例](references/examples/README.md) 并询问用户的具体逻辑
4. 对于引用其他配置的字段，列出可能的选项或询问名称

### 3. 自动生成配置
当用户提供了完整描述时：
1. 分析用户需求，确定需要哪些配置类型
2. 根据业务逻辑自动生成合理的配置内容
3. 为脚本字段生成符合需求的代码（参考 [脚本示例](references/examples/README.md)）
4. 确保配置之间的引用关系正确

### 4. 批量生成配置
当需要生成一组相关配置时：
1. 确定完整的流程需要哪些配置类型
2. 按照依赖关系生成配置（先生成被引用的配置）
3. 确保命名一致性和引用正确性
4. 生成顺序建议：
   - **Trigger 流程**: TargetSystem → Template → Binding → SourceInterceptor → TargetInterceptor → Trigger → TargetRequest → Listener → TargetRequestsCollector
   - **Adaptor 流程**: TargetSystem → Template → Binding → SourceInterceptor → AdaptorRequest → Adaptor

### 5. 验证配置
验证配置文件时检查：
1. **基本结构**：必须包含 kind, name, metadata, spec
2. **kind 字段**：必须是有效的配置类型
3. **name 字段**：必须是字符串，使用 kebab-case
4. **metadata**：必须包含 title（部分类型有特殊要求）
5. **spec 字段**：根据配置类型验证必填字段（参考 [配置类型参考](references/config-types/README.md)）
6. **引用完整性**：检查引用的其他配置是否存在
7. **脚本语法**：检查 JavaScript 脚本是否有明显的语法错误
8. **YAML 格式**：确保 YAML 格式正确
9. **命名规范**：检查 variables 字段名是否使用 UPPER_SNAKE_CASE

### 6. 输出配置文件
生成配置后：
1. 使用正确的 YAML 格式
2. 添加适当的注释说明关键字段
3. 确保缩进正确（使用 2 空格）
4. 多行脚本使用 `|` 符号
5. **文件路径**: 保存到 `cac-configs/{kind}/{name}.yaml`
   - 详细规则: [配置文件路径规则](references/FILE-PATH-RULES.md)
6. **命名规范**: 配置名称使用 kebab-case,变量名称使用 UPPER_SNAKE_CASE
   - 详细规则: [命名规范](references/NAMING-CONVENTIONS.md)

### 7. 提供使用说明
生成配置后，告知用户：
1. 配置文件已保存到 `cac-configs/{kind}/{name}.yaml`
2. 配置之间的依赖关系
3. 如何测试配置是否生效

## Common Workflows

### Workflow 1: 简单的 Webhook 转发
接收外部 webhook (如 GitHub, GitLab),转发到内部 API。

**需要的配置**: TargetSystem → Template → Binding → SourceInterceptor → TargetInterceptor → Trigger → TargetRequest → Listener

### Workflow 2: 数据聚合和适配
聚合多个微服务数据并返回给前端,作为 BFF 层。

**需要的配置**: TargetSystem → Template → Binding → SourceInterceptor → AdaptorRequest → Adaptor

**关键特点**: 使用 `/adapt/:name` 路由,返回自定义数据结构,支持输出缓存和被动模式

### Workflow 3: 条件转发
根据请求内容或变量条件决定是否转发。

**关键配置**: SourceInterceptor (输入拦截), TargetInterceptor (输出拦截)

### Workflow 4: 一对多转发
一个输入请求触发多个输出请求,发送到不同的目标系统。

**关键配置**: 多个 target-request 配置,可选的 target-requests-collector 收集结果

### Workflow 5: 多环境配置
根据环境动态选择目标系统或 target-request。

**方式 1**: 使用 `variables['@']` 选择 target-system 的环境
**方式 2**: 使用 namespace 选择不同的 target-request

**详细工作流**: 参见 [常见工作流](references/WORKFLOWS.md)

## Script Guidelines

### Binding Script
- 从输入请求提取数据到 variables 对象
- 字段名必须使用 UPPER_SNAKE_CASE
- 可以使用 `dayjs()`, `api()` 等函数
- 参考：[Binding Script 示例](references/examples/binding-script.md)

### SourceInterceptor Script
- 返回 `true` = 拦截（不触发），`false` = 通过（触发）
- 用于验证请求、过滤事件
- 参考：[SourceInterceptor Script 示例](references/examples/source-interceptor-script.md)

### TargetInterceptor Script
- 返回 `true` = 拦截（不发送），`false` = 通过（发送）
- 用于条件发送、开关控制
- 参考：[TargetInterceptor Script 示例](references/examples/target-interceptor-script.md)

### Namespace Script
- 必须给 `namespace` 变量赋值并 return
- 用于动态选择 target-request 集合
- 参考：[Trigger Namespace Script 示例](references/examples/trigger-namespace-script.md)

### transformResponse Script (Adaptor)
- 对 `result` 对象赋值,转换和聚合响应数据
- 非被动模式: 通过 `responses` 对象访问所有响应
- 被动模式: 通过 `requests[name].response` 按需获取响应
- 可以使用 `redirect(url)` 触发重定向
- 可以使用 `redis` 进行缓存操作
- 参考：[Adaptor transformResponse Script 示例](references/examples/adaptor-transform-response-script.md)

### postResponseScript
- 在目标系统响应后执行
- 可用于回调、日志、后续处理
- 参考：[TargetRequest postResponseScript 示例](references/examples/post-response-script.md)

### Collector Script
- 处理所有 target-request 的结果
- 可用于统计、告警、后续流程
- 参考：[TargetRequestsCollector Script 示例](references/examples/target-requests-collector-script.md)

## Best Practices

1. **命名规范**：
   - 配置名称使用 kebab-case
   - variables 字段名使用 UPPER_SNAKE_CASE
   - 特殊字段 `@` 和 `~` 例外

2. **脚本简洁**：保持脚本简单，复杂逻辑考虑拆分

3. **错误处理**：在脚本中添加必要的错误处理和日志

4. **模块化**：相同的逻辑可以复用配置

5. **测试验证**：生成后建议先在测试环境验证

6. **特殊字段使用**：
   - 使用 `variables['@']` 实现多环境配置切换
   - 使用 `variables['~']` 实现动态 namespace (必须以 `/` 开头)

7. **namespace 规范**：
   - namespace 必须以 `/` 开头或为空字符串
   - 避免使用前缀重叠的名称 (例如 `/abc` 和 `/abcd` 会冲突)

## Reference Documents

- **[配置类型详细参考](references/config-types/README.md)** - 11 种配置类型的完整字段说明
- **[变量替换详细参考](references/variables/README.md)** - 5 种变量替换格式的详细说明和示例
- **[脚本示例参考](references/examples/README.md)** - 各种脚本字段的实用示例
- **[常见工作流](references/WORKFLOWS.md)** - 7 种常见使用场景和配置模式
- **[配置文件路径规则](references/FILE-PATH-RULES.md)** - 文件组织和路径规范
- **[命名规范](references/NAMING-CONVENTIONS.md)** - 配置名称和变量命名规范
- **[完整配置示例](assets/workflow-example.yaml)** - GitHub webhook 转发的完整配置
- **[Adaptor 配置示例](assets/adaptor-example.yaml)** - 用户仪表盘数据聚合的完整配置

## Notes

- 所有配置通过 CAC API 保存到 Git 仓库
- 配置修改会自动版本控制
- 脚本中可以使用 ES6+ 语法
- **变量替换使用 `$变量名$` 格式，不是 `${变量名}`**
- **variables 的字段名必须使用 UPPER_SNAKE_CASE 格式**（特殊字段 `@` 和 `~` 例外）
- **namespace 必须以 `/` 开头或为空字符串**（避免前缀重叠,如 `/abc` 和 `/abcd`）
- 配置名称在同一 kind 下必须唯一
- target-request 的 name 格式为 `{trigger-name}{namespace}`