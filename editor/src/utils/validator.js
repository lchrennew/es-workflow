import { getCleanWorkflow } from '../composables/use-workflow.js';
import { emitterOptions } from '../composables/emitters.js';
import { prefetchers } from '../composables/prefetchers.js';
import ValidatorWorker from './validator.worker.js?worker&inline';

let worker = null;
let currentMessageId = 0;
const callbacks = new Map();

export const validateWorkflow = (workflowConfig) => {
  return new Promise((resolve, reject) => {
    if (!worker) {
      worker = new ValidatorWorker();

      worker.onmessage = (e) => {
        const { id, result } = e.data;
        if (callbacks.has(id)) {
          callbacks.get(id).resolve(result);
          callbacks.delete(id);
        }
      };

      worker.onerror = (err) => {
        callbacks.forEach(cb => cb.reject(err));
        callbacks.clear();
      };
    }

    const config = workflowConfig || getCleanWorkflow();
    const plainPrefetchers = JSON.parse(JSON.stringify(prefetchers));
    const plainEmitterOptions = JSON.parse(JSON.stringify(emitterOptions));
    const plainConfig = JSON.parse(JSON.stringify(config));

    const id = ++currentMessageId;
    callbacks.set(id, { resolve, reject });

    worker.postMessage({
      id,
      workflowConfig: plainConfig,
      prefetchers: plainPrefetchers,
      emitterOptions: plainEmitterOptions
    });
  });
};
