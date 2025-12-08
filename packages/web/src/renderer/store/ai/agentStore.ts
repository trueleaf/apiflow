import { useProjectWorkbench } from '@/store/projectWorkbench/projectWorkbenchStore'
import { useProjectNav } from '@/store/projectWorkbench/projectNavStore'
import { useVariable } from '@/store/projectWorkbench/variablesStore'
import { useLLMClientStore } from './llmClientStore'
import { useAgentViewStore } from './agentViewStore'
import { openaiTools, rawTools } from './tools/tools.ts'
import { LLMessage } from '@src/types/ai/agent.type.ts'
import type { AgentExecutionMessage, AgentToolCallInfo } from '@src/types/ai'
import { nanoid } from 'nanoid/non-secure'

const agentSystemPrompt = `你是 Apiflow 智能代理，需使用工具完成用户意图。
- 优先调用工具完成修改，避免凭空编造。
- 工具调用前先用一句话确认理解；缺信息则先追问。
- 仅在工具执行后，用中文简要说明修改结果或下一步需求。
- 不生成与当前请求无关的代码或文本。
- 创建接口时，如果用户只提供了简单描述而没有给出完整参数，优先使用simpleCreateHttpNode工具。
- 重命名文件夹时，若用户未指定具体名称，优先使用autoRenameFoldersByContent工具，它会根据子节点内容自动生成不超过10个字的有意义命名并执行重命名。
`

const buildAgentContext = () => {
	const projectWorkbench = useProjectWorkbench()
	const variableStore = useVariable()
	const projectNavStore = useProjectNav()
	const projectId = projectWorkbench.projectId
	const projectName = projectWorkbench.projectName
	const activeNav = projectNavStore.currentSelectNav
	const variables = variableStore.variables.map((item) => ({
		id: item._id,
		name: item.name,
		value: item.value,
		type: item.type,
	}))
	return {
		project: projectId ? { id: projectId, name: projectName } : null,
		variables,
		activeTab: activeNav ? { id: activeNav._id, label: activeNav.label, type: activeNav.tabType } : null,
	}
}
// 创建 Agent 执行消息
const createAgentExecutionMessage = (sessionId: string): AgentExecutionMessage => ({
	id: nanoid(),
	type: 'agentExecution',
	sessionId,
	timestamp: new Date().toISOString(),
	status: 'running',
	toolCalls: []
})
// 更新工具调用状态
const updateToolCallStatus = (
	message: AgentExecutionMessage,
	toolCallId: string,
	updates: Partial<AgentToolCallInfo>
) => {
	const toolCall = message.toolCalls.find(tc => tc.id === toolCallId)
	if (toolCall) {
		Object.assign(toolCall, updates)
	}
}
export const runAgent = async ({ prompt }: { prompt: string }) => {
	const llmClientStore = useLLMClientStore()
	const agentViewStore = useAgentViewStore()
	const context = buildAgentContext()
	const contextText = `当前上下文信息，若字段为null表示未选中：${JSON.stringify({
		project: context.project,
		activeTab: context.activeTab,
		variables: context.variables
	})}`;
  const messages: LLMessage[] = [
    { role: 'system', content: agentSystemPrompt },
    { role: 'system', content: contextText },
    { role: 'user', content: prompt }
  ];
	const agentMessage = createAgentExecutionMessage(agentViewStore.currentSessionId)
	agentViewStore.agentViewMessageList.push(agentMessage)
	const MAX_ITERATIONS = 10;
	let currentResponse = await llmClientStore.chat({
		model: 'deepseek-chat',
		messages,
		tools: openaiTools
	});
	for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
		const { message, finish_reason } = currentResponse.choices[0];
		if (message.content) {
			agentMessage.thinkingContent = message.content
		}
		if (finish_reason !== 'tool_calls' || !message.tool_calls?.length) {
			agentMessage.status = 'success'
			return message.content;
		}
		messages.push({
			role: 'assistant',
			content: message.content || '',
			tool_calls: message.tool_calls
		});
		for (const toolCall of message.tool_calls) {
			const args = JSON.parse(toolCall.function.arguments || '{}')
			const toolCallInfo: AgentToolCallInfo = {
				id: toolCall.id,
				name: toolCall.function.name,
				arguments: args,
				status: 'running',
				startTime: Date.now()
			}
			agentMessage.toolCalls.push(toolCallInfo)
			const tool = rawTools.find(t => t.name === toolCall.function.name);
			if (!tool) {
				updateToolCallStatus(agentMessage, toolCall.id, {
					status: 'error',
					error: `工具 ${toolCall.function.name} 不存在`,
					endTime: Date.now()
				})
				messages.push({
					role: 'tool',
					content: `工具 ${toolCall.function.name} 不存在`,
					tool_call_id: toolCall.id
				});
				continue;
			}
			try {
				const result = await tool.execute(args);
				updateToolCallStatus(agentMessage, toolCall.id, {
					status: result.code === 0 ? 'success' : 'error',
					result,
					endTime: Date.now()
				})
				messages.push({
					role: 'tool',
					content: result.code === 0
						? `执行成功：${JSON.stringify(result.data)}`
						: `执行失败：${JSON.stringify(result.data)}`,
					tool_call_id: toolCall.id
				});
			} catch (err) {
				updateToolCallStatus(agentMessage, toolCall.id, {
					status: 'error',
					error: err instanceof Error ? err.message : String(err),
					endTime: Date.now()
				})
				messages.push({
					role: 'tool',
					content: `工具执行异常：${err instanceof Error ? err.message : String(err)}`,
					tool_call_id: toolCall.id
				});
			}
		}
		currentResponse = await llmClientStore.chat({
			model: 'deepseek-chat',
			messages,
			tools: openaiTools
		});
	}
	agentMessage.status = 'success'
	return currentResponse.choices[0]?.message?.content || '';
}
