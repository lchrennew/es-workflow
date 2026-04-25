import re

with open('/Users/lichun/IdeaProjects/es-workflow/es-workflow/editor/src/App.vue', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract workflowYaml
yaml_match = re.search(r'const workflowYaml = ref\(`(.*?)`\);', content, re.DOTALL)
if yaml_match:
    yaml_str = yaml_match.group(1)
else:
    print("Could not find workflowYaml")

# Extract mockWorkflowRun
mock_run_match = re.search(r'const mockWorkflowRun = computed\(\(\) => \{\n  return (\{.*?\});\n\}\);', content, re.DOTALL)
if mock_run_match:
    mock_run_str = mock_run_match.group(1)
else:
    print("Could not find mockWorkflowRun")

# Extract fetch functions
emitters_match = re.search(r'// 模拟的异步拉取 emitters 方法\nconst mockFetchEmitters = async \(\) => \{(.*?)\n\};\n', content, re.DOTALL)
rules_match = re.search(r'// 模拟的异步拉取 emitter rules 方法\nconst mockFetchEmitterRules = async \(\) => \{(.*?)import re

with open('/Users/lichun/IdeaProjects/es-wse
with op'    content = f.read()

# Extract workflowYaml
yaml_match = re.search(r'"const workflowYaml = ref()