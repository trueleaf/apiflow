import { defineStore } from 'pinia';
import { ref } from 'vue';
import { AgentViewMessage } from '@src/types/ai';
import { agentViewCache } from '@/cache/ai/agentViewCache';
import { nanoid } from 'nanoid/non-secure';
import { logger } from '@/helper';
import type { AnchorRect } from '@src/types/common';

export const useAgentViewStore = defineStore('agentView', () => {
  const currentMessageList = ref<AgentViewMessage[]>([]);
  const currentSessionId = ref('');
  const isLoadingSessionData = ref(false);
  const workingStatus = ref<'working' | 'finish'>('finish');
  const agentViewDialogVisible = ref(false);
  const agentViewAnchorRect = ref<AnchorRect | null>(null);
  /*
  |--------------------------------------------------------------------------
  | 消息增删改查
  |--------------------------------------------------------------------------
  */
  // 添加消息
  const addCurrentMessage = async (message: AgentViewMessage): Promise<boolean> => {
    try {
      currentMessageList.value.push(message);
      if (message.type !== 'loading') {
        await agentViewCache.addMessage(message);
      }
      return true;
    } catch (error) {
      logger.error('添加消息失败', { error });
      return false;
    }
  };
  // 根据ID更新消息，同时更新缓存
  const updateCurrentMessageById = async (messageId: string, updates: Partial<AgentViewMessage>): Promise<boolean> => {
    try {
      const index = currentMessageList.value.findIndex(msg => msg.id === messageId);
      if (index === -1) {
        return false;
      }
      const { id: _ignoreId, sessionId: _ignoreSessionId, ...safeUpdates } = updates;
      const nextMessage = { ...currentMessageList.value[index], ...safeUpdates } as AgentViewMessage;
      currentMessageList.value[index] = nextMessage;
      if (nextMessage.type !== 'loading') {
        await agentViewCache.updateMessage(nextMessage);
      }
      return true;
    } catch (error) {
      logger.error('更新消息失败', { error });
      return false;
    }
  };
  // 根据ID更新消息（仅更新视图）
  const updateMessageById = (messageId: string, updates: Partial<AgentViewMessage>): void => {
    const index = currentMessageList.value.findIndex(msg => msg.id === messageId);
    if (index !== -1) {
      currentMessageList.value[index] = { ...currentMessageList.value[index], ...updates } as AgentViewMessage;
    }
  };
  // 根据ID删除消息
  const deleteCurrentMessageById = (messageId: string): void => {
    const index = currentMessageList.value.findIndex(msg => msg.id === messageId);
    if (index !== -1) {
      currentMessageList.value.splice(index, 1);
    }
  };
  // 清空消息列表
  const clearCurrentMessageList = (): void => {
    currentMessageList.value = [];
  };
  // 根据ID获取消息
  const getMessageById = (messageId: string): AgentViewMessage | null => {
    return currentMessageList.value.find(msg => msg.id === messageId) || null;
  };
  // 获取最近的消息
  const getLatestMessages = (count: number): AgentViewMessage[] => {
    const filteredMessages = currentMessageList.value.filter(msg => msg.type !== 'loading');
    return filteredMessages.slice(-count);
  };
  /*
  |--------------------------------------------------------------------------
  | 会话相关内容
  |--------------------------------------------------------------------------
  */
  // 加载指定会话
  const loadSession = async (sessionId: string): Promise<void> => {
    try {
      isLoadingSessionData.value = true;
      const messages = await agentViewCache.getMessagesBySessionId(sessionId);
      currentMessageList.value = messages;
      setCurrentSessionId(sessionId);
    } catch (error) {
      logger.error('加载会话失败', { error });
    } finally {
      isLoadingSessionData.value = false;
    }
  };
  // 设置当前会话ID
  const setCurrentSessionId = (sessionId: string): void => {
    currentSessionId.value = sessionId;
    agentViewCache.setLastSessionId(sessionId);
  };
  // 创建新会话
  const createNewSession = (): string => {
    const newSessionId = nanoid();
    setCurrentSessionId(newSessionId);
    clearCurrentMessageList();
    return newSessionId;
  };
  // 清空所有会话
  const clearAllSessions = async (): Promise<boolean> => {
    try {
      await agentViewCache.clearAllMessages();
      clearCurrentMessageList();
      createNewSession();
      return true;
    } catch (error) {
      logger.error('清空所有会话失败', { error });
      return false;
    }
  };
  /*
  |--------------------------------------------------------------------------
  | 其他
  |--------------------------------------------------------------------------
  */
  // 初始化Store并加载会话数据
  const loadSessionData = async (): Promise<void> => {
    const lastSessionId = agentViewCache.getLastSessionId();
    if (lastSessionId) {
      await loadSession(lastSessionId);
      if (currentMessageList.value.length === 0) {
        createNewSession();
      }
    } else {
      createNewSession();
    }
  };
  // 设置工作状态
  const setWorkingStatus = (status: 'working' | 'finish'): void => {
    workingStatus.value = status;
  };
  // 显示AgentView弹窗
  const showAgentViewDialog = (anchorRect?: AnchorRect): void => {
    agentViewAnchorRect.value = anchorRect ?? null;
    agentViewDialogVisible.value = true;
  };
  // 隐藏AgentView弹窗
  const hideAgentViewDialog = (): void => {
    agentViewDialogVisible.value = false;
    agentViewAnchorRect.value = null;
  };
  return {
    currentMessageList,
    currentSessionId,
    isLoadingSessionData,
    workingStatus,
    agentViewDialogVisible,
    agentViewAnchorRect,
    addCurrentMessage,
    updateCurrentMessageById,
    updateMessageById,
    clearCurrentMessageList,
    deleteCurrentMessageById,
    loadSession,
    setCurrentSessionId,
    createNewSession,
    clearAllSessions,
    getMessageById,
    getLatestMessages,
    loadSessionData,
    setWorkingStatus,
    showAgentViewDialog,
    hideAgentViewDialog,
  };
});
