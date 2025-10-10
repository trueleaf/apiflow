import type { RuntimeNetworkMode } from '@src/types/runtime'
import type { PermissionUserInfo } from '@src/types/project'
import { RUNTIME_STORAGE_KEY, RUNTIME_USERINFO_STORAGE_KEY } from '@src/types/runtime'

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
      return false
    }
  }

  // 获取用户信息
  getUserInfo(): PermissionUserInfo | null {
    try {
      const userInfo = localStorage.getItem(RUNTIME_USERINFO_STORAGE_KEY)
      if (!userInfo) return null
      
      const parsedInfo = JSON.parse(userInfo) as PermissionUserInfo
      
      // 数据有效性验证
      if (!parsedInfo.id || !parsedInfo.loginName) {
        localStorage.removeItem(RUNTIME_USERINFO_STORAGE_KEY)
        return null
      }
      
      return parsedInfo
    } catch (error) {
      localStorage.removeItem(RUNTIME_USERINFO_STORAGE_KEY)
      return null
    }
  }

  // 设置用户信息
  setUserInfo(userInfo: PermissionUserInfo): boolean {
    try {
      // 数据有效性验证
      if (!userInfo.id || !userInfo.loginName) {
        return false
      }
      
      localStorage.setItem(RUNTIME_USERINFO_STORAGE_KEY, JSON.stringify(userInfo))
      return true
    } catch (error) {
      localStorage.removeItem(RUNTIME_USERINFO_STORAGE_KEY)
      return false
    }
  }

  // 清除用户信息
  clearUserInfo(): boolean {
    try {
      localStorage.removeItem(RUNTIME_USERINFO_STORAGE_KEY)
      return true
    } catch (error) {
      localStorage.removeItem(RUNTIME_USERINFO_STORAGE_KEY)
      return false
    }
  }
}

export const runtimeCache = new RuntimeCache()

