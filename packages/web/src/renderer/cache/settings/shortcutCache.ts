import { reactive } from 'vue'
import type { UserShortcutSettings } from '@src/types/shortcut'
import { cacheKey } from '@/cache/cacheKey.ts'
class ShortcutCache {
  private userSettings: UserShortcutSettings = reactive({})
  getUserSettings(): UserShortcutSettings {
    if (Object.keys(this.userSettings).length === 0) {
      const cached = localStorage.getItem(cacheKey.settings.shortcuts)
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          Object.assign(this.userSettings, parsed)
        } catch (error) {
          console.error('解析用户快捷键设置失败:', error)
        }
      }
    }
    return this.userSettings
  }
  setUserSettings(settings: UserShortcutSettings) {
    Object.assign(this.userSettings, settings)
    localStorage.setItem(cacheKey.settings.shortcuts, JSON.stringify(this.userSettings))
  }
  setShortcutKeys(shortcutId: string, keys: string) {
    this.userSettings[shortcutId] = keys
    localStorage.setItem(cacheKey.settings.shortcuts, JSON.stringify(this.userSettings))
  }
  removeShortcutKeys(shortcutId: string) {
    delete this.userSettings[shortcutId]
    localStorage.setItem(cacheKey.settings.shortcuts, JSON.stringify(this.userSettings))
  }
  clearAllSettings() {
    Object.keys(this.userSettings).forEach(key => {
      delete this.userSettings[key]
    })
    localStorage.removeItem(cacheKey.settings.shortcuts)
  }
}
export const shortcutCache = new ShortcutCache()