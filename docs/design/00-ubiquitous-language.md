# 术语表（Ubiquitous Language）

> 说明：本术语表用于统一“工作流引擎”领域语言。后续每次扩展模型（新增类/关系/状态/交互）都会先对齐这里的定义。

## 核心术语（当前阶段）

### Workflow（工作流）
- 含义：工作流的**配置声明**（配置模型中的聚合根候选），由 `kind/name/metadata/spec` 四部分组成。
- 标识：以 `name` 作为工作流标识（当前阶段不引入独立 `id` 字段）。
- 关注点：
  - `kind`：固定为 `"workflow"`
  - `name`：采用 path 命名（`/` 分隔），每一段仅允许 `a-z`、`0-9`、`-`（且 `-` 不在段首尾）
  - `metadata`：工作流元数据（见下方 WorkflowMetadata）
  - `spec`：工作流定义本体（后续细化）

### WorkflowLayout（流程布局，可选）
- 含义：用于前端/UI 展示的流程画布布局信息，不参与运行语义。
- 位置：`Workflow.spec.layout`
- 结构：
  - `layout.states`：节点坐标字典，key 为 `state.name`，value 为 `{x,y}`
  - `layout.transitions`：连线坐标字典，key 为 `<fromState>::<event>`，value 为 `{x,y}`

### WorkflowMetadata（工作流元数据）
- 含义：描述工作流配置的元信息（在当前模型中作为值对象使用）。
- 字段（当前已确定）：
  - `title`：标题/显示名称（必填）
  - `tags`：标签列表（可选），单个标签格式：`"<类型>/<值>"`
  - `createdBy`：创建人（可选）
  - `createdAt`：创建时间（可选，UTC 字符串，格式 `YYYY-MM-DD HH:mm:ss`）
  - `updatedBy`：最后更新人（可选）
  - `updatedAt`：最后更新时间（可选，UTC 字符串，格式 `YYYY-MM-DD HH:mm:ss`）
  - `version`：版本标识（可选，字符串，MongoDB ObjectId：24 位十六进制）

### MetadataBase（元数据基类）
- 含义：`WorkflowMetadata` 与 `WorkflowTransitionEmitterMetadata` 的公共基类，沉淀通用元数据字段（title/tags/审计字段/version）。

### 参数（Parameters）
- 命名规则：参数 key 仅允许 `A-Z`、`0-9`、`_`，且首字符不为数字、末字符不为 `_`，并且至少 1 个字符（参考正则：`^[A-Z](?:[A-Z0-9_]*[A-Z0-9])?$`）。
- 类型规则：参数 value 统一为字符串（String）。
- 临时参数：key 以 `TMP_` 开头的参数为临时参数，Task 结束时不输出、不后传。

### TMP_REQUEST_TARGETS（任务请求目标列表）
- 含义：用于在 Task 进入 InProgress 时生成 request 列表的临时参数。
- 位置：`task.inputParameters["TMP_REQUEST_TARGETS"]`
- 值：以英文逗号 `,` 分隔的 target 列表（字符串）
- 约束（配置域）：进入非 `end` 状态的迁移 target 应配置至少一个会产出该参数的 prefetcher（即 prefetcher.spec.parameters 包含 `TMP_REQUEST_TARGETS`），用于支撑 request/response 驱动模型。

### Workflow Run（工作流实例/运行）
- 含义：Workflow 被启动后，在运行期产生的一次“运行”（一个可推进、可结束的执行体）。
- 说明：后续建模中若需要区分“运行期标识/状态/进度”，将以 Workflow Run 为统一术语。

### initial（初始状态）
- 含义：每个工作流配置中系统保留的初始状态，`WorkflowState.name` 固定为 `"initial"`。
- 约束：用户不可删除、不可修改；运行启动时默认先激活该状态并创建对应 Task。
  - 强制迁移约束：只能出不能入；其所有外发迁移的事件名必须为 `"start"`
  - 强制迁移约束：至少存在 1 个外发迁移
  - 强制约束：initial 不允许配置 `conditions`
  - 强制运行期语义：initial 的 Task 创建即完成，并通过系统调用执行一次 emitterRules 产出事件 `"start"`（默认可用 `system/start/auto-start`）
  - 建议：为 initial 配置 `emitter: system/start` 与 `emitterRules: [auto-start]`，用于声明 `allowedEvents=[start]` 及其显示名称，便于编排/UI 展示

### end（结束状态）
- 含义：每个工作流配置中系统保留的结束状态，`WorkflowState.name` 固定为 `"end"`。
- 约束：用户不可删除、不可修改；当运行到达该状态时，WorkflowRun 结束。
  - 强制迁移约束：只能进不能出（end 不允许配置 transitions）
  - 强制约束：end 不允许配置 `conditions`
  - 强制运行期语义：end 的 Task 创建即完成，并驱动 WorkflowRun 结束（Completed）

