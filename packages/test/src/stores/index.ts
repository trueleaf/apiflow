import { createPinia } from 'pinia'

// 创建 pinia 实例
export const pinia = createPinia()

// 导出所有 stores
export { useProjectStore } from './project'
export { useTeamStore } from './team'
export { useSearchStore } from './search'
export { usePermissionStore } from './permission'