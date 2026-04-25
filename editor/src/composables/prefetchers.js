import { reactive } from 'vue';

export const prefetchers = reactive([]);

export const updatePrefetchers = (data) => {
  prefetchers.splice(0, prefetchers.length, ...data);
};
