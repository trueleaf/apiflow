import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { nanoid } from 'nanoid/non-secure';
import { config } from '@src/config/config';
import { useAgentToolsStore } from './agentToolsStore';
import { useLLMProvider } from './llmProviderStore';
import type {
  AgentStep,
  AgentStatus,
  LLMessage,
  OpenAiResponseBodyWithTools,
  ToolMessage,
  LLMessageWithToolCalls,
} from '@src/types/ai/agent.type';

const SYSTEM_PROMPT = `你是一个专业的 API 开发助手，可以帮助用户管理和测试 API 接口。你可以使用提供的工具来执行各种操作。

当用户请求你执行某个操作时，请先思考需要使用哪些工具，然后逐步执行。每次只调用一个工具，等待结果后再决定下一步操作。

可用的工具包括：

【HTTP 请求操作】
- send_http_request: 发送当前的 HTTP 请求
- set_http_url: 设置请求 URL
- set_http_method: 设置请求方法
- set_http_json_body: 设置 JSON 请求体
- set_http_headers: 设置请求头
- set_http_query_params: 设置查询参数
- set_http_formdata_body: 设置 FormData 请求体
- set_http_urlencoded_body: 设置 URL 编码请求体
- set_http_raw_body: 设置原始请求体
- get_current_request_info: 获取当前请求信息
- get_response_details: 获取响应详情
- get_response_headers: 获取响应头
- save_current_api: 保存当前 API

【节点管理】
- create_node: 创建新节点（支持 http/websocket/httpMock/websocketMock/folder）
- delete_node: 删除指定节点
- get_node_details: 获取节点详情
- search_nodes: 搜索节点（按名称/URL/类型）
- update_node_name: 更新节点名称
- list_api_nodes: 列出所有 API 节点
- open_api_node: 打开指定节点

【变量管理】
- get_variable: 获取变量值
- set_variable: 设置变量值
- list_variables: 列出所有变量

【Cookie 管理】
- list_cookies: 列出所有 Cookies
- add_cookie: 添加 Cookie
- delete_cookie: 删除 Cookie

【WebSocket 操作】
- set_websocket_url: 设置 WebSocket URL
- get_current_websocket_info: 获取当前 WebSocket 信息
- save_current_websocket: 保存 WebSocket 节点

【Mock 服务操作】
- set_http_mock_config: 设置 HTTP Mock 配置
- get_current_http_mock_info: 获取当前 HTTP Mock 信息
- save_current_http_mock: 保存 HTTP Mock 节点
- set_websocket_mock_config: 设置 WebSocket Mock 配置
- get_current_websocket_mock_info: 获取当前 WebSocket Mock 信息
- save_current_websocket_mock: 保存 WebSocket Mock 节点

【历史记录】
- list_send_history: 列出发送历史
- search_send_history: 搜索发送历史
- list_common_headers: 列出公共请求头

在回答时请简洁明了，完成任务后给出清晰的总结。`;

