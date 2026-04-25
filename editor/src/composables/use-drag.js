import { updateNodePosition, addTransition, addTarget } from './workflow-ops.js';
import { drawing, canvasState } from './use-workflow.js';

export const useNodeDrag = (item) => {
  return (e) => {
    if (drawing.isDrawing) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = item.ui?.x || 0;
    const initialY = item.ui?.y || 0;

    const onMouseMove = (ev) => {
      if (!item.ui) item.ui = { x: 0, y: 0 };
      item.ui.x = Math.round(initialX + ev.clientX - startX);
      item.ui.y = Math.round(initialY + ev.clientY - startY);
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };
};

export const usePortDrag = (sourceType, sourceData, portType = 'default') => {
  return (e) => {
    drawing.isDrawing = true;
    drawing.sourceNode = sourceData;
    const rect = e.target.getBoundingClientRect();
    const boardRect = e.target.closest('.canvas-board').getBoundingClientRect();

    drawing.startX = rect.left - boardRect.left + rect.width / 2 - canvasState.offsetX;
    drawing.startY = rect.top - boardRect.top + rect.height / 2 - canvasState.offsetY;
    drawing.currentX = drawing.startX;
    drawing.currentY = drawing.startY;

    let hasMoved = false;
    const startClientX = e.clientX;
    const startClientY = e.clientY;

    const onMouseMove = (ev) => {
      if (Math.abs(ev.clientX - startClientX) > 3 || Math.abs(ev.clientY - startClientY) > 3) {
        hasMoved = true;
      }
      drawing.currentX = ev.clientX - boardRect.left - canvasState.offsetX;
      drawing.currentY = ev.clientY - boardRect.top - canvasState.offsetY;
    };

    const onMouseUp = (ev) => {
      drawing.isDrawing = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);

      if (!hasMoved) return;

      const targetEl = document.elementFromPoint(ev.clientX, ev.clientY);
      if (targetEl === e.target || e.target.contains(targetEl)) return;

      const targetNodeEl = targetEl?.closest('.canvas-node');
      if (targetNodeEl) {
        const targetName = targetNodeEl.getAttribute('data-name');
        if (targetName) {
          if (sourceType === 'state') {
            addTransition(sourceData.state.name, targetName, portType);
          } else if (sourceType === 'transition') {
            addTarget(sourceData.transition, targetName);
          }
        }
      }
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };
};
