import type { RuntimeNetworkMode } from '@src/types/runtime'
import type { PermissionUserInfo } from '@src/types/project'
import type { Language } from '@src/types/common'
import { logger } from '@/helper/logger'
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
  // 检测系统语言并映射到应用支持的语言
  private detectSystemLanguage(): Language {
    try {
      const systemLang = navigator.language || navigator.languages?.[0] || 'en'
      const langCode = systemLang.toLowerCase()
      if (langCode.startsWith('zh-cn') || langCode.startsWith('zh-hans') || langCode === 'zh') {
        return 'zh-cn'
      }
      if (langCode.startsWith('zh-tw') || langCode.startsWith('zh-hk') || langCode.startsWith('zh-hant')) {
        return 'zh-tw'
      }
      if (langCode.startsWith('ja')) {
        return 'ja'
      }
      return 'en'
    } catch (error) {
      logger.error('检测系统语言失败', { error })
      return 'en'
    }
  }
  // 获取语言
  getLanguage(): Language {
    try {
      const language = localStorage.getItem(cacheKey.runtime.language)
      if (language === 'zh-cn' || language === 'zh-tw' || language === 'en' || language === 'ja') {
        return language
      }
      const detectedLanguage = this.detectSystemLanguage()
      this.setLanguage(detectedLanguage)
      return detectedLanguage
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
  // 获取 Analytics 启用状态（默认启用）
  getAnalyticsEnabled(): boolean {
    try {
      const enabled = localStorage.getItem(cacheKey.runtime.analyticsEnabled)
      if (enabled === null) {
        return true
      }
      return enabled === 'true'
    } catch (error) {
      logger.error('获取 Analytics 状态失败', { error })
      return true
    }
  }
  // 设置 Analytics 启用状态
  setAnalyticsEnabled(enabled: boolean): boolean {
    try {
      localStorage.setItem(cacheKey.runtime.analyticsEnabled, String(enabled))
      return true
    } catch (error) {
      logger.error('设置 Analytics 状态失败', { error })
      return false
    }
  }
}
export const runtimeCache = new RuntimeCache()