import { defineStore } from 'pinia';
import { ref } from 'vue';
import { AgentMessage } from '@src/types/ai';
import { agentCache } from '@/cache/ai/agentCache';
import { nanoid } from 'nanoid/non-secure';
import { logger } from '@/helper';

export const useAgentStore = defineStore('agent', () => {
  const agentMessageList = ref<AgentMessage[]>([]);
  const currentSessionId = ref<string>('test-session');
  const loading = ref<boolean>(false);
  const addAgentMessage = async (message: AgentMessage): Promise<boolean> => {
    try {
      agentMessageList.value.push(message);
      await agentCache.addMessage(message);
      return true;
    } catch (error) {
      logger.error('添加Agent消息失败', { error });
      return false;
    }
  };
  const setAgentMessageList = (messages: AgentMessage[]): void => {
    agentMessageList.value = messages;
  };
  const clearAgentMessageList = (): void => {
    agentMessageList.value = [];
  };
  const deleteAgentMessageById = (messageId: string): void => {
    const index = agentMessageList.value.findIndex(msg => msg.id === messageId);
    if (index !== -1) {
      agentMessageList.value.splice(index, 1);
    }
  };
  const loadMessagesForSession = async (sessionId: string): Promise<void> => {
    try {
      loading.value = true;
      const messages = await agentCache.getMessagesBySessionId(sessionId);
      setAgentMessageList(messages);
      setCurrentSessionId(sessionId);
    } catch (error) {
      logger.error('加载会话消息失败', { error });
    } finally {
      loading.value = false;
    }
  };
  const setCurrentSessionId = (sessionId: string): void => {
    currentSessionId.value = sessionId;
    agentCache.setLastSessionId(sessionId);
  };
  const createNewSession = (): string => {
    const newSessionId = nanoid();
    setCurrentSessionId(newSessionId);
    clearAgentMessageList();
    return newSessionId;
  };
  const clearCurrentSession = async (): Promise<boolean> => {
    try {
      if (currentSessionId.value) {
        await agentCache.deleteMessagesBySessionId(currentSessionId.value);
      }
      clearAgentMessageList();
      return true;
    } catch (error) {
      logger.error('清空当前会话失败', { error });
      return false;
    }
  };
  const getMessageById = (messageId: string): AgentMessage | null => {
    return agentMessageList.value.find(msg => msg.id === messageId) || null;
  };
  const getLatestMessages = (count: number): AgentMessage[] => {
    return agentMessageList.value.slice(-count);
  };
  return {
    agentMessageList,
    currentSessionId,
    loading,
    addAgentMessage,
    setAgentMessageList,
    clearAgentMessageList,
    deleteAgentMessageById,
    loadMessagesForSession,
    setCurrentSessionId,
    createNewSession,
    clearCurrentSession,
    getMessageById,
    getLatestMessages,
  };
});
