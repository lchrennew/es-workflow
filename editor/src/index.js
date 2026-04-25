import EditorHeader from './components/editor/editor-header.vue';
import CanvasBoard from './components/editor/canvas-board.vue';
import PropertyPanel from './components/editor/property-panel.vue';
import WorkflowEditor from './components/editor/workflow-editor.vue';
import WorkflowRunViewer from './components/editor/workflow-run-viewer.vue';

// 导出所有组件
export {
    EditorHeader,
    CanvasBoard,
    PropertyPanel,
    WorkflowEditor,
    WorkflowRunViewer
};

// 导出组合式 API 或配置以便外部操作
export * from './composables/use-workflow.js';
export * from './composables/emitters.js';

// 提供一个默认的安装函数，方便 app.use() 全局注册
export default {
    install(app) {
        app.component('EditorHeader', EditorHeader);
        app.component('CanvasBoard', CanvasBoard);
        app.component('PropertyPanel', PropertyPanel);
        app.component('WorkflowEditor', WorkflowEditor);
        app.component('WorkflowRunViewer', WorkflowRunViewer);
    }
};
