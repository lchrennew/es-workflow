import { reactive, watch } from 'vue';
import { workflow } from './use-workflow.js';

export const history = reactive({
  stack: [],
  currentIndex: -1,
  isRecording: true,
  isUndoRedoing: false
});

export const canUndo = () => history.currentIndex > 0;
export const canRedo = () => history.currentIndex < history.stack.length - 1;

export const pushHistory = () => {
  if (!history.isRecording || history.isUndoRedoing) return;
  if (!workflow.spec || !workflow.spec.states) return;

  const snapshot = JSON.stringify(workflow.spec.states);

  if (history.currentIndex >= 0) {
    const current = history.stack[history.currentIndex];
    if (current === snapshot) return;
  }

  // truncate future history
  if (history.currentIndex < history.stack.length - 1) {
    history.stack = history.stack.slice(0, history.currentIndex + 1);
  }

  history.stack.push(snapshot);
  history.currentIndex++;
};

export const undo = () => {
  if (canUndo()) {
    history.isUndoRedoing = true;
    history.currentIndex--;
    workflow.spec.states = JSON.parse(history.stack[history.currentIndex]);
    setTimeout(() => { history.isUndoRedoing = false; }, 0);
  }
};

export const redo = () => {
  if (canRedo()) {
    history.isUndoRedoing = true;
    history.currentIndex++;
    workflow.spec.states = JSON.parse(history.stack[history.currentIndex]);
    setTimeout(() => { history.isUndoRedoing = false; }, 0);
  }
};

export const pauseRecording = () => {
  history.isRecording = false;
};

export const resumeRecording = () => {
  history.isRecording = true;
  pushHistory();
};

export const clearHistory = () => {
  history.stack = [];
  history.currentIndex = -1;
};

let historyTimeout = null;

watch(
  () => workflow.spec?.states,
  () => {
    if (!history.isRecording || history.isUndoRedoing) return;
    
    if (historyTimeout) clearTimeout(historyTimeout);
    historyTimeout = setTimeout(() => {
      if (history.isRecording && !history.isUndoRedoing) {
        pushHistory();
      }
    }, 100);
  },
  { deep: true, immediate: true }
);

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
    const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
    if (isInput) return;

    if (e.metaKey || e.ctrlKey) {
      if (e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if (e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }
    }
  });
}
