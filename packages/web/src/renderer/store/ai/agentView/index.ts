import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { nanoid } from 'nanoid/non-secure';
import { i18n, detectInputLanguage } from '@/i18n';
import { appStateCache } from '@/cache/appState/appStateCache';
import { useLLMClientStore } from '@/store/ai/llmClientStore';
import { clearConversationCache, getConversationCache, setConversationCache } from '@/cache/ai/agentViewCache';
import type { ChatRequestBody, LLMessage, OpenAiStreamChunk } from '@src/types/ai/agent.type';
import type { ConversationMessage, ConversationMode } from '@src/types/ai';
import type { Language } from '@src/types';

export const useAgentViewStore = defineStore('agentView', () => {
  const llmClientStore = useLLMClientStore();
  const agentViewDialogVisible = ref(false);
  const view = ref<'chat' | 'config'>('chat');
  const mode = ref<ConversationMode>('agent');
  const inputMessage = ref('');
  const workingStatus = ref<'working' | 'finish'>('finish');
  const isStreaming = ref(false);
  const currentStreamRequestId = ref<string | null>(null);
  const streamingMessageId = ref<string | null>(null);
  const loadingMessageId = ref<string | null>(null);
  const isFirstChunk = ref(false);
  const lastAskPrompt = ref('');
  const currentMessageLanguage = ref<Language | null>(null);
  let askStreamBuffer = '';
  const cancelCurrentStream = ref<(() => Promise<void>) | null>(null);
  const agentMessages = ref<ConversationMessage[]>([]);
  const askMessages = ref<ConversationMessage[]>([]);
  let persistTimer: ReturnType<typeof setTimeout> | null = null;
  const isAiConfigValid = computed(() => llmClientStore.isAvailable());
  // 初始化对话缓存
  const initConversationCache = (): void => {
    const cached = getConversationCache();
    if (cached) {
      agentMessages.value = cached.agentMessages;
      askMessages.value = cached.askMessages;
      return;
    }
    agentMessages.value = [];
    askMessages.value = [];
  };
  // 安排对话缓存落盘
  const schedulePersist = (): void => {
    if (persistTimer) {
      clearTimeout(persistTimer);
      persistTimer = null;
    }
    persistTimer = setTimeout(() => {
      setConversationCache(agentMessages.value, askMessages.value);
      persistTimer = null;
    }, 400);
  };
  // 设置工作状态
  const setWorkingStatus = (status: 'working' | 'finish'): void => {
    workingStatus.value = status;
  };
  // 显示弹窗
  const showAgentViewDialog = (): void => {
    agentViewDialogVisible.value = true;
  };
  // 隐藏弹窗
  const hideAgentViewDialog = (): void => {
    agentViewDialogVisible.value = false;
  };
  // 打开设置视图
  const openConfig = (): void => {
    view.value = 'config';
  };
  // 返回对话视图
  const backToChat = (): void => {
    view.value = 'chat';
  };
  // 设置模式
  const setMode = (newMode: ConversationMode): void => {
    mode.value = newMode;
    appStateCache.setAiDialogMode(newMode);
  };
  // 初始化模式
  const initMode = (): void => {
    const cachedMode = appStateCache.getAiDialogMode();
    mode.value = cachedMode === 'agent' || cachedMode === 'ask' ? cachedMode : 'agent';
  };
  // 添加消息
  const addMessage = (targetMode: ConversationMode, message: ConversationMessage): void => {
    if (targetMode === 'agent') {
      agentMessages.value.push(message);
    } else {
      askMessages.value.push(message);
    }
    schedulePersist();
  };
  // 更新消息
  const updateMessage = (targetMode: ConversationMode, messageId: string, updates: Partial<ConversationMessage>): void => {
    const list = targetMode === 'agent' ? agentMessages.value : askMessages.value;
    const index = list.findIndex(item => item.id === messageId);
    if (index < 0) {
      return;
    }
    list[index] = { ...list[index], ...updates } as ConversationMessage;
    schedulePersist();
  };
  // 替换消息
  const replaceMessage = (targetMode: ConversationMode, messageId: string, nextMessage: ConversationMessage): void => {
    const list = targetMode === 'agent' ? agentMessages.value : askMessages.value;
    const index = list.findIndex(item => item.id === messageId);
    if (index < 0) {
      return;
    }
    list[index] = nextMessage;
    schedulePersist();
  };
  // 删除消息
  const deleteMessage = (targetMode: ConversationMode, messageId: string): void => {
    const list = targetMode === 'agent' ? agentMessages.value : askMessages.value;
    const index = list.findIndex(item => item.id === messageId);
    if (index < 0) {
      return;
    }
    list.splice(index, 1);
    schedulePersist();
  };
  // 清空对话
  const clearConversation = async (): Promise<void> => {
    await stopCurrentConversation();
    if (persistTimer) {
      clearTimeout(persistTimer);
      persistTimer = null;
    }
    agentMessages.value = [];
    askMessages.value = [];
    clearConversationCache();
  };
  // 生成问题消息
  const createQuestionMessage = (content: string, language?: Language): ConversationMessage => {
    return { id: nanoid(), kind: 'question', content, createdAt: Date.now(), language };
  };
  // 生成加载消息
  const createLoadingMessage = (): ConversationMessage => {
    return { id: nanoid(), kind: 'loading', content: '', createdAt: Date.now() };
  };
  // 生成响应消息
  const createResponseMessage = (content: string, language?: Language): ConversationMessage => {
    return { id: nanoid(), kind: 'response', content, createdAt: Date.now(), language };
  };
  // 生成错误消息
  const createErrorMessage = (content: string, language?: Language): ConversationMessage => {
    return { id: nanoid(), kind: 'error', content, createdAt: Date.now(), language };
  };
  // 构建 Ask 请求体
  const buildAskRequestBody = (userMessage: string): ChatRequestBody => {
    const messages: LLMessage[] = [];
    const recent = askMessages.value.slice(-10);
    let lastQuestion: LLMessage | null = null;
    let lastResponse: LLMessage | null = null;
    for (let i = recent.length - 1; i >= 0; i -= 1) {
      const msg = recent[i];
      if (msg.kind === 'question') {
        lastQuestion = { role: 'user', content: msg.content };
        for (let j = i - 1; j >= 0; j -= 1) {
          const prev = recent[j];
          if (prev.kind === 'response') {
            lastResponse = { role: 'assistant', content: prev.content };
            break;
          }
        }
        break;
      }
    }
    if (lastResponse) {
      messages.push(lastResponse);
    }
    if (lastQuestion) {
      messages.push(lastQuestion);
    }
    messages.push({ role: 'user', content: userMessage });
    return { messages, max_tokens: 4096, temperature: 0.7 };
  };
  // 重置流状态
  const resetStreamState = (): void => {
    isStreaming.value = false;
    currentStreamRequestId.value = null;
    streamingMessageId.value = null;
    isFirstChunk.value = false;
    askStreamBuffer = '';
    cancelCurrentStream.value = null;
  };
  // 停止 Ask 流式对话
  const stopCurrentConversation = async (): Promise<void> => {
    if (cancelCurrentStream.value) {
      await cancelCurrentStream.value();
      cancelCurrentStream.value = null;
    }
    if (loadingMessageId.value) {
      deleteMessage('ask', loadingMessageId.value);
      loadingMessageId.value = null;
    }
    resetStreamState();
    setWorkingStatus('finish');
  };
  // 停止 Agent 执行展示
  const stopCurrentAgentExecution = (): void => {
    const cancelNotice = i18n.global.t('已取消本次操作（内容可能不完整）。');
    for (let i = agentMessages.value.length - 1; i >= 0; i -= 1) {
      const msg = agentMessages.value[i];
      if (msg.kind === 'tool-call' && msg.status === 'loading') {
        agentMessages.value[i] = {
          ...msg,
          status: 'error',
          toolCall: { ...msg.toolCall, error: i18n.global.t('已取消本次操作。') },
        };
      }
    }
    for (let i = agentMessages.value.length - 1; i >= 0; i -= 1) {
      const msg = agentMessages.value[i];
      if (msg.kind !== 'thinking') {
        continue;
      }
      const nextContent = msg.content.includes(cancelNotice)
        ? msg.content
        : (msg.content.trim() ? `${msg.content}\n\n${cancelNotice}` : cancelNotice);
      agentMessages.value[i] = { ...msg, kind: 'response', content: nextContent };
      schedulePersist();
      return;
    }
    addMessage('agent', createResponseMessage(cancelNotice));
  };
  // 处理流数据
  const handleStreamData = (requestId: string, chunk: string): void => {
    if (currentStreamRequestId.value !== requestId) {
      return;
    }
    const combined = `${askStreamBuffer}${chunk}`;
    const lines = combined.split('\n');
    askStreamBuffer = lines.pop() ?? '';
    for (const rawLine of lines) {
      const trimmed = rawLine.trim();
      if (!trimmed || trimmed === 'data: [DONE]') {
        continue;
      }
      if (!trimmed.startsWith('data:')) {
        continue;
      }
      const data = trimmed.replace(/^data:\s*/, '');
      try {
        const parsed = JSON.parse(data) as OpenAiStreamChunk;
        const content = parsed.choices?.[0]?.delta?.content;
        if (!content) {
          continue;
        }
        if (isFirstChunk.value && loadingMessageId.value) {
          deleteMessage('ask', loadingMessageId.value);
          const responseId = nanoid();
          const response: ConversationMessage = { 
            id: responseId, 
            kind: 'response', 
            content, 
            createdAt: Date.now(),
            language: currentMessageLanguage.value || undefined
          };
          addMessage('ask', response);
          streamingMessageId.value = responseId;
          loadingMessageId.value = null;
          isFirstChunk.value = false;
          continue;
        }
        if (streamingMessageId.value) {
          const list = askMessages.value;
          const index = list.findIndex(item => item.id === streamingMessageId.value);
          const current = index >= 0 ? list[index] : null;
          if (current && current.kind === 'response') {
            updateMessage('ask', current.id, { content: `${current.content}${content}` });
          }
        }
      } catch {
        // 忽略解析错误
      }
    }
  };
  // 处理流结束
  const handleStreamEnd = (requestId: string): void => {
    if (currentStreamRequestId.value !== requestId) {
      return;
    }
    if (loadingMessageId.value) {
      deleteMessage('ask', loadingMessageId.value);
      loadingMessageId.value = null;
    }
    resetStreamState();
    setWorkingStatus('finish');
  };
  // 处理流错误
  const handleStreamError = (requestId: string, error: string): void => {
    if (currentStreamRequestId.value !== requestId) {
      return;
    }
    if (loadingMessageId.value) {
      deleteMessage('ask', loadingMessageId.value);
      loadingMessageId.value = null;
    }
    addMessage('ask', createErrorMessage(error));
    resetStreamState();
    setWorkingStatus('finish');
  };
  // 发送 Ask 消息（从输入框读取）
  const sendAskFromInput = async (): Promise<void> => {
    if (mode.value !== 'ask') {
      return;
    }
    if (!isAiConfigValid.value) {
      return;
    }
    if (isStreaming.value) {
      return;
    }
    const message = inputMessage.value;
    inputMessage.value = '';
    lastAskPrompt.value = message;
    const currentInterfaceLocale = i18n.global.locale.value as Language;
    const detectedLanguage = detectInputLanguage(message, currentInterfaceLocale);
    currentMessageLanguage.value = detectedLanguage;
    const question = createQuestionMessage(message, detectedLanguage);
    const loading = createLoadingMessage();
    const requestId = nanoid();
    addMessage('ask', question);
    addMessage('ask', loading);
    isStreaming.value = true;
    currentStreamRequestId.value = requestId;
    loadingMessageId.value = loading.id;
    isFirstChunk.value = true;
    streamingMessageId.value = null;
    setWorkingStatus('working');
    const requestBody = buildAskRequestBody(message);
    if (!llmClientStore.isAvailable()) {
      if (loadingMessageId.value) {
        deleteMessage('ask', loadingMessageId.value);
        loadingMessageId.value = null;
      }
      addMessage('ask', createErrorMessage(i18n.global.t('AI功能不可用')));
      resetStreamState();
      setWorkingStatus('finish');
      return;
    }
    const textDecoder = new TextDecoder('utf-8');
    const streamController = llmClientStore.chatStream(
      requestBody,
      {
        onData: (chunk: Uint8Array) => {
          const chunkStr = textDecoder.decode(chunk, { stream: true });
          handleStreamData(requestId, chunkStr);
        },
        onEnd: () => {
          handleStreamData(requestId, textDecoder.decode());
          handleStreamEnd(requestId);
        },
        onError: (err: Error | string) => {
          const errorMsg = err instanceof Error ? err.message : String(err);
          handleStreamError(requestId, errorMsg);
        },
      }
    );
    cancelCurrentStream.value = async () => {
      streamController?.abort();
    };
  };
  // 发送 Ask 消息（指定 prompt）
  const sendAskPrompt = async (prompt: string): Promise<void> => {
    inputMessage.value = prompt;
    await sendAskFromInput();
  };
  initMode();
  initConversationCache();
  return {
    agentViewDialogVisible,
    view,
    mode,
    inputMessage,
    workingStatus,
    isStreaming,
    lastAskPrompt,
    agentMessages,
    askMessages,
    isAiConfigValid,
    setWorkingStatus,
    showAgentViewDialog,
    hideAgentViewDialog,
    openConfig,
    backToChat,
    setMode,
    clearConversation,
    addMessage,
    updateMessage,
    replaceMessage,
    deleteMessage,
    createQuestionMessage,
    createResponseMessage,
    createErrorMessage,
    stopCurrentConversation,
    stopCurrentAgentExecution,
    sendAskFromInput,
    sendAskPrompt,
  };
});
