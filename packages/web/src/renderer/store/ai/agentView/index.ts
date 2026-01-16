import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ChatRequestBody, LLMessage } from '@src/types/ai/agent.type';
import type { AgentViewMessage, AskMessage, TextResponseMessage, LoadingMessage, ErrorMessage, AgentExecutionMessage } from '@src/types/ai';
import { agentViewCache } from '@/cache/ai/agentViewCache';
import { appStateCache } from '@/cache/appState/appStateCache';
import { nanoid } from 'nanoid/non-secure';
import { logger } from '@/helper';
import { i18n } from '@/i18n';
import { useLLMClientStore } from '../llmClientStore';

export const useAgentViewStore = defineStore('agentView', () => {
  const llmClientStore = useLLMClientStore();
  const currentMessageList = ref<AgentViewMessage[]>([]);
  const currentSessionId = ref('');
  const isLoadingSessionData = ref(false);
  const workingStatus = ref<'working' | 'finish'>('finish');
  const agentViewDialogVisible = ref(false);
  // 视图状态
  const currentView = ref<'chat' | 'history' | 'agent' | 'config'>('agent');
  const setCurrentView = (view: 'chat' | 'history' | 'agent' | 'config'): void => {
    currentView.value = view;
    appStateCache.setAiDialogView(view);
  };
  const mode = ref<'agent' | 'ask'>('agent');
  const inputMessage = ref('');
  // 流式请求状态
  const isStreaming = ref(false);
  const currentStreamRequestId = ref<string | null>(null);
  const streamingMessageId = ref<string | null>(null);
  const loadingMessageId = ref<string | null>(null);
  const isFirstChunk = ref(false);
  const lastAskPrompt = ref('');
  const cancelCurrentStream = ref<(() => Promise<void>) | null>(null);
  // 计算属性：AI 配置是否有效
  const isAiConfigValid = computed(() => {
    return llmClientStore.isAvailable();
  });
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
  const showAgentViewDialog = (): void => {
    agentViewDialogVisible.value = true;
  };
  // 隐藏AgentView弹窗
  const hideAgentViewDialog = (): void => {
    agentViewDialogVisible.value = false;
  };
  /*
  |--------------------------------------------------------------------------
  | 视图切换
  |--------------------------------------------------------------------------
  */
  // 切换到聊天视图
  const switchToChat = (): void => {
    setCurrentView('chat');
  };
  // 切换到历史视图
  const switchToHistory = (): void => {
    setCurrentView('history');
  };
  // 切换到配置视图
  const switchToConfig = (): void => {
    setCurrentView('config');
  };
  // 设置模式
  const setMode = (newMode: 'agent' | 'ask'): void => {
    mode.value = newMode;
    appStateCache.setAiDialogMode(newMode);
    if (currentView.value === 'chat' || currentView.value === 'agent') {
      setCurrentView(newMode === 'agent' ? 'agent' : 'chat');
    }
  };
  // 初始化模式（从缓存读取）
  const initMode = (): void => {
    const cachedMode = appStateCache.getAiDialogMode();
    if (cachedMode === 'agent' || cachedMode === 'ask') {
      mode.value = cachedMode;
      return;
    }
    mode.value = 'agent';
  };
  // 初始化视图（从缓存读取）
  const initView = (): void => {
    const cachedView = appStateCache.getAiDialogView();
    const modeView = mode.value === 'agent' ? 'agent' : 'chat';
    if (cachedView === 'history' || cachedView === 'config') {
      currentView.value = cachedView;
      return;
    }
    if (cachedView === 'chat' || cachedView === 'agent') {
      if (cachedView === modeView) {
        currentView.value = cachedView;
      } else {
        setCurrentView(modeView);
      }
      return;
    }
    setCurrentView(modeView);
  };
  /*
  |--------------------------------------------------------------------------
  | 流式处理
  |--------------------------------------------------------------------------
  */
  // 根据错误信息判断错误类型
  const detectErrorType = (errorMsg: string): 'network' | 'api' | 'unknown' => {
    const networkKeywords = ['fetch', 'network', 'ECONNREFUSED', 'timeout', 'ETIMEDOUT', 'ENOTFOUND', 'connection', 'socket', 'net::'];
    const lowerError = errorMsg.toLowerCase();
    if (networkKeywords.some(keyword => lowerError.includes(keyword.toLowerCase()))) {
      return 'network';
    }
    if (lowerError.includes('api') || lowerError.includes('401') || lowerError.includes('403') || lowerError.includes('429')) {
      return 'api';
    }
    return 'unknown';
  };
  // 构建 OpenAI 请求体
  const buildOpenAIRequestBody = (userMessage: string): ChatRequestBody => {
    const messages: LLMessage[] = [];
    const recentMessages = getLatestMessages(10);
    
    // 只保留最近1轮对话（最后一个用户消息和它之前的第一个助手响应）
    let lastUserMessage: LLMessage | null = null;
    let lastAssistantMessage: LLMessage | null = null;
    
    // 从后往前找最后一个用户消息
    for (let i = recentMessages.length - 1; i >= 0; i--) {
      const msg = recentMessages[i];
      if (!msg.canBeContext) continue;
      
      if (msg.type === 'ask') {
        lastUserMessage = { role: 'user', content: msg.content };
        // 继续找这个用户消息之前的助手响应
        for (let j = i - 1; j >= 0; j--) {
          const prevMsg = recentMessages[j];
          if (!prevMsg.canBeContext) continue;
          if (prevMsg.type === 'textResponse') {
            lastAssistantMessage = { role: 'assistant', content: prevMsg.content };
            break;
          }
        }
        break;
      }
    }
    
    // 构建消息数组：先加上一轮历史（如果有），再加当前消息
    if (lastAssistantMessage) {
      messages.push(lastAssistantMessage);
    }
    if (lastUserMessage) {
      messages.push(lastUserMessage);
    }
    
    // 添加当前用户消息
    messages.push({
      role: 'user',
      content: userMessage
    });
    
    return {
      messages,
      max_tokens: 4096,
      temperature: 0.7
    };
  };
  // 重置流式状态
  const resetStreamState = (): void => {
    isStreaming.value = false;
    currentStreamRequestId.value = null;
    streamingMessageId.value = null;
    isFirstChunk.value = false;
    cancelCurrentStream.value = null;
  };
  // 停止当前对话
  const stopCurrentConversation = async (): Promise<void> => {
    if (cancelCurrentStream.value) {
      await cancelCurrentStream.value();
      cancelCurrentStream.value = null;
    }
    if (loadingMessageId.value) {
      deleteCurrentMessageById(loadingMessageId.value);
      loadingMessageId.value = null;
    }
    resetStreamState();
    setWorkingStatus('finish');
  };
  const stopCurrentAgentExecution = async (): Promise<void> => {
    const agentLoadingIds = currentMessageList.value.filter(msg => msg.type === 'loading' && msg.mode === 'agent').map(msg => msg.id);
    agentLoadingIds.forEach(id => deleteCurrentMessageById(id));
    const runningAgentExecutionMessages = currentMessageList.value.filter((msg): msg is AgentExecutionMessage => msg.type === 'agentExecution' && msg.mode === 'agent' && (msg.status === 'running' || msg.status === 'pending'));
    for (const msg of runningAgentExecutionMessages) {
      const nextToolCalls = msg.toolCalls.map(tc => (tc.status === 'running' || tc.status === 'pending' || tc.status === 'waiting-confirm') ? { ...tc, status: 'cancelled' as const } : tc);
      await updateCurrentMessageById(msg.id, { status: 'aborted', isStreaming: false, toolCalls: nextToolCalls });
    }
    setWorkingStatus('finish');
  };
  // 发送 Ask 消息（从输入框读取）
  const sendAskFromInput = async (): Promise<void> => {
    if (mode.value !== 'ask') return;
    if (!isAiConfigValid.value) return;
    if (isStreaming.value) return;
    const message = inputMessage.value;
    inputMessage.value = '';
    lastAskPrompt.value = message;
    const askMessage = createAskMessage(message, 'ask');
    const loadingMessage = createLoadingMessage();
    const requestId = nanoid();
    await addCurrentMessage(askMessage);
    await addCurrentMessage(loadingMessage);
    isStreaming.value = true;
    currentStreamRequestId.value = requestId;
    loadingMessageId.value = loadingMessage.id;
    isFirstChunk.value = true;
    streamingMessageId.value = null;
    setWorkingStatus('working');
    const requestBody = buildOpenAIRequestBody(message);
    if (!llmClientStore.isAvailable()) {
      if (loadingMessageId.value) {
        deleteCurrentMessageById(loadingMessageId.value);
        loadingMessageId.value = null;
      }
      const errorMessage = createErrorMessage(i18n.global.t('AI功能不可用'), message, 'ask');
      void addCurrentMessage(errorMessage);
      resetStreamState();
      setWorkingStatus('finish');
      return;
    }
    try {
      const textDecoder = new TextDecoder('utf-8');
      const streamController = llmClientStore.chatStream(
        requestBody,
        {
          onData: (chunk: Uint8Array) => {
            const chunkStr = textDecoder.decode(chunk, { stream: true });
            handleStreamData(requestId, chunkStr);
          },
          onEnd: () => {
            handleStreamEnd(requestId);
          },
          onError: (err: Error | string) => {
            const errorMsg = err instanceof Error ? err.message : String(err);
            handleStreamError(requestId, errorMsg);
          }
        }
      );
      cancelCurrentStream.value = async () => {
        streamController?.abort();
      };
    } catch (error) {
      if (loadingMessageId.value) {
        deleteCurrentMessageById(loadingMessageId.value);
        loadingMessageId.value = null;
      }
      const errorDetail = error instanceof Error ? error.message : i18n.global.t('未知错误');
      const errorMessage = createErrorMessage(errorDetail, message, 'ask');
      void addCurrentMessage(errorMessage);
      resetStreamState();
      setWorkingStatus('finish');
    }
  };
  // 发送 Ask 消息（指定 prompt）
  const sendAskPrompt = async (prompt: string): Promise<void> => {
    inputMessage.value = prompt;
    await sendAskFromInput();
  };
  // 处理流数据
  const handleStreamData = (requestId: string, chunk: string): void => {
    if (currentStreamRequestId.value !== requestId) return;
    const lines = chunk.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (!trimmed.startsWith('data: ')) {
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
          try {
            const parsed: { code?: number; msg?: string } = JSON.parse(trimmed);
            if (parsed.code && parsed.msg) {
              handleStreamError(requestId, parsed.msg);
              return;
            }
          } catch {
            // 忽略无效JSON
          }
        }
        continue;
      }
      const data = trimmed.substring(6).trim();
      if (data === '[DONE]') continue;
      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) {
          if (isFirstChunk.value && loadingMessageId.value) {
            deleteCurrentMessageById(loadingMessageId.value);
            const timestamp = new Date().toISOString();
            const responseMessageId = nanoid();
            const responseMessage: TextResponseMessage = {
              id: responseMessageId,
              type: 'textResponse',
              content,
              timestamp,
              sessionId: currentSessionId.value,
              mode: 'ask',
              canBeContext: true
            };
            addCurrentMessage(responseMessage);
            streamingMessageId.value = responseMessageId;
            loadingMessageId.value = null;
            isFirstChunk.value = false;
          } else if (streamingMessageId.value) {
            const message = getMessageById(streamingMessageId.value);
            if (message && message.type === 'textResponse') {
              const nextContent = `${message.content}${content}`;
              void updateCurrentMessageById(message.id, { content: nextContent });
            }
          }
        }
      } catch {
        // 忽略解析错误
      }
    }
  };
  // 处理流结束
  const handleStreamEnd = (requestId: string): void => {
    if (currentStreamRequestId.value !== requestId) return;
    if (loadingMessageId.value) {
      deleteCurrentMessageById(loadingMessageId.value);
      loadingMessageId.value = null;
    }
    resetStreamState();
    setWorkingStatus('finish');
  };
  // 处理流错误
  const handleStreamError = (requestId: string, error: string): void => {
    if (currentStreamRequestId.value !== requestId) return;
    if (loadingMessageId.value) {
      deleteCurrentMessageById(loadingMessageId.value);
      loadingMessageId.value = null;
    }
    const timestamp = new Date().toISOString();
    const errorMessageId = nanoid();
    const errorMessage: ErrorMessage = {
      id: errorMessageId,
      type: 'error',
      errorType: detectErrorType(error),
      content: error,
      errorDetail: error,
      originalPrompt: lastAskPrompt.value,
      timestamp,
      sessionId: currentSessionId.value,
      mode: 'ask',
      canBeContext: false
    };
    addCurrentMessage(errorMessage);
    resetStreamState();
    setWorkingStatus('finish');
  };
  // 创建用户消息
  const createAskMessage = (message: string, messageMode: 'agent' | 'ask'): AskMessage => {
    return {
      id: nanoid(),
      type: 'ask',
      content: message,
      timestamp: new Date().toISOString(),
      sessionId: currentSessionId.value,
      mode: messageMode,
      canBeContext: true
    };
  };
  // 创建加载消息
  const createLoadingMessage = (): LoadingMessage => {
    return {
      id: nanoid(),
      type: 'loading',
      content: '',
      timestamp: new Date().toISOString(),
      sessionId: currentSessionId.value,
      mode: 'ask',
      canBeContext: false
    };
  };
  // 创建错误消息
  const createErrorMessage = (error: string, originalPrompt: string, messageMode: 'agent' | 'ask'): ErrorMessage => {
    return {
      id: nanoid(),
      type: 'error',
      errorType: detectErrorType(error),
      content: error,
      errorDetail: error,
      originalPrompt,
      timestamp: new Date().toISOString(),
      sessionId: currentSessionId.value,
      mode: messageMode,
      canBeContext: false
    };
  };
  // 创建新对话
  const handleCreateConversation = async (): Promise<void> => {
    await stopCurrentConversation();
    if (currentMessageList.value.length > 0) {
      createNewSession();
    }
    const nextView = mode.value === 'agent' ? 'agent' : mode.value === 'ask' ? 'chat' : 'agent';
    setCurrentView(nextView);
  };
  // 从历史返回聊天
  const handleBackToChat = (): void => {
    const firstMessage = currentMessageList.value[0];
    const sessionMode = firstMessage?.mode || mode.value;
    mode.value = sessionMode;
    const nextView = sessionMode === 'ask' ? 'chat' : sessionMode === 'agent' ? 'agent' : 'agent';
    setCurrentView(nextView);
  };
  // 选择历史会话
  const handleSelectSession = async (sessionId: string, sessionMode: 'agent' | 'ask'): Promise<void> => {
    await loadSession(sessionId);
    mode.value = sessionMode;
    const nextView = sessionMode === 'ask' ? 'chat' : sessionMode === 'agent' ? 'agent' : 'agent';
    setCurrentView(nextView);
  };
  return {
    currentMessageList,
    currentSessionId,
    isLoadingSessionData,
    workingStatus,
    agentViewDialogVisible,
    currentView,
    mode,
    inputMessage,
    isStreaming,
    currentStreamRequestId,
    streamingMessageId,
    loadingMessageId,
    isFirstChunk,
    lastAskPrompt,
    cancelCurrentStream,
    isAiConfigValid,
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
    switchToChat,
    switchToHistory,
    switchToConfig,
    setMode,
    initMode,
    initView,
    detectErrorType,
    buildOpenAIRequestBody,
    resetStreamState,
    stopCurrentConversation,
    stopCurrentAgentExecution,
    sendAskFromInput,
    sendAskPrompt,
    handleStreamData,
    handleStreamEnd,
    handleStreamError,
    createAskMessage,
    createLoadingMessage,
    createErrorMessage,
    handleCreateConversation,
    handleBackToChat,
    handleSelectSession,
  };
});
