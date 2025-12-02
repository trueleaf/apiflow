import type { HttpNodeTabName } from '@src/types'
import { logger } from '@/helper'
import { cacheKey } from '../cacheKey'

class TabOrderCache {
  private readonly DEFAULT_ORDER: HttpNodeTabName[] = [
    'SParams',
    'SRequestBody',
    'SRequestHeaders',
    'SResponseParams',
    'SPreRequest',
    'SAfterRequest',
    'SRemarks',
    'SSettings'
  ]
  //获取标签页顺序
  getTabOrder(): HttpNodeTabName[] {
    try {
      const stored = localStorage.getItem(cacheKey.settings.httpNode.tabOrder)
      if (!stored) {
        return [...this.DEFAULT_ORDER]
      }
      const parsed = JSON.parse(stored) as HttpNodeTabName[]
      if (!this.validateOrder(parsed)) {
        logger.warn('无效的标签页顺序配置,使用默认值')
        return [...this.DEFAULT_ORDER]
      }
      return parsed
    } catch (error) {
      logger.error('获取标签页顺序失败', { error })
      return [...this.DEFAULT_ORDER]
    }
  }
  //设置标签页顺序
  setTabOrder(order: HttpNodeTabName[]): void {
    try {
      if (!this.validateOrder(order)) {
        logger.error('尝试设置无效的标签页顺序')
        return
      }
      localStorage.setItem(cacheKey.settings.httpNode.tabOrder, JSON.stringify(order))
    } catch (error) {
      logger.error('设置标签页顺序失败', { error })
    }
  }
  //重置为默认顺序
  resetTabOrder(): void {
    this.setTabOrder([...this.DEFAULT_ORDER])
  }
  //验证顺序配置是否有效
  private validateOrder(order: HttpNodeTabName[]): boolean {
    if (!Array.isArray(order) || order.length !== 8) {
      return false
    }
    const validNames: HttpNodeTabName[] = [
      'SParams',
      'SRequestBody',
      'SRequestHeaders',
      'SResponseParams',
      'SPreRequest',
      'SAfterRequest',
      'SRemarks',
      'SSettings'
    ]
    const orderSet = new Set(order)
    return orderSet.size === 8 && validNames.every(name => orderSet.has(name))
  }
}

export const tabOrderCache = new TabOrderCache()
