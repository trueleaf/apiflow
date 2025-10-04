// ============================================================================
// 运行时状态模块
// 包含应用运行时的状态管理类型
// ============================================================================

export type RuntimeNetworkMode = 'online' | 'offline'

export type RuntimeState = {
  networkMode: RuntimeNetworkMode
}

export const RUNTIME_STORAGE_KEY = 'runtime/networkMode'
