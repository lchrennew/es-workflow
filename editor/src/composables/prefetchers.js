import { reactive, ref } from 'vue';

export const prefetchers = reactive([]);
export const isPrefetchersLoading = ref(false);

export const updatePrefetchers = (data) => {
  prefetchers.splice(0, prefetchers.length, ...data);
};
