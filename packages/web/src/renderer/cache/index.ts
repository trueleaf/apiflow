// 统一导出所有 cache 单例，方便使用
export { apiNodesCache } from './standalone/apiNodes';
export { projectCache } from './project/projects';
export { commonHeaderCache } from './project/commonHeaders';
export { standaloneRuleCache } from './standalone/rules';
export { variableCache } from './variable/variable';
export { headerCache } from './features/header/header';
export { initStandaloneDB, getStandaloneDB } from './db';
