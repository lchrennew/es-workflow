// 绑定的 yaml 数据
import { ref } from "vue";

export const workflowYaml = ref(`kind: workflow
name: demo/workflow
metadata:
  title: 未命名工作流
spec:
  states:
    - name: initial
      title: 开始
      emitter: system/start
      emitterRules:
        - auto-start
      transitions:
        - event: start
          targets:
            - state: state_1777160072770
              prefetchers:
                - demo/request-targets
    - name: state_1777160072770
      title: 任务1
      transitions:
        - event: passed
          targets:
            - state: state_1777160089724
              prefetchers:
                - demo/request-targets
        - event: rejected
          targets:
            - state: end
              prefetchers: []
      emitterRules:
        - veto
        - any-accept
      emitter: demo/approval
    - name: state_1777160089724
      title: 任务2
      transitions:
        - event: passed
          targets:
            - state: end
              prefetchers: []
        - event: rejected
          targets:
            - state: end
              prefetchers: []
      emitterRules:
        - veto
        - any-accept
      emitter: demo/approval
    - name: end
      title: 结束
      transitions: []
`);