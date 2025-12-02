import type { HttpNodeBodyMode } from '@src/types'
import { logger } from '@/helper'
import { cacheKey } from '../cacheKey'
class BodyModeOrderCache {
  private readonly DEFAULT_ORDER: HttpNodeBodyMode[] = ['json', 'formdata', 'urlencoded', 'raw', 'binary', 'none']
  // 获取 Body Mode 顺序
  getBodyModeOrder(): HttpNodeBodyMode[] {
    try {
      const stored = localStorage.getItem(cacheKey.settings.httpNode.bodyModeOrder)
      if (!stored) {
        return [...this.DEFAULT_ORDER]
      }
      const parsed = JSON.parse(stored) as HttpNodeBodyMode[]
      if (!this.validateOrder(parsed)) {
        logger.warn('无效的 Body Mode 顺序配置，使用默认值')
        return [...this.DEFAULT_ORDER]
      }
      return parsed
    } catch (error) {
      logger.error('获取 Body Mode 顺序失败', { error })
      return [...this.DEFAULT_ORDER]
    }
  }
  // 设置 Body Mode 顺序
  setBodyModeOrder(order: HttpNodeBodyMode[]): void {
    try {
      if (!this.validateOrder(order)) {
        logger.error('尝试设置无效的 Body Mode 顺序')
        return
      }
      localStorage.setItem(cacheKey.settings.httpNode.bodyModeOrder, JSON.stringify(order))
    } catch (error) {
      logger.error('设置 Body Mode 顺序失败', { error })
    }
  }
  // 重置为默认顺序
  resetBodyModeOrder(): void {
    this.setBodyModeOrder([...this.DEFAULT_ORDER])
  }
  // 验证顺序配置是否有效
  private validateOrder(order: HttpNodeBodyMode[]): boolean {
    if (!Array.isArray(order) || order.length !== 6) {
      return false
    }
    const validModes: HttpNodeBodyMode[] = ['json', 'formdata', 'urlencoded', 'raw', 'binary', 'none']
    const orderSet = new Set(order)
    return orderSet.size === 6 && validModes.every(mode => orderSet.has(mode))
  }
}
export const bodyModeOrderCache = new BodyModeOrderCache()
