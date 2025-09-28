import type { PermissionUserInfo } from '@src/types/project'

const PERMISSION_STORAGE_KEY = 'permission/userInfo'

class PermissionCache {
  getUserInfo(): PermissionUserInfo | null {
    try {
      const userInfo = localStorage.getItem(PERMISSION_STORAGE_KEY)
      if (!userInfo) return null
      
      const parsedInfo = JSON.parse(userInfo) as PermissionUserInfo
      
      // 数据有效性验证
      if (!parsedInfo.id || !parsedInfo.loginName) {
        localStorage.removeItem(PERMISSION_STORAGE_KEY)
        return null
      }
      
      return parsedInfo
    } catch (error) {
      console.error('获取用户信息失败:', error)
      localStorage.removeItem(PERMISSION_STORAGE_KEY)
      return null
    }
  }

  setUserInfo(userInfo: PermissionUserInfo): boolean {
    try {
      // 数据有效性验证
      if (!userInfo.id || !userInfo.loginName) {
        console.error('用户信息不完整')
        return false
      }
      
      localStorage.setItem(PERMISSION_STORAGE_KEY, JSON.stringify(userInfo))
      return true
    } catch (error) {
      console.error('设置用户信息失败:', error)
      localStorage.removeItem(PERMISSION_STORAGE_KEY)
      return false
    }
  }

  clearUserInfo(): boolean {
    try {
      localStorage.removeItem(PERMISSION_STORAGE_KEY)
      return true
    } catch (error) {
      console.error('清除用户信息失败:', error)
      localStorage.removeItem(PERMISSION_STORAGE_KEY)
      return false
    }
  }
}

export const permissionCache = new PermissionCache()