### 其他状态（非 initial/end）
- 强制约束：每个非 `end` 的 state 必须配置 `emitter` 且 `emitterRules` 至少包含 1 个 ruleKey（用于将外部响应归一为内部事件）
- 强制约束：可达性（静态图校验）
  - 除 `initial` 外的所有状态都必须存在一条“从 `initial` 到达该状态”的路径（避免不可达孤岛节点）
  - 除 `end` 外的所有状态都必须存在一条“到达 `end` 的路径”（允许环路，但环路必须有通向 `end` 的出口，避免闭环孤岛）

### id（运行标识）
- 形式：`<工作流标识>.<工作流运行编号>`
- 说明：
  - 工作流标识来源于 `Workflow.name`，并将 `/` 替换为 `.`
  - 运行编号从 `1` 开始自增；每条工作流各自独立计数，互不干扰
  - 示例：Workflow.name=`order/approval`，则 id 可为 `order.approval.1`

### WorkflowTask（工作流任务）
- 含义：某个状态被激活后生成的运行期任务（值对象），用于承载“该状态对应的处理工作”。
- 结构特点（新增）：
  - `task.name`：对应状态名（运行期不再使用 `stateName` 命名）
  - Task 在创建时会从 `WorkflowState` 复制运行所需字段形成快照：`conditions/emitter/emitterRules/transitions`
  - 这样后续运行尽量不再依赖配置域中的原始 `state`，也便于支持前/后加签等动态增添任务场景
- 生命周期（当前约定）：
  - 初始为 `initialized`
  - 当 `task.conditions` 通过后进入 `in-progress`
  - 当 `task.conditions` 不通过时：进入 `Ignored`，并统一触发内部事件 `ignored`
  - 结束后产生 `outputParameters`
- 参数：每个 Task 也拥有 `inputParameters/livingParameters/outputParameters` 三段式参数（作用域在 Task 内）。
  - 约定：Task 进入终态（Completed/Ignored）时，将 `task.outputParameters` 合并到 `run.livingParameters`。

### TaskSource（任务来源，可追溯）
- 含义：Task 的“前因”信息，用于运行期追溯“该任务是由哪个前序任务、通过哪个事件触发产生”。
- 字段：
  - `parent`：前序 TaskId（ObjectId）
  - `name`：触发事件名（内部事件，即 `transition.event`）

### TaskEndEvent（任务结束事件）
- 含义：Task 进入终态时记录的“结束事件名”（内部事件，即 `transition.event`），便于审计与可视化。
- 字段：
  - `endEvent`：结束事件名（String）
  - `endEventId`：对应的 `WorkflowEvent.id`（ObjectId）
- 赋值规则：
  - Task 进入 `Ignored`：固定写入 `"ignored"`
  - Task 进入 `Completed`：写入导致该 Task 完成并推进的事件名（例如 `"passed"` / `"rejected"` / `"start"`）

### Ignored（任务自动终止态）
- 含义：任务已创建但因条件不满足被自动终止，不进入实际处理流程；属于“完成态”的一种。

### WorkflowRequest / WorkflowResponse（外部请求/响应）
- 含义：当 Task 进入 `InProgress` 后，对外部处理方发起的请求（request），以及对应的单次响应（response）。
- 特征：
  - 一个 Task 可以产生多个 request
  - 每个 request 可以对应多个 response（response 作为日志）；其中最多有 1 个“决策类 action”的 response，且必须排在最后
  - request 可包含第三方标识（例如 `user:<工号>` / `sys:<系统标识>`）用于路由与审计
  - 撤回响应（留痕）：不置空 response；将原 request 标记为作废（voided），并创建新的 request 重新发起（见运行域）

### RequestSender（请求发送器配置）
- 含义：独立业务领域中的配置实体，用于把运行期生成的 `WorkflowRequest` 投递到外部系统/通道。
- 配置结构：`kind/name/metadata/spec`
- kind（已确认）：`request-sender`
- 映射规则（强约束）：request target 表达式为 `<senderName>:<ref>`，其中 `senderName` 必须等于 `RequestSender.name`
- spec：仅包含 `script`（运行时默认按 JavaScript 执行；script 仅填写 content，运行时按统一函数签名包装；详见 `17-request-sender-domain.md`）

### Webhook（运行期通知机制）
- 含义：引擎在运行期关键时机向外部系统投递通知的机制；不作为独立配置领域建模，仅作为运行逻辑的扩展点描述。
- 语义：至多一次（不重试）
- 触发点：见运行域 `20-runtime-domain.md` 中的 “Webhook 参与时机”

### WorkflowEmitter（事件触发器）
- 含义：由配置域指定的触发策略，用于在收到 response 时决定“是否触发事件推进工作流运行”。
- 配置位置：
  - `WorkflowState.emitter`：定义对外可执行操作清单（actions，含 kind）
  - `WorkflowState.emitterRules`：定义规则链（按顺序执行，短路）
- 当前约定：
  - 每次收到一个 response，会触发一次 emitter 执行
  - emitter 要么产出事件，要么不产出事件
  - 若产出事件，则事件名取 emitter 输出（不要求等于 `response.action`）

