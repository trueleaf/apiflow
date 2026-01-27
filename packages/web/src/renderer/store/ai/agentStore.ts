import { defineStore } from 'pinia';
import { nanoid } from 'nanoid/non-secure';
import { useProjectWorkbench } from '@/store/projectWorkbench/projectWorkbenchStore';
import { useProjectNav } from '@/store/projectWorkbench/projectNavStore';
import { useVariable } from '@/store/projectWorkbench/variablesStore';
import { useLLMClientStore } from '@/store/ai/llmClientStore';
import { useAgentViewStore } from '@/store/ai/agentView';
import { openaiTools, rawTools, getToolSummaries, getToolsByNames } from '@/store/ai/tools/tools';
import { config } from '@src/config/config';
import type { CommonResponse, Language } from '@src/types';
import type { OpenAiToolDefinition, ConversationMessage, ConversationToolCallTokenUsage } from '@src/types/ai';
import type { ChatRequestBody, LLMessage, OpenAiResponseBody, OpenAiStreamChunk, OpenAiToolCall, ToolCallChunk } from '@src/types/ai/agent.type';
import { agentSystemPrompt, toolSelectionSystemPrompt } from '@/store/ai/prompt/prompt';
import { i18n, detectInputLanguage, translateWithLocale } from '@/i18n';

