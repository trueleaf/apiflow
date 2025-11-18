import type { RuntimeNetworkMode } from '@src/types/runtime'
import type { PermissionUserInfo } from '@src/types/project'
import type { Language } from '@src/types/common'
import { logger } from '@/helper'
import { cacheKey } from '../cacheKey'
class RuntimeCache {
  getNetworkMode(): RuntimeNetworkMode {
    try {
      const v = localStorage.getItem(cacheKey.runtime.networkMode)
      if (!v) return 'offline'
      if (v === 'online' || v === 'offline') return v
      return 'offline'
    } catch (error) {
      logger.error('获取网络模式失败', { error })
      return 'offline'
    }
  }
  setNetworkMode(mode: RuntimeNetworkMode): boolean {
    try {
      localStorage.setItem(cacheKey.runtime.networkMode, mode)
      return true
    } catch (error) {
      logger.error('设置网络模式失败', { error })
      return false
    }
  }
  // 获取用户信息
  getUserInfo(): PermissionUserInfo | null {
    try {
      const userInfo = localStorage.getItem(cacheKey.runtime.userInfo)
      if (!userInfo) return null
      const parsedInfo = JSON.parse(userInfo) as PermissionUserInfo
      return parsedInfo
    } catch (error) {
      logger.error('获取用户信息失败', { error })
      localStorage.removeItem(cacheKey.runtime.userInfo)
      return null
    }
  }
  // 更新用户信息
  updateUserInfo(userInfo: Partial<PermissionUserInfo>): boolean {
    try {
      const existingUserInfo = this.getUserInfo()
      const updatedUserInfo = {
        ...(existingUserInfo || {}),
        ...userInfo
      } as PermissionUserInfo
      localStorage.setItem(cacheKey.runtime.userInfo, JSON.stringify(updatedUserInfo))
      return true
    } catch (error) {
      logger.error('更新用户信息失败', { error })
      localStorage.removeItem(cacheKey.runtime.userInfo)
      return false
    }
  }
  // 清除用户信息
  clearUserInfo(): boolean {
    try {
      localStorage.removeItem(cacheKey.runtime.userInfo)
      return true
    } catch (error) {
      logger.error('清除用户信息失败', { error })
      localStorage.removeItem(cacheKey.runtime.userInfo)
      return false
    }
  }
  // 获取语言
  getLanguage(): Language {
    try {
      const language = localStorage.getItem(cacheKey.runtime.language)
      if (language === 'zh-cn' || language === 'zh-tw' || language === 'en' || language === 'ja') {
        return language
      }
      return 'zh-cn'
    } catch (error) {
      logger.error('获取语言配置失败', { error })
      return 'zh-cn'
    }
  }
  // 设置语言
  setLanguage(language: Language): boolean {
    try {
      localStorage.setItem(cacheKey.runtime.language, language)
      return true
    } catch (error) {
      logger.error('设置语言配置失败', { error })
      return false
    }
  }
}
export const runtimeCache = new RuntimeCache()