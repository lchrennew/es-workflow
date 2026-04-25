# 设计决策记录（ADR）索引

> 本目录的 ADR 采用“索引文档 + 每个 ADR 独立文档”的方式管理，便于查阅与演进。

## 当前有效

- [ADR-001：WorkflowTransition 的归属（方案A vs 方案B）](./decisions/ADR-001.md)
- [ADR-004：WorkflowRun 参数字典（input/living/output）的引入与分层](./decisions/ADR-004.md)
- [ADR-005：引入 WorkflowTask，并用 State.conditions（脚本）进行任务门控](./decisions/ADR-005.md)
- [ADR-006：state.conditions（脚本）不通过时触发事件，并将 Task 置为 Ignored](./decisions/ADR-006.md)
- [ADR-007：在 Task 上引入外部 Request/Response](./decisions/ADR-007.md)
- [ADR-008：初始状态采用保留名 \"initial\"](./decisions/ADR-008.md)
- [ADR-009：结束状态采用保留名 \"end\"](./decisions/ADR-009.md)
- [ADR-010：在配置域引入 state.emitter + state.emitterRules（规则链）以聚合 response 并触发内部事件](./decisions/ADR-010.md)
- [ADR-011：Emitter 作为独立配置领域（kind/name/metadata/spec + allowedActions）](./decisions/ADR-011.md)
- [ADR-012：引入 MetadataBase 作为元数据基类](./decisions/ADR-012.md)
- [ADR-013：移除 TransitionTarget.conditions，仅保留 State.conditions（脚本）](./decisions/ADR-013.md)
- [ADR-014：开始/结束状态的强制迁移约束](./decisions/ADR-014.md)
- [ADR-015：Task 终态时将 outputParameters 合并到 run.livingParameters](./decisions/ADR-015.md)
- [ADR-016：参数 key 命名规则与 value 类型统一为字符串](./decisions/ADR-016.md)
- [ADR-017：TMP_ 前缀参数为临时参数（不输出、不后传）](./decisions/ADR-017.md)
- [ADR-018：基于 TMP_REQUEST_TARGETS 生成 Task 的 request 列表](./decisions/ADR-018.md)
- [ADR-019：Prefetcher 作为独立配置领域（kind/name/metadata/spec + script）](./decisions/ADR-019.md)
- [ADR-020：引入 EmitterRule 领域模型以复用“判定规则”](./decisions/ADR-020.md)
- [ADR-021：在 WorkflowTask 上增加 source（parent + event）以增强可追溯性](./decisions/ADR-021.md)

## 历史（已废弃，仅保留用于追溯）

- [ADR-002：多目标迁移的条件表达（toStates -> targets + when）（已废弃）](./decisions/ADR-002.md)
- [ADR-003：条件从 when 演进为 conditions + prefetchers（已废弃）](./decisions/ADR-003.md)
