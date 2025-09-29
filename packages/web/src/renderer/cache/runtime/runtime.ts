import type { RuntimeNetworkMode } from '@src/types/runtime'
import { RUNTIME_STORAGE_KEY } from '@src/types/runtime'

class RuntimeCache {
  getNetworkMode(): RuntimeNetworkMode {
    try {
      const v = localStorage.getItem(RUNTIME_STORAGE_KEY)
      if (!v) return 'offline'
      if (v === 'online' || v === 'offline') return v
      return 'offline'
    } catch {
      return 'offline'
    }
  }

  setNetworkMode(mode: RuntimeNetworkMode): boolean {
    try {
      localStorage.setItem(RUNTIME_STORAGE_KEY, mode)
      return true
    } catch (e) {
      console.error('写入运行时 networkMode 失败:', e)
      return false
    }
  }
}

export const runtimeCache = new RuntimeCache()

