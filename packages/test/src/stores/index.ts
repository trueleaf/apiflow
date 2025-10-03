import { createPinia } from 'pinia'

// 创建 pinia 实例
export const pinia = createPinia()

// 导出 stores
export { useTestModuleStore } from './testModule'
