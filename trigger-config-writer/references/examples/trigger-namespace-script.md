# Trigger Namespace Script 示例

Trigger namespace script 用于动态生成 namespace,从而选择不同的 target-request 集合。

**重要**: 
- namespace 必须以 `/` 开头,或者为空字符串 `''`
- 避免使用前缀重叠的名称 (例如 `/abc` 和 `/abcd`)
- 原因: CAC 查找时缺少差异字符 `.`,导致 `/abc` 会匹配 `/abc.yaml` 和 `/abcd.yaml`
- 核心原理: 找到前缀尾部的差异字符 (`.` 用于文件,`/` 用于目录)

## 基于环境的 namespace

```javascript
namespace = variables.ENVIRONMENT ? `/${variables.ENVIRONMENT}` : '';

if (variables.PROJECT_ID) {
  namespace = `/${variables.PROJECT_ID}${namespace}`;
}

return namespace;
```

## 基于用户角色的 namespace

```javascript
if (variables.USER_ROLE === 'admin') {
  namespace = '/admin';
} else if (variables.USER_ROLE === 'user') {
  namespace = '/user';
} else {
  namespace = '/guest';
}

return namespace;
```

## 动态路径构建

```javascript
const parts = [];

if (variables.REGION) {
  parts.push(variables.REGION);
}

if (variables.PROJECT_ID) {
  parts.push(variables.PROJECT_ID);
}

namespace = parts.length > 0 ? `/${parts.join('/')}` : '';
return namespace;
```

## 多环境多项目

```javascript
let env = variables['@'] || 'default';
let project = variables.PROJECT_ID || '';

if (project) {
  namespace = `/${project}/${env}`;
} else {
  namespace = `/${env}`;
}

return namespace;
```
