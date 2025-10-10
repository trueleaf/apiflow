// ============================================================================
// 运行时状态模块
// 包含应用运行时的状态管理类型
// ============================================================================

import type { PermissionUserInfo } from '../project'

export type RuntimeNetworkMode = 'online' | 'offline'

export type RuntimeState = {
  networkMode: RuntimeNetworkMode
  userInfo: PermissionUserInfo | null
}

export const RUNTIME_STORAGE_KEY = 'runtime/networkMode'
export const RUNTIME_USERINFO_STORAGE_KEY = 'runtime/userInfo'
