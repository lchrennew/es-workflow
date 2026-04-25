import { reactive } from 'vue';

// 基于 16-emitter-rule-domain.md 设计文档的 mock 数据作为默认值
export const emitterRuleOptions = reactive([
  {
    kind: 'emitter-rule',
    name: 'demo/approval/veto',
    metadata: { title: '一票否决' }
  },
  {
    kind: 'emitter-rule',
    name: 'demo/approval/any-accept',
    metadata: { title: '任一通过即通过' }
  },
  {
    kind: 'emitter-rule',
    name: 'demo/approval/quorum-2',
    metadata: { title: '两人通过即通过' }
  },
  {
    kind: 'emitter-rule',
    name: 'system/start/auto-start',
    metadata: { title: '自动开始' }
  },
  {
    kind: 'emitter-rule',
    name: 'demo/approval/majority-after-all',
    metadata: { title: '收齐后多数通过' }
  },
  {
    kind: 'emitter-rule',
    name: 'demo/approval/timeout-pass-no-refuse',
    metadata: { title: '超时自动通过（无人拒绝）' }
  },
  {
    kind: 'emitter-rule',
    name: 'demo/approval/only-specific-target',
    metadata: { title: '仅指定处理方有效' }
  }
]);

// 动态更新 emitter rules 数据
export const updateEmitterRules = (rules) => {
  emitterRuleOptions.splice(0, emitterRuleOptions.length, ...rules);
};
