import { defineStore } from 'pinia';
import { ref } from 'vue';
import { AgentMessage } from '@src/types/ai';
import { agentCache } from '@/cache/ai/agentCache';
import { nanoid } from 'nanoid/non-secure';
import { logger } from '@/helper';

export const useAgentStore = defineStore('agent', () => {
  const agentMessageList = ref<AgentMessage[]>([
    {
      id: nanoid(),
      type: 'ask',
      content: '你好，请帮我分析一下这个项目的结构',
      timestamp: new Date().toISOString(),
      sessionId: 'test-session'
    },
    {
      id: nanoid(),
      type: 'loading',
      content: '分析中',
      timestamp: new Date().toISOString(),
      sessionId: 'test-session'
    },
    {
      id: nanoid(),
      type: 'tool',
      content: '正在分析项目结构...\n扫描到 src 目录\n扫描到 tests 目录\n发现 245 个文件',
      timestamp: new Date().toISOString(),
      sessionId: 'test-session'
    },
    {
      id: nanoid(),
      type: 'textResponse',
      content: `根据分析，项目结构如下：

## 主要目录

- **src/**: 源代码目录
  - **renderer/**: 渲染进程代码
  - **main/**: 主进程代码
  - **types/**: TypeScript 类型定义

- **tests/**: 测试文件

## 技术栈

项目使用了以下技术：

\`\`\`javascript
{
  "vue": "^3.5.13",
  "electron": "36.2.0",
  "typescript": "~5.6.2"
}
\`\`\`

这是一个基于 **Electron + Vue 3** 的桌面应用，使用了 Vite 作为构建工具。

### 核心特性

1. 支持 HTTP API 设计与测试
2. 支持 WebSocket 连接
3. 支持 Mock 服务器
4. 完整的国际化支持`,
      timestamp: new Date().toISOString(),
      sessionId: 'test-session'
    }
  ]);
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
