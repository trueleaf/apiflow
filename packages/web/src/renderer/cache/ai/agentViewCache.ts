import type { ConversationCacheData, ConversationMessage } from '@src/types/ai';
import { logger } from '@/helper/logger';
import { cacheKey } from '../cacheKey';

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const isConversationMessage = (value: unknown): value is ConversationMessage => {
  if (!isRecord(value)) {
    return false;
  }
  const id = value.id;
  const kind = value.kind;
  const content = value.content;
  const createdAt = value.createdAt;
  return typeof id === 'string'
    && typeof kind === 'string'
    && typeof content === 'string'
    && typeof createdAt === 'number';
};

const isConversationCacheData = (value: unknown): value is ConversationCacheData => {
  if (!isRecord(value)) {
    return false;
  }
  const agentMessages = value.agentMessages;
  const askMessages = value.askMessages;
  const updatedAt = value.updatedAt;
  return Array.isArray(agentMessages)
    && agentMessages.every(isConversationMessage)
    && Array.isArray(askMessages)
    && askMessages.every(isConversationMessage)
    && typeof updatedAt === 'number';
};

// 读取对话缓存
export const getConversationCache = (): ConversationCacheData | null => {
  try {
    const raw = localStorage.getItem(cacheKey.ai.conversation);
    if (!raw) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!isConversationCacheData(parsed)) {
      localStorage.removeItem(cacheKey.ai.conversation);
      return null;
    }
    return parsed;
  } catch (error) {
    logger.error('读取AI对话缓存失败', { error });
    localStorage.removeItem(cacheKey.ai.conversation);
    return null;
  }
};

// 写入对话缓存
export const setConversationCache = (agentMessages: ConversationMessage[], askMessages: ConversationMessage[]): void => {
  try {
    const data: ConversationCacheData = {
      agentMessages,
      askMessages,
      updatedAt: Date.now(),
    };
    localStorage.setItem(cacheKey.ai.conversation, JSON.stringify(data));
  } catch (error) {
    logger.error('写入AI对话缓存失败', { error });
  }
};

// 清空对话缓存
export const clearConversationCache = (): void => {
  try {
    localStorage.removeItem(cacheKey.ai.conversation);
  } catch (error) {
    logger.error('清空AI对话缓存失败', { error });
  }
};