export const useReactAgentStore = defineStore('reactAgent', () => {
  const agentToolsStore = useAgentToolsStore();
  const llmProviderStore = useLLMProvider();
  const status = ref<AgentStatus>('idle');
  const steps = ref<AgentStep[]>([]);
  const messages = ref<(LLMessage | LLMessageWithToolCalls | ToolMessage)[]>([]);
  const currentIteration = ref(0);
  const errorMessage = ref<string | null>(null);
  const maxIterations = computed(() => config.renderConfig.agentConfig.maxReactIterations);
  // 重置 Agent 状态
  const reset = () => {
    status.value = 'idle';
    steps.value = [];
    messages.value = [];
    currentIteration.value = 0;
    errorMessage.value = null;
  };
  // 添加一个步骤
  const addStep = (step: Omit<AgentStep, 'id' | 'timestamp'>): AgentStep => {
    const newStep: AgentStep = {
      ...step,
      id: nanoid(),
      timestamp: new Date().toISOString(),
      status: step.status ?? 'completed',
    };
    steps.value.push(newStep);
    return newStep;
  };
  // 更新步骤状态
  const updateStepStatus = (stepId: string, status: AgentStep['status']) => {
    const step = steps.value.find((s) => s.id === stepId);
    if (step) {
      step.status = status;
    }
  };
  // 调用 LLM（非流式，支持 function call）
  const callLLM = async (): Promise<OpenAiResponseBodyWithTools> => {
    const providerSettings = llmProviderStore.activeProvider;
    if (!providerSettings) {
      throw new Error('未配置 LLM 提供商');
    }
    if (!window.electronAPI?.aiManager) {
      throw new Error('AI Manager 未初始化');
    }
    const requestBody = {
      model: providerSettings.model,
      messages: messages.value as LLMessage[],
      tools: agentToolsStore.getToolDefinitions(),
      stream: false,
    };
    return window.electronAPI.aiManager.chat(requestBody);
  };
  // 处理工具调用
  const handleToolCalls = async (toolCalls: LLMessageWithToolCalls['tool_calls']) => {
    if (!toolCalls || toolCalls.length === 0) return;
    for (const toolCall of toolCalls) {
      const toolName = toolCall.function.name;
      let toolArgs: Record<string, unknown> = {};
      try {
        toolArgs = JSON.parse(toolCall.function.arguments);
      } catch {
        toolArgs = {};
      }
      addStep({
        type: 'tool_call',
        content: `调用工具: ${toolName}`,
        toolName,
        toolArgs,
        needConfirmation: agentToolsStore.isToolRequireConfirmation(toolName),
      });
      // 检查是否需要确认
      if (agentToolsStore.isToolRequireConfirmation(toolName) && config.renderConfig.agentConfig.requireConfirmation) {
        status.value = 'waiting_confirmation';
        agentToolsStore.pendingToolCall = { name: toolName, args: toolArgs };
        // 等待用户确认，这里需要外部调用 confirmToolExecution 或 rejectToolExecution
        return;
      }
      // 直接执行工具
      await executeToolAndContinue(toolCall.id, toolName, toolArgs);
    }
  };
  // 执行工具并继续循环
  const executeToolAndContinue = async (
    toolCallId: string,
    toolName: string,
    toolArgs: Record<string, unknown>
  ) => {
    status.value = 'calling';
    const result = await agentToolsStore.executeTool(toolName, toolArgs, true);
    addStep({
      type: 'tool_result',
      content: result.success ? JSON.stringify(result.data) : result.error || '执行失败',
      toolName,
      toolResult: result,
    });
    // 将工具结果添加到消息中
    const toolMessage: ToolMessage = {
      role: 'tool',
      tool_call_id: toolCallId,
      content: JSON.stringify(result),
    };
    messages.value.push(toolMessage);
    // 继续循环
    await continueLoop();
  };
  // 继续 ReAct 循环
  const continueLoop = async () => {
    currentIteration.value += 1;
    if (currentIteration.value >= maxIterations.value) {
      status.value = 'error';
      errorMessage.value = `已达到最大迭代次数 (${maxIterations.value})`;
      addStep({
        type: 'final_answer',
        content: errorMessage.value,
      });
      return;
    }
    status.value = 'thinking';
    try {
      const response = await callLLM();
      const choice = response.choices[0];
      if (!choice) {
        throw new Error('LLM 返回空响应');
      }
      const assistantMessage = choice.message;
      messages.value.push(assistantMessage);
      // 检查是否有工具调用
      if (choice.finish_reason === 'tool_calls' && assistantMessage.tool_calls) {
        if (assistantMessage.content) {
          addStep({
            type: 'thinking',
            content: assistantMessage.content,
          });
        }
        await handleToolCalls(assistantMessage.tool_calls);
      } else {
        // 没有工具调用，Agent 完成
        status.value = 'finished';
        addStep({
          type: 'final_answer',
          content: assistantMessage.content || '',
        });
      }
    } catch (error) {
      status.value = 'error';
      errorMessage.value = error instanceof Error ? error.message : String(error);
      addStep({
        type: 'final_answer',
        content: `错误: ${errorMessage.value}`,
      });
    }
  };
  // 当前 working 步骤的 ID（用于后续更新状态）
  const workingStepId = ref<string | null>(null);
  // 运行 Agent
  const runAgent = async (userMessage: string) => {
    reset();
    status.value = 'thinking';
    // 添加 working 步骤，状态为 running
    const workingStep = addStep({
      type: 'working',
      content: userMessage,
      status: 'running',
    });
    workingStepId.value = workingStep.id;
    // 初始化消息列表
    messages.value = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ];
    await continueLoop();
    // Agent 完成后，更新 working 步骤状态
    if (workingStepId.value) {
      const finalStatus = status.value as AgentStatus;
      updateStepStatus(workingStepId.value, finalStatus === 'error' ? 'error' : 'completed');
      workingStepId.value = null;
    }
  };
  // 用户确认执行工具
  const confirmToolExecution = async () => {
    const pending = agentToolsStore.pendingToolCall;
    if (!pending) return;
    const toolCallId = `call_${nanoid()}`;
    // 将 assistant 消息添加到消息列表
    const assistantMessage: LLMessageWithToolCalls = {
      role: 'assistant',
      content: null,
      tool_calls: [
        {
          id: toolCallId,
          type: 'function',
          function: {
            name: pending.name,
            arguments: JSON.stringify(pending.args),
          },
        },
      ],
    };
    messages.value.push(assistantMessage);
    await executeToolAndContinue(toolCallId, pending.name, pending.args);
  };
  // 用户拒绝执行工具
  const rejectToolExecution = async () => {
    agentToolsStore.rejectPendingTool();
    addStep({
      type: 'tool_result',
      content: '用户拒绝执行该操作',
      toolName: agentToolsStore.pendingToolCall?.name,
      toolResult: { success: false, error: '用户拒绝执行' },
    });
    // 将拒绝信息作为工具结果
    const toolMessage: ToolMessage = {
      role: 'tool',
      tool_call_id: `rejected_${nanoid()}`,
      content: JSON.stringify({ success: false, error: '用户拒绝执行该操作' }),
    };
    messages.value.push(toolMessage);
    await continueLoop();
  };
  // 获取最终答案
  const finalAnswer = computed(() => {
    const finalStep = steps.value.find((s) => s.type === 'final_answer');
    return finalStep?.content || null;
  });
  return {
    status,
    steps,
    messages,
    currentIteration,
    maxIterations,
    errorMessage,
    finalAnswer,
    reset,
    runAgent,
    confirmToolExecution,
    rejectToolExecution,
  };
});