### WorkflowStateEmitter（状态事件触发器配置）
- 含义：独立业务领域中的配置实体，用于声明某个业务场景下的“可执行操作清单”（actions，含 kind）。
- 配置结构：`kind/name/metadata/spec`
- kind（已确认）：`workflow-transition-emitter`
- 引用方式：Workflow 配置中的 `WorkflowState.emitter` 引用 `WorkflowStateEmitter.name`
 - metadata.forUserState：是否允许被用户新增 state 选择（用于 UI 过滤与治理）

### AllowedAction.kind（操作类别）
- 含义：配置在 `WorkflowStateEmitter.spec.actions[*].kind` 上，用于声明该 action 属于“决策类”还是“更新任务类”。
- 枚举：
  - `decision`：决策类 action（参与 emitterRules 的统计与事件触发）
  - `update-task`：更新任务类 action（不参与事件触发；其 response.payload 仅允许固定结构的新增/作废请求指令）
- 语义补充：
  - 更新任务类 action 会触发 `task.updated` webhook
  - 作废 request：保留 request 不删除，仅标记为 voided（留痕）；可不产生后续新 request
  - 撤回 response（留痕约定）：不将 response 置空；将原 request 标记为作废（voided），并创建新的 request 重新发起（见运行域）

### EmitterRule（状态触发规则配置）
- 含义：独立业务领域中的配置实体，一条规则一个脚本，用于在收到 response 时判定是否产出内部事件名。
- 配置结构：`kind/name/metadata/spec`
- kind（已确认）：`emitter-rule`
- 引用方式：Workflow 配置中的 `WorkflowState.emitterRules[*]` 填写 ruleKey，引擎拼接得到 `EmitterRule.name`：`<state.emitter>/<ruleKey>`
 - 脚本签名（约定）：`async (run, task, request, parameters, api) => { const event = { name: null }; /* content */; return event; }`

### Prefetcher（预取器配置）
- 含义：独立业务领域中的配置实体，用于在运行期“先取数/派生数据”，供任务门控、处理、脚本判断使用。
- 配置结构：`kind/name/metadata/spec`
- kind（已确认）：`prefetcher`
- spec：
  - `parameters`（可选）：显式声明该 prefetcher 可能产出的参数 key 列表（用于 UI 展示与冲突检测）
  - `script`：运行时默认按 JavaScript 执行；script 仅填写 content，运行时按统一函数签名包装
- 引用方式：Workflow 配置中的 `WorkflowTransitionTarget.prefetchers[*]` 引用 `Prefetcher.name`

### Emitter.actions（对外可执行操作清单）
- 含义：配置在 `WorkflowStateEmitter.spec.actions` 上，用于声明第三方在该任务上“允许提交哪些 `response.action`”，并为每个 action 提供显示名称与类别（kind）。
- 结构：每项包含 `action`（操作标识）、`title`（显示名称）、`kind`（`decision`/`update-task`）。
- 用法：第三方通过 `runId + taskId` 获取任务当前 state 的 emitter 配置，读取该字段作为按钮/操作清单；提交的 `response.action` 应在该集合的 `action` 集合内（校验策略由实现决定）。

### Emitter.allowedEvents（对外可见内部事件清单）
- 含义：配置在 `WorkflowStateEmitter.spec.allowedEvents` 上，用于声明该 emitter 的规则链可能产出哪些内部事件（`transition.event`），并提供显示名称。
- 结构：每项包含：
  - `name`（内部事件名）
  - `title`（显示名称）
  - `color`（可选，显示颜色）
  - `icon`（可选，显示图标）
- 用法：第三方/编排 UI 可据此展示该 state “可能推进到的事件出口”；引擎可用其对 `EmitterRule` 产出的 `event.name` 做校验（策略由实现决定）。

### WorkflowEvent（运行期事件）
- 含义：运行期“发生了什么”的事件记录，用于给用户查看 WorkflowRun 的经历（**人可读审计时间线**），同时也是状态机推进的依据。
- 关注：可读性、解释性、可追溯（例如谁触发、触发原因、展示名称/颜色/图标等）。
- 字段（建议）：
  - `id(ObjectId)`、`runId`、`taskId(ObjectId)`、`name`
  - `title/color/icon`（可选，用于 UI 展示）
  - `source`（触发来源，例如 engine/emitter/emitterRule/request）
  - `payload`（字符串字典，存放可解释的上下文摘要）

### Webhook（外部系统通知）
- 含义：当特定运行期时机或内部事件发生时，引擎向外部系统发送通知（**外部系统可读**，用于集成）。
- 语义：至多一次（发送失败不重试；失败不影响 WorkflowEvent 记录）。
- 内容原则：
  - 对外提供稳定、机器可处理的信息（建议包含 `eventName/runId` 等）
  - 可选包含 `workflowEventId` 作为关联（便于外部系统定位对应的人类可读事件）
  - 避免把内部实现细节（例如脚本内容）作为对外契约
