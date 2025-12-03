import { defineStore } from 'pinia';
import { ref } from 'vue';
import { CopilotMessage } from '@src/types/ai';
import { copilotCache } from '@/cache/ai/copilotCache';
import { nanoid } from 'nanoid/non-secure';
import { logger } from '@/helper';
import type { AnchorRect } from '@src/types/common';

export const useCopilotStore = defineStore('copilot', () => {
  const copilotMessageList = ref<CopilotMessage[]>([]);
  const currentSessionId = ref<string>('test-session');
  const loading = ref<boolean>(false);
  const workingStatus = ref<'working' | 'finish'>('finish');
  const copilotDialogVisible = ref(false);
  const copilotAnchorRect = ref<AnchorRect | null>(null);
  const addCopilotMessage = async (message: CopilotMessage): Promise<boolean> => {
    try {
      copilotMessageList.value.push(message);
      if (message.type !== 'loading') {
        await copilotCache.addMessage(message);
      }
      return true;
    } catch (error) {
      logger.error('添加Copilot消息失败', { error });
      return false;
    }
  };
  const updateCopilotMessage = async (message: CopilotMessage): Promise<boolean> => {
    try {
      if (message.type !== 'loading') {
        await copilotCache.updateMessage(message);
      }
      return true;
    } catch (error) {
      logger.error('更新Copilot消息失败', { error });
      return false;
    }
  };
  const setCopilotMessageList = (messages: CopilotMessage[]): void => {
    copilotMessageList.value = messages;
  };
  const clearCopilotMessageList = (): void => {
    copilotMessageList.value = [];
  };
  const deleteCopilotMessageById = (messageId: string): void => {
    const index = copilotMessageList.value.findIndex(msg => msg.id === messageId);
    if (index !== -1) {
      copilotMessageList.value.splice(index, 1);
    }
  };
  const loadMessagesForSession = async (sessionId: string): Promise<void> => {
    try {
      loading.value = true;
      const messages = await copilotCache.getMessagesBySessionId(sessionId);
      setCopilotMessageList(messages);
      setCurrentSessionId(sessionId);
    } catch (error) {
      logger.error('加载会话消息失败', { error });
    } finally {
      loading.value = false;
    }
  };
  const setCurrentSessionId = (sessionId: string): void => {
    currentSessionId.value = sessionId;
    copilotCache.setLastSessionId(sessionId);
  };
  const createNewSession = (): string => {
    const newSessionId = nanoid();
    setCurrentSessionId(newSessionId);
    clearCopilotMessageList();
    return newSessionId;
  };
  const clearAllSessions = async (): Promise<boolean> => {
    try {
      await copilotCache.clearAllMessages();
      clearCopilotMessageList();
      createNewSession();
      return true;
    } catch (error) {
      logger.error('清空所有会话失败', { error });
      return false;
    }
  };
  const getMessageById = (messageId: string): CopilotMessage | null => {
    return copilotMessageList.value.find(msg => msg.id === messageId) || null;
  };
  const getLatestMessages = (count: number): CopilotMessage[] => {
    const filteredMessages = copilotMessageList.value.filter(msg => msg.type !== 'loading');
    return filteredMessages.slice(-count);
  };
  const initStore = async (): Promise<void> => {
    const lastSessionId = copilotCache.getLastSessionId();
    if (lastSessionId) {
      await loadMessagesForSession(lastSessionId);
      if (copilotMessageList.value.length === 0) {
        createNewSession();
      }
    } else {
      createNewSession();
    }
  };
  const setWorkingStatus = (status: 'working' | 'finish'): void => {
    workingStatus.value = status;
  };
  const showCopilotDialog = (anchorRect?: AnchorRect): void => {
    copilotAnchorRect.value = anchorRect ?? null;
    copilotDialogVisible.value = true;
  };
  const hideCopilotDialog = (): void => {
    copilotDialogVisible.value = false;
    copilotAnchorRect.value = null;
  };
  const handleCopilotShortcut = (event: KeyboardEvent): void => {
    event.preventDefault();
    if (!copilotDialogVisible.value) {
      showCopilotDialog();
    }
  };
  return {
    copilotMessageList,
    currentSessionId,
    loading,
    workingStatus,
    copilotDialogVisible,
    copilotAnchorRect,
    addCopilotMessage,
    updateCopilotMessage,
    setCopilotMessageList,
    clearCopilotMessageList,
    deleteCopilotMessageById,
    loadMessagesForSession,
    setCurrentSessionId,
    createNewSession,
    clearAllSessions,
    getMessageById,
    getLatestMessages,
    initStore,
    setWorkingStatus,
    showCopilotDialog,
    hideCopilotDialog,
    handleCopilotShortcut,
  };
});
