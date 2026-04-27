import { updateNodePosition, addTransition, addTarget } from './workflow-ops.js';
import { drawing, canvasState, workflow } from './use-workflow.js';
import { pauseRecording, resumeRecording } from './use-history.js';

export const useNodeDrag = (item) => {
  return (e) => {
    if (drawing.isDrawing) return;
    pauseRecording();
    canvasState.isDragging = true;

    const draggedEl = e.target.closest('.canvas-node, .canvas-transition');
    const draggedWidth = draggedEl ? draggedEl.offsetWidth : (item.name ? 120 : 50);
    const draggedHeight = draggedEl ? draggedEl.offsetHeight : (item.name ? 60 : 50);

    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = item.ui?.x || 0;
    const initialY = item.ui?.y || 0;

    const onMouseMove = (ev) => {
      if (!item.ui) item.ui = { x: 0, y: 0 };
      let newX = Math.round(initialX + ev.clientX - startX);
      let newY = Math.round(initialY + ev.clientY - startY);

      // Snapping logic
      const snapThreshold = 10;
      let snappedX = false;
      let snappedY = false;
      canvasState.alignmentLines = [];

      if (workflow.spec && workflow.spec.states) {
        const allElements = [];
        workflow.spec.states.forEach(state => {
          if (state !== item) {
            allElements.push({
              ui: state.ui,
              type: 'state',
              name: state.name
            });
          }
          if (state.transitions) {
            state.transitions.forEach(transition => {
              if (transition !== item) {
                allElements.push({
                  ui: transition.ui,
                  type: 'transition',
                  name: `${state.name}-${transition.event}`
                });
              }
            });
          }
        });

        for (const node of allElements) {
          if (!node.ui) continue;

          // Try to get actual width/height from DOM if available
          let targetWidth = node.type === 'state' ? 120 : 50;
          let targetHeight = node.type === 'state' ? 60 : 50;
          const targetEl = document.querySelector(
            node.type === 'state'
              ? `.canvas-node[data-name="${node.name}"]`
              : `.canvas-transition[data-id="${node.name}"]`
          );
          if (targetEl) {
            targetWidth = targetEl.offsetWidth;
            targetHeight = targetEl.offsetHeight;
          }

          // Vertical snapping (aligning X, drawing vertical line)
          if (!snappedX) {
            const draggedPointsX = [
              { x: newX + draggedWidth / 2, type: 'center' }
            ];
            const targetPointsX = [
              { x: node.ui.x + targetWidth / 2, type: 'center' }
            ];

            let minDiffX = snapThreshold;
            let bestX = newX;
            let linesX = [];

            for (const dp of draggedPointsX) {
              for (const tp of targetPointsX) {
                // Only allow exact same-type alignment (e.g., top to top, center to center)
                if (dp.type !== tp.type) continue;

                const diff = Math.abs(dp.x - tp.x);
                if (diff < minDiffX) {
                  minDiffX = diff;
                  bestX = newX + (tp.x - dp.x);
                  linesX = [tp.x];
                } else if (diff === minDiffX && diff < snapThreshold) {
                  // Collect multiple lines if they align perfectly at the same time
                  if (!linesX.includes(tp.x)) {
                    linesX.push(tp.x);
                  }
                }
              }
            }

            if (linesX.length > 0) {
              newX = bestX;
              snappedX = true;
              linesX.forEach(lx => {
                canvasState.alignmentLines.push({ type: 'vertical', x: lx });
              });
            }
          }

          // Horizontal snapping (aligning Y, drawing horizontal line)
          if (!snappedY) {
            const draggedPointsY = [
              { y: newY + draggedHeight / 2, type: 'center' }
            ];
            const targetPointsY = [
              { y: node.ui.y + targetHeight / 2, type: 'center' }
            ];

            let minDiffY = snapThreshold;
            let bestY = newY;
            let linesY = [];

            for (const dp of draggedPointsY) {
              for (const tp of targetPointsY) {
                // Only allow exact same-type alignment (e.g., top to top, center to center)
                if (dp.type !== tp.type) continue;

                const diff = Math.abs(dp.y - tp.y);
                if (diff < minDiffY) {
                  minDiffY = diff;
                  bestY = newY + (tp.y - dp.y);
                  linesY = [tp.y];
                } else if (diff === minDiffY && diff < snapThreshold) {
                  if (!linesY.includes(tp.y)) {
                    linesY.push(tp.y);
                  }
                }
              }
            }

            if (linesY.length > 0) {
              newY = bestY;
              snappedY = true;
              linesY.forEach(ly => {
                canvasState.alignmentLines.push({ type: 'horizontal', y: ly });
              });
            }
          }
        }
      }

      item.ui.x = newX;
      item.ui.y = newY;
    };
    const onMouseUp = () => {
      canvasState.isDragging = false;
      canvasState.alignmentLines = [];
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      resumeRecording();
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };
};

export const usePortDrag = (sourceType, sourceData, portType = 'default') => {
  return (e) => {
    drawing.isDrawing = true;
    pauseRecording();
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

      if (!hasMoved) {
        resumeRecording();
        return;
      }

      const targetEl = document.elementFromPoint(ev.clientX, ev.clientY);
      if (targetEl === e.target || e.target.contains(targetEl)) {
        resumeRecording();
        return;
      }

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
      resumeRecording();
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };
};
