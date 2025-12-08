import { defineStore } from 'pinia';
import { ref } from 'vue';
import { AgentViewMessage } from '@src/types/ai';
import { agentViewCache } from '@/cache/ai/agentViewCache';
import { nanoid } from 'nanoid/non-secure';
import { logger } from '@/helper';
import type { AnchorRect } from '@src/types/common';

export const useAgentViewStore = defineStore('agentView', () => {
  const agentViewMessageList = ref<AgentViewMessage[]>([]);
  const currentSessionId = ref<string>('test-session');
  const loading = ref<boolean>(false);
  const workingStatus = ref<'working' | 'finish'>('finish');
  const agentViewDialogVisible = ref(false);
  const agentViewAnchorRect = ref<AnchorRect | null>(null);
  // 添加AgentView消息
  const addAgentViewMessage = async (message: AgentViewMessage): Promise<boolean> => {
    try {
      agentViewMessageList.value.push(message);
      if (message.type !== 'loading') {
        await agentViewCache.addMessage(message);
      }
      return true;
    } catch (error) {
      logger.error('添加AgentView消息失败', { error });
      return false;
    }
  };
  // 更新AgentView消息
  const updateAgentViewMessage = async (message: AgentViewMessage): Promise<boolean> => {
    try {
      if (message.type !== 'loading') {
        await agentViewCache.updateMessage(message);
      }
      return true;
    } catch (error) {
      logger.error('更新AgentView消息失败', { error });
      return false;
    }
  };
  // 设置AgentView消息列表
  const setAgentViewMessageList = (messages: AgentViewMessage[]): void => {
    agentViewMessageList.value = messages;
  };
  // 清空AgentView消息列表
  const clearAgentViewMessageList = (): void => {
    agentViewMessageList.value = [];
  };
  // 根据ID删除AgentView消息
  const deleteAgentViewMessageById = (messageId: string): void => {
    const index = agentViewMessageList.value.findIndex(msg => msg.id === messageId);
    if (index !== -1) {
      agentViewMessageList.value.splice(index, 1);
    }
  };
  // 加载会话消息
  const loadMessagesForSession = async (sessionId: string): Promise<void> => {
    try {
      loading.value = true;
      const messages = await agentViewCache.getMessagesBySessionId(sessionId);
      setAgentViewMessageList(messages);
      setCurrentSessionId(sessionId);
    } catch (error) {
      logger.error('加载会话消息失败', { error });
    } finally {
      loading.value = false;
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
    clearAgentViewMessageList();
    return newSessionId;
  };
  // 清空所有会话
  const clearAllSessions = async (): Promise<boolean> => {
    try {
      await agentViewCache.clearAllMessages();
      clearAgentViewMessageList();
      createNewSession();
      return true;
    } catch (error) {
      logger.error('清空所有会话失败', { error });
      return false;
    }
  };
  // 根据ID获取消息
  const getMessageById = (messageId: string): AgentViewMessage | null => {
    return agentViewMessageList.value.find(msg => msg.id === messageId) || null;
  };
  // 根据ID更新消息（通过替换数组元素触发响应式）
  const updateMessageInList = (messageId: string, updates: Partial<AgentViewMessage>): void => {
    const index = agentViewMessageList.value.findIndex(msg => msg.id === messageId);
    if (index !== -1) {
      agentViewMessageList.value[index] = { ...agentViewMessageList.value[index], ...updates } as AgentViewMessage;
    }
  };
  // 更新消息的流式状态
  const updateMessageStreaming = (messageId: string, isStreaming: boolean): void => {
    updateMessageInList(messageId, { isStreaming } as Partial<AgentViewMessage>);
  };
  // 获取最近的消息
  const getLatestMessages = (count: number): AgentViewMessage[] => {
    const filteredMessages = agentViewMessageList.value.filter(msg => msg.type !== 'loading');
    return filteredMessages.slice(-count);
  };
  // 初始化Store
  const initStore = async (): Promise<void> => {
    const lastSessionId = agentViewCache.getLastSessionId();
    if (lastSessionId) {
      await loadMessagesForSession(lastSessionId);
      if (agentViewMessageList.value.length === 0) {
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
  // 处理AgentView快捷键
  const handleAgentViewShortcut = (event: KeyboardEvent): void => {
    event.preventDefault();
    if (!agentViewDialogVisible.value) {
      showAgentViewDialog();
    }
  };
  return {
    agentViewMessageList,
    currentSessionId,
    loading,
    workingStatus,
    agentViewDialogVisible,
    agentViewAnchorRect,
    addAgentViewMessage,
    updateAgentViewMessage,
    updateMessageInList,
    updateMessageStreaming,
    setAgentViewMessageList,
    clearAgentViewMessageList,
    deleteAgentViewMessageById,
    loadMessagesForSession,
    setCurrentSessionId,
    createNewSession,
    clearAllSessions,
    getMessageById,
    getLatestMessages,
    initStore,
    setWorkingStatus,
    showAgentViewDialog,
    hideAgentViewDialog,
    handleAgentViewShortcut,
  };
});
