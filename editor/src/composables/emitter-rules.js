import { reactive } from 'vue';

export const emitterRules = reactive([]);

export const updateEmitterRules = (data) => {
  emitterRules.splice(0, emitterRules.length, ...data);
};