export const useAgentStore = defineStore('agent', () => {
  let agentAbortController: AbortController | null = null;
  const checkAborted = (signal?: AbortSignal) => {
    if (signal?.aborted) {
      throw new Error('AGENT_ABORTED');
    }
  };
  const buildAgentContext = () => {
    const projectWorkbench = useProjectWorkbench();
    const variableStore = useVariable();
    const projectNavStore = useProjectNav();
    const projectId = projectWorkbench.projectId;
    const projectName = projectWorkbench.projectName;
    const activeNav = projectNavStore.currentSelectNav;
    const variables = variableStore.variables.map((item) => ({
      id: item._id,
      name: item.name,
      value: item.value,
      type: item.type,
    }));
    return {
      project: projectId ? { id: projectId, name: projectName } : null,
      variables,
      activeTab: activeNav ? { id: activeNav._id, label: activeNav.label, type: activeNav.tabType } : null,
    };
  };
  const buildHistoryMessages = (): LLMessage[] => {
    const agentViewStore = useAgentViewStore();
    const recentMessages = agentViewStore.agentMessages.slice(-50);
    const historyMessages: LLMessage[] = [];
    const maxConversations = 10;
    const conversations: Array<{ user: LLMessage; assistant?: LLMessage }> = [];
    for (let i = recentMessages.length - 1; i >= 0 && conversations.length < maxConversations; i -= 1) {
      const msg = recentMessages[i];
      if (msg.kind !== 'question') {
        continue;
      }
      const userMsg: LLMessage = { role: 'user', content: msg.content };
      let assistantMsg: LLMessage | undefined;
      for (let j = i - 1; j >= 0; j -= 1) {
        const prevMsg = recentMessages[j];
        if (prevMsg.kind === 'response') {
          assistantMsg = { role: 'assistant', content: prevMsg.content };
          break;
        }
        if (prevMsg.kind === 'question') {
          break;
        }
      }
      conversations.push({ user: userMsg, assistant: assistantMsg });
    }
    conversations.reverse();
    for (const conv of conversations) {
      if (conv.assistant) {
        historyMessages.push(conv.assistant);
      }
      historyMessages.push(conv.user);
    }
    return historyMessages;
  };
  // 合并流式 tool_calls 增量数据
  const mergeToolCallsDelta = (toolCalls: OpenAiToolCall[], deltaCalls: ToolCallChunk[]) => {
    for (let i = 0; i < deltaCalls.length; i += 1) {
      const delta = deltaCalls[i];
      const index = delta.index;
      const current = toolCalls[index] ?? { id: '', type: 'function', function: { name: '', arguments: '' } };
      if (delta.id) {
        current.id = delta.id;
      }
      if (delta.type) {
        current.type = delta.type;
      }
      const fn = delta.function;
      if (fn?.name) {
        current.function.name = fn.name;
      }
      if (fn?.arguments) {
        current.function.arguments = `${current.function.arguments}${fn.arguments}`;
      }
      toolCalls[index] = current;
    }
  };
  const selectToolsByLLM = async (params: { prompt: string; contextText: string; historyMessages: LLMessage[]; signal?: AbortSignal; targetLocale: Language }): Promise<{ tools: OpenAiToolDefinition[]; totalTokens: number; toolNames: string[]; fallbackReason?: string }> => {
    const { prompt, contextText, historyMessages, signal, targetLocale } = params;
    const llmClientStore = useLLMClientStore();
    checkAborted(signal);
    const toolListText = JSON.stringify(getToolSummaries());
    const messages: LLMessage[] = [
      { role: 'system', content: toolSelectionSystemPrompt },
      { role: 'system', content: `${translateWithLocale('可用工具列表', targetLocale)}：${toolListText}` },
      { role: 'system', content: contextText },
      ...historyMessages,
      { role: 'user', content: `${translateWithLocale('用户意图', targetLocale)}：${prompt}` },
    ];
    try {
      const response = await llmClientStore.chat({ messages, response_format: { type: 'json_object' } }, signal);
      checkAborted(signal);
      const content = response.choices[0]?.message?.content?.trim() || '';
      const parsed: unknown = JSON.parse(content);
      const toolsField: unknown = Array.isArray(parsed)
        ? parsed
        : (typeof parsed === 'object' && parsed !== null && 'tools' in parsed)
          ? (parsed as { tools?: unknown }).tools
          : null;
      const toolNames = Array.isArray(toolsField)
        ? toolsField.filter((name): name is string => typeof name === 'string' && name.length > 0)
        : [];
      const totalTokens = response.usage?.total_tokens || 0;
      if (!Array.isArray(toolNames) || toolNames.length === 0) {
        return { tools: openaiTools, totalTokens, toolNames: [], fallbackReason: translateWithLocale('工具选择结果为空', targetLocale) };
      }
      const selectedTools = getToolsByNames(toolNames);
      if (selectedTools.length === 0) {
        return { tools: openaiTools, totalTokens, toolNames, fallbackReason: translateWithLocale('工具不存在', targetLocale) };
      }
      // 限制工具数量，避免context过长影响性能
      const maxTools = config.renderConfig.agentConfig.maxToolsPerCall;
      if (selectedTools.length > maxTools) {
        // 定义高优先级工具（搜索、获取详情等基础操作）
        const priorityToolNames = [
          'searchNodes', 'getChildNodes', 'getHttpNodeDetail', 'getWebsocketNodeDetail',
          'getHttpMockNodeDetail', 'getWebsocketMockNodeDetail', 'getVariables',
          'navigateToProject', 'getCurrentProjectInfo', 'getProjectList'
        ];
        // 先保留高优先级工具，再按原顺序补充到最大数量
        const priorityTools = selectedTools.filter(t => priorityToolNames.includes(t.function.name));
        const otherTools = selectedTools.filter(t => !priorityToolNames.includes(t.function.name));
        const limitedTools = [...priorityTools, ...otherTools].slice(0, maxTools);
        return { tools: limitedTools, totalTokens, toolNames: limitedTools.map(t => t.function.name) };
      }
      return { tools: selectedTools, totalTokens, toolNames };
    } catch (err) {
      if (err instanceof Error && err.message === 'AGENT_ABORTED') {
        throw err;
      }
      return { tools: openaiTools, totalTokens: 0, toolNames: [], fallbackReason: err instanceof Error ? err.message : String(err) };
    }
  };
  const createThinkingMessage = (content: string, language?: Language): ConversationMessage => {
    return { id: nanoid(), kind: 'thinking', content, createdAt: Date.now(), language };
  };
  const executeToolCall = async (params: { toolCall: OpenAiToolCall; toolIndex: number; thinkingId: string; llmOutput?: string; tokenUsage?: ConversationToolCallTokenUsage; signal?: AbortSignal; targetLocale: Language; messages: LLMessage[] }): Promise<void> => {
    const { toolCall, toolIndex, thinkingId, llmOutput, tokenUsage, signal, targetLocale, messages } = params;
    const agentViewStore = useAgentViewStore();
    checkAborted(signal);
    const toolName = toolCall.function.name;
    const messageId = toolIndex === 0 ? thinkingId : (toolCall.id || nanoid());
    let args: Record<string, unknown> = {};
    try {
      const parsedArgs: unknown = JSON.parse(toolCall.function.arguments || '{}');
      if (parsedArgs && typeof parsedArgs === 'object' && !Array.isArray(parsedArgs)) {
        args = parsedArgs as Record<string, unknown>;
      }
    } catch (error) {
      const parseError = translateWithLocale('工具参数解析失败', targetLocale, { error: error instanceof Error ? error.message : String(error) });
      agentViewStore.replaceMessage('agent', thinkingId, {
        id: messageId,
        kind: 'tool-call',
        content: toolName,
        createdAt: Date.now(),
        status: 'error',
        toolCall: { toolName, arguments: {}, error: parseError },
        tokenUsage,
        llmOutput,
        language: targetLocale,
      });
      messages.push({ role: 'tool', content: parseError, tool_call_id: toolCall.id });
      return;
    }
    const toolMessage: ConversationMessage = {
      id: messageId,
      kind: 'tool-call',
      content: toolName,
      createdAt: Date.now(),
      status: 'loading',
      toolCall: { toolName, arguments: args },
      tokenUsage,
      llmOutput,
      language: targetLocale,
    };
    if (toolIndex === 0) {
      agentViewStore.replaceMessage('agent', thinkingId, toolMessage);
    } else {
      agentViewStore.addMessage('agent', toolMessage);
    }
    const tool = rawTools.find(t => t.name === toolName);
    if (!tool) {
      const errorMsg = translateWithLocale('工具不存在', targetLocale, { name: toolName });
      agentViewStore.updateMessage('agent', messageId, { status: 'error', toolCall: { toolName, arguments: args, error: errorMsg } });
      messages.push({ role: 'tool', content: errorMsg, tool_call_id: toolCall.id });
      return;
    }
    try {
      const result = await tool.execute({ ...args, _targetLanguage: targetLocale });
      checkAborted(signal);
      const resultText = result.code === 0
        ? `${translateWithLocale('执行成功', targetLocale)}：${JSON.stringify(result.data)}`
        : `${translateWithLocale('执行失败', targetLocale)}：${JSON.stringify(result.data)}`;
      agentViewStore.updateMessage('agent', messageId, {
        status: result.code === 0 ? 'success' : 'error',
        toolCall: result.code === 0
          ? { toolName, arguments: args, result: resultText }
          : { toolName, arguments: args, error: resultText },
      });
      messages.push({ role: 'tool', content: resultText, tool_call_id: toolCall.id });
    } catch (err) {
      if (err instanceof Error && err.message === 'AGENT_ABORTED') {
        throw err;
      }
      const errorText = `${translateWithLocale('工具执行异常', targetLocale)}：${err instanceof Error ? err.message : String(err)}`;
      agentViewStore.updateMessage('agent', messageId, { status: 'error', toolCall: { toolName, arguments: args, error: errorText } });
      messages.push({ role: 'tool', content: errorText, tool_call_id: toolCall.id });
    }
  };
  const executeAgentLoop = async (params: { messages: LLMessage[]; tools: OpenAiToolDefinition[]; signal?: AbortSignal; targetLocale: Language }): Promise<{ content: string; needFallback: boolean; hasToolCalls: boolean }> => {
    const { messages, tools, signal, targetLocale } = params;
    const agentViewStore = useAgentViewStore();
    const llmClientStore = useLLMClientStore();
    let hasToolCalls = false;
    checkAborted(signal);
    for (let iteration = 0; iteration < config.renderConfig.agentConfig.maxIterations; iteration += 1) {
      checkAborted(signal);
      const thinkingId = nanoid();
      agentViewStore.addMessage('agent', { id: thinkingId, kind: 'thinking', content: translateWithLocale('正在分析问题...', targetLocale), createdAt: Date.now(), language: targetLocale });
      const streamResult = await new Promise<{ content: string; toolCalls: OpenAiToolCall[]; finishReason: OpenAiResponseBody['choices'][number]['finish_reason'] | null }>((resolve, reject) => {
        const decoder = new TextDecoder('utf-8');
        let streamBuffer = '';
        let content = '';
        let finishReason: OpenAiResponseBody['choices'][number]['finish_reason'] | null = null;
        const toolCalls: OpenAiToolCall[] = [];
        let isResolved = false;
        const body: ChatRequestBody = { messages, tools };
        const parseSseChunk = (chunkText: string) => {
          const combined = `${streamBuffer}${chunkText}`;
          const lines = combined.split('\n');
          streamBuffer = lines.pop() ?? '';
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
              const choice = parsed.choices?.[0];
              if (choice?.finish_reason !== undefined) {
                finishReason = choice.finish_reason ?? null;
              }
              const delta = choice?.delta;
              const deltaContent = delta?.content;
              if (deltaContent) {
                content = `${content}${deltaContent}`;
                agentViewStore.updateMessage('agent', thinkingId, { content });
              }
              const deltaToolCalls = delta?.tool_calls;
              if (deltaToolCalls?.length) {
                mergeToolCallsDelta(toolCalls, deltaToolCalls);
              }
            } catch {
              // 忽略解析错误
            }
          }
        };
        let streamController: { abort: () => void } | null = null;
        const abortBySignal = () => {
          if (isResolved) {
            return;
          }
          streamController?.abort();
          isResolved = true;
          reject(new Error('AGENT_ABORTED'));
        };
        if (signal) {
          if (signal.aborted) {
            abortBySignal();
            return;
          }
          signal.addEventListener('abort', abortBySignal, { once: true });
        }
        streamController = llmClientStore.chatStream(
          body,
          {
            onData: (chunk: Uint8Array) => {
              if (isResolved) {
                return;
              }
              try {
                checkAborted(signal);
              } catch (err) {
                abortBySignal();
                return;
              }
              const text = decoder.decode(chunk, { stream: true });
              parseSseChunk(text);
            },
            onEnd: () => {
              if (isResolved) {
                return;
              }
              try {
                parseSseChunk(decoder.decode());
              } catch {
                // 忽略解码尾部错误
              }
              if (signal) {
                signal.removeEventListener('abort', abortBySignal);
              }
              isResolved = true;
              const resolvedToolCalls = toolCalls.filter(item => item.function?.name);
              resolve({ content, toolCalls: resolvedToolCalls, finishReason });
            },
            onError: (err: Error | string) => {
              if (isResolved) {
                return;
              }
              if (signal) {
                signal.removeEventListener('abort', abortBySignal);
              }
              isResolved = true;
              reject(err instanceof Error ? err : new Error(String(err)));
            },
          }
        );
      });
      checkAborted(signal);
      const messageContent = streamResult.content || '';
      const finishReason = streamResult.finishReason;
      if (finishReason !== 'tool_calls' || streamResult.toolCalls.length === 0) {
        const finalContent = messageContent || translateWithLocale('任务已完成', targetLocale);
        // 验证回复语言是否与用户输入匹配
        if (finalContent.length > 10) {
          const currentInterfaceLocale = i18n.global.locale.value as Language;
          const replyLanguage = detectInputLanguage(finalContent, currentInterfaceLocale);
          if (replyLanguage !== targetLocale) {
            console.warn(`[Agent] 语言不匹配警告: 期望 ${targetLocale}, 实际检测到 ${replyLanguage}`);
          }
        }
        agentViewStore.replaceMessage('agent', thinkingId, { id: thinkingId, kind: 'response', content: finalContent, createdAt: Date.now(), language: targetLocale });
        const needFallback = !hasToolCalls && finalContent.length < 10;
        return { content: finalContent, needFallback, hasToolCalls };
      }
      hasToolCalls = true;
      messages.push({ role: 'assistant', content: messageContent, tool_calls: streamResult.toolCalls });
      const llmOutput = messageContent || undefined;
      for (let i = 0; i < streamResult.toolCalls.length; i += 1) {
        await executeToolCall({
          toolCall: streamResult.toolCalls[i],
          toolIndex: i,
          thinkingId,
          llmOutput,
          tokenUsage: undefined,
          signal,
          targetLocale,
          messages,
        });
      }
    }
    const timeoutText = translateWithLocale('已达到最大迭代次数，Agent 停止执行。', targetLocale);
    agentViewStore.addMessage('agent', { id: nanoid(), kind: 'response', content: timeoutText, createdAt: Date.now(), language: targetLocale });
    return { content: timeoutText, needFallback: false, hasToolCalls: true };
  };
  const stopAgent = () => {
    if (agentAbortController) {
      agentAbortController.abort();
      agentAbortController = null;
    }
  };
  const runAgent = async (params: { prompt: string }): Promise<CommonResponse<string>> => {
    const { prompt } = params;
    agentAbortController = new AbortController();
    const signal = agentAbortController.signal;
    const agentViewStore = useAgentViewStore();
    const currentInterfaceLocale = i18n.global.locale.value as Language;
    const detectedLocale = detectInputLanguage(prompt, currentInterfaceLocale);
    const context = buildAgentContext();
    const languageMap: Record<Language, string> = {
      'zh-cn': 'Chinese',
      'zh-tw': 'Traditional Chinese',
      'en': 'English',
      'ja': 'Japanese',
    };
    const contextText = `[Context (Read-only)] The following information comes from ApiFlow's current interface state, used to assist tool parameter filling and reduce back-and-forth questions.
Rules:
- Don't fabricate IDs (projectId/nodeId/folderId), prioritize reading from here; if null, ask user or use search/detail tools to locate first.
- When activeTab is not null, you can usually use activeTab.id directly as nodeId; combine with activeTab.type to determine node type.
- When projectId is needed (e.g., creating nodes/starting-stopping Mock/starting services), prioritize using project.id; if null, prompt user to select/open project first.
JSON: ${JSON.stringify({ project: context.project, activeTab: context.activeTab, variables: context.variables })}`;
    const historyMessages = buildHistoryMessages();
    const messages: LLMessage[] = [
      { role: 'system', content: agentSystemPrompt },
      { role: 'system', content: `[User's Preferred Language: ${languageMap[detectedLocale]}]` },
      { role: 'system', content: contextText },
      ...historyMessages,
      { role: 'user', content: prompt },
    ];
    const toolSelectionThinking = createThinkingMessage(translateWithLocale('正在分析需求并选择工具...', detectedLocale), detectedLocale);
    agentViewStore.addMessage('agent', toolSelectionThinking);
    try {
      const toolSelection = await selectToolsByLLM({ prompt, contextText, historyMessages, signal, targetLocale: detectedLocale });
      const selectedToolNames = toolSelection.toolNames.length > 0 ? toolSelection.toolNames : toolSelection.tools.map(t => t.function.name);
      const toolGroupContent = toolSelection.fallbackReason
        ? `${translateWithLocale('已启用所有基础工具', detectedLocale, { count: toolSelection.tools.length })}\n\n${translateWithLocale('失败原因', detectedLocale)}：${toolSelection.fallbackReason}`
        : translateWithLocale('已挑选工具', detectedLocale, { count: toolSelection.tools.length });
      agentViewStore.replaceMessage('agent', toolSelectionThinking.id, {
        id: toolSelectionThinking.id,
        kind: 'tool-group',
        content: toolGroupContent,
        createdAt: Date.now(),
        toolGroup: {
          tools: selectedToolNames,
          iteration: 1,
          status: 'completed',
        },
        language: detectedLocale,
      });
      const result = await executeAgentLoop({ messages, tools: toolSelection.tools, signal, targetLocale: detectedLocale });
      agentAbortController = null;
      return { code: 0, msg: '', data: result.content };
    } catch (err) {
      const isAborted = err instanceof Error && err.message === 'AGENT_ABORTED';
      agentAbortController = null;
      if (isAborted) {
        return { code: -2, msg: '', data: '' };
      }
      const errorMessage = err instanceof Error ? err.message : String(err);
      agentViewStore.addMessage('agent', { id: nanoid(), kind: 'error', content: `${translateWithLocale('Agent 执行失败', detectedLocale)}：${errorMessage}`, createdAt: Date.now(), language: detectedLocale });
      return { code: -1, msg: errorMessage, data: '' };
    }
  };
  return {
    stopAgent,
    runAgent,
  };
});
