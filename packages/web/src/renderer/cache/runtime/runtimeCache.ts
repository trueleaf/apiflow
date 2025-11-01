import type { RuntimeNetworkMode } from '@src/types/runtime'
import type { PermissionUserInfo } from '@src/types/project'
import type { Language } from '@src/types/common'
import { RUNTIME_STORAGE_KEY, RUNTIME_USERINFO_STORAGE_KEY } from '@src/types/runtime'

const RUNTIME_LANGUAGE_STORAGE_KEY = 'runtime/language'

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
  // 更新用户头像
  updateUserAvatar(avatar: string): boolean {
    try {
      const userInfo = this.getUserInfo()
      if (!userInfo) return false
      userInfo.avatar = avatar
      return this.setUserInfo(userInfo)
    } catch (error) {
      return false
    }
  }
  // 更新用户邮箱
  updateUserEmail(email: string): boolean {
    try {
      const userInfo = this.getUserInfo()
      if (!userInfo) return false
      userInfo.email = email
      return this.setUserInfo(userInfo)
    } catch (error) {
      return false
    }
  }
  // 更新用户昵称
  updateUserRealName(realName: string): boolean {
    try {
      const userInfo = this.getUserInfo()
      if (!userInfo) return false
      userInfo.realName = realName
      return this.setUserInfo(userInfo)
    } catch (error) {
      return false
    }
  }
  // 获取语言
  getLanguage(): Language {
    try {
      const language = localStorage.getItem(RUNTIME_LANGUAGE_STORAGE_KEY)
      if (language === 'zh-cn' || language === 'zh-tw' || language === 'en' || language === 'ja') {
        return language
      }
      return 'zh-cn'
    } catch {
      return 'zh-cn'
    }
  }
  // 设置语言
  setLanguage(language: Language): boolean {
    try {
      localStorage.setItem(RUNTIME_LANGUAGE_STORAGE_KEY, language)
      return true
    } catch (error) {
      return false
    }
  }
}

export const runtimeCache = new RuntimeCache()

