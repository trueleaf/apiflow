import type { Language } from '@src/types'

export type ConversationMode = 'agent' | 'ask'
// 仅用于旧缓存迁移的最小数据结构
export type ConversationMessage = { id: string; kind: string; content: string; createdAt: number; language?: Language }
export type ConversationCacheData = { agentMessages: ConversationMessage[]; askMessages: ConversationMessage[]; updatedAt: number }
