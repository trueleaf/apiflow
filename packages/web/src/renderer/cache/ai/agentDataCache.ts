import { openDB, type IDBPDatabase } from 'idb'
import { nanoid } from 'nanoid'
import { config } from '@src/config/config'
import type { AgentConversation, AgentConversationCache, AgentEvent, ChangeSet } from '@src/types/ai'
import type { ConversationCacheData, ConversationMessage } from '@src/types/ai/conversation'
import { redactAIValue } from '@src/shared/ai/redaction'
import { logger } from '@/helper/logger'
import { cacheKey } from '../cacheKey'

const cacheConfig = config.cacheConfig.agentDataCache
const encoder = new TextEncoder()
// 判断旧消息是否可以迁移
const isLegacyMessage = (value: unknown): value is ConversationMessage => typeof value === 'object' && value !== null && 'id' in value && 'kind' in value && 'content' in value && 'createdAt' in value && typeof value.id === 'string' && typeof value.kind === 'string' && typeof value.content === 'string' && typeof value.createdAt === 'number'
// 创建迁移事件
const createMigrationEvent = (conversationId: string, mode: 'agent' | 'ask', message: ConversationMessage, sequence: number): AgentEvent | null => {
  const base = { eventId: nanoid(), conversationId, runId: `migration-${mode}`, messageId: message.id, sequence, createdAt: message.createdAt }
  if (message.kind === 'question') return { ...base, type: 'user-message', text: message.content, language: message.language ?? 'zh-cn' }
  if (message.kind === 'response') return { ...base, type: 'text', phase: 'end', text: message.content }
  if (message.kind === 'error') return { ...base, type: 'error', errorCode: 'AI_LEGACY_ERROR', message: message.content, retryable: false }
  if (message.kind === 'info') return { ...base, type: 'conversation-updated', title: message.content }
  return null
}
// 去重并稳定排序事件
export const normalizeAgentEvents = (events: AgentEvent[]): AgentEvent[] => {
  const byEventId = new Map<string, AgentEvent>()
  const runStarts = new Map<string, number>()
  for (const event of events) runStarts.set(event.runId, Math.min(runStarts.get(event.runId) ?? Infinity, event.createdAt))
  for (const event of events) if (!byEventId.has(event.eventId)) byEventId.set(event.eventId, event)
  return [...byEventId.values()].sort((left, right) => left.runId === right.runId ? left.sequence - right.sequence : (runStarts.get(left.runId) ?? 0) - (runStarts.get(right.runId) ?? 0) || left.runId.localeCompare(right.runId))
}
// 压缩会话事件
const compactConversation = (conversation: AgentConversation): AgentConversation => {
  let events = normalizeAgentEvents(conversation.events).slice(-cacheConfig.maxEventsPerConversation)
  while (events.length > 1 && encoder.encode(JSON.stringify(events)).byteLength > cacheConfig.maxConversationBytes) events = events.slice(Math.max(1, Math.floor(events.length * 0.1)))
  if (encoder.encode(JSON.stringify(events)).byteLength > cacheConfig.maxConversationBytes) events = []
  return { ...conversation, events: events.map(event => event.type === 'client-tool-command' ? { ...event, input: {} } : redactAIValue(event) as AgentEvent), updatedAt: Date.now() }
}
export class AgentDataCache {
  private db: IDBPDatabase | null = null
  private initPromise: Promise<IDBPDatabase> | null = null
  private readonly activeChangeSets = new Map<string, ChangeSet>()
  // 获取数据库
  private async getDB(): Promise<IDBPDatabase> {
    if (this.db) return this.db
    if (this.initPromise) return this.initPromise
    this.initPromise = openDB(cacheConfig.dbName, cacheConfig.version, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(cacheConfig.conversationStoreName)) db.createObjectStore(cacheConfig.conversationStoreName, { keyPath: 'id' })
        if (!db.objectStoreNames.contains(cacheConfig.changeSetStoreName)) {
          const store = db.createObjectStore(cacheConfig.changeSetStoreName, { keyPath: 'id' })
          store.createIndex('conversationId', 'conversationId')
          store.createIndex('expiresAt', 'expiresAt')
        }
      },
    })
    this.db = await this.initPromise
    this.initPromise = null
    return this.db
  }
  // 保存会话
  async putConversation(conversation: AgentConversation): Promise<AgentConversation> {
    const db = await this.getDB()
    const compacted = compactConversation(conversation)
    await db.put(cacheConfig.conversationStoreName, compacted)
    return compacted
  }
  // 读取会话
  async getConversation(id: string): Promise<AgentConversation | null> {
    const db = await this.getDB()
    return await db.get(cacheConfig.conversationStoreName, id) ?? null
  }
  // 读取全部会话
  async getConversations(): Promise<AgentConversation[]> {
    const db = await this.getDB()
    const rows = await db.getAll(cacheConfig.conversationStoreName) as AgentConversation[]
    return rows.sort((left, right) => right.updatedAt - left.updatedAt)
  }
  // 删除会话
  async deleteConversation(id: string): Promise<void> {
    const db = await this.getDB()
    const tx = db.transaction([cacheConfig.conversationStoreName, cacheConfig.changeSetStoreName], 'readwrite')
    await tx.objectStore(cacheConfig.conversationStoreName).delete(id)
    const index = tx.objectStore(cacheConfig.changeSetStoreName).index('conversationId')
    for (const key of await index.getAllKeys(id)) await tx.objectStore(cacheConfig.changeSetStoreName).delete(key)
    await tx.done
    for (const [changeSetId, changeSet] of this.activeChangeSets) if (changeSet.conversationId === id) this.activeChangeSets.delete(changeSetId)
  }
  // 清空 Agent 数据
  async clear(): Promise<void> {
    const db = await this.getDB()
    const tx = db.transaction([cacheConfig.conversationStoreName, cacheConfig.changeSetStoreName], 'readwrite')
    await tx.objectStore(cacheConfig.conversationStoreName).clear()
    await tx.objectStore(cacheConfig.changeSetStoreName).clear()
    await tx.done
    this.activeChangeSets.clear()
  }
  // 保存 ChangeSet
  async putChangeSet(changeSet: ChangeSet): Promise<void> {
    const db = await this.getDB()
    if (['applied', 'discarded', 'failed', 'expired'].includes(changeSet.status)) this.activeChangeSets.delete(changeSet.id)
    else this.activeChangeSets.set(changeSet.id, structuredClone(changeSet))
    await db.put(cacheConfig.changeSetStoreName, redactAIValue(changeSet) as ChangeSet)
  }
  // 读取 ChangeSet
  async getChangeSet(id: string): Promise<ChangeSet | null> {
    const db = await this.getDB()
    const changeSet = this.activeChangeSets.get(id) ?? await db.get(cacheConfig.changeSetStoreName, id) as ChangeSet | undefined
    if (!changeSet) return null
    if ((changeSet.expiresAt <= Date.now() || !this.activeChangeSets.has(id)) && !['applied', 'discarded', 'expired', 'failed'].includes(changeSet.status)) {
      const expired: ChangeSet = { ...changeSet, status: 'expired' }
      this.activeChangeSets.delete(id)
      await db.put(cacheConfig.changeSetStoreName, redactAIValue(expired))
      return expired
    }
    return changeSet
  }
  // 迁移旧会话缓存
  async migrateLegacyCache(): Promise<AgentConversationCache['migration'] | null> {
    const raw = localStorage.getItem(cacheKey.ai.conversation)
    if (!raw) return null
    try {
      const parsed = JSON.parse(raw) as Partial<ConversationCacheData>
      const groups = [['agent', parsed.agentMessages], ['ask', parsed.askMessages]] as const
      let keptMessages = 0
      let discardedMessages = 0
      for (const [mode, values] of groups) {
        if (!Array.isArray(values)) continue
        const conversationId = `migrated-${mode}`
        const events: AgentEvent[] = []
        for (const value of values) {
          if (!isLegacyMessage(value)) { discardedMessages += 1; continue }
          const event = createMigrationEvent(conversationId, mode, value, events.length + 1)
          if (event) { events.push(event); keptMessages += 1 } else discardedMessages += 1
        }
        if (events.length > 0) await this.putConversation({ version: 2, id: conversationId, mode, language: 'zh-cn', events, updatedAt: Date.now() })
      }
      localStorage.removeItem(cacheKey.ai.conversation)
      return { migratedAt: Date.now(), keptMessages, discardedMessages }
    } catch (error) {
      logger.error('迁移 AI 会话缓存失败', { error: redactAIValue(error) })
      localStorage.removeItem(cacheKey.ai.conversation)
      return { migratedAt: Date.now(), keptMessages: 0, discardedMessages: 0 }
    }
  }
}
export const agentDataCache = new AgentDataCache()
