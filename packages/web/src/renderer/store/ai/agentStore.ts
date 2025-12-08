import { useProjectWorkbench } from '@/store/projectWorkbench/projectWorkbenchStore'
import { useProjectNav } from '@/store/projectWorkbench/projectNavStore'
import { useVariable } from '@/store/projectWorkbench/variablesStore'
import { useLLMClientStore } from './llmClientStore'
import { useAgentViewStore } from './agentViewStore'
import { openaiTools, rawTools } from './tools/tools.ts'
import { LLMessage } from '@src/types/ai/agent.type.ts'
import type { AgentToolCallInfo } from '@src/types/ai'
import { generateAgentExecutionMessage, generateCompletionMessage } from '@/helper'
import { config } from '@src/config/config'

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
// 构建历史对话消息
const buildHistoryMessages = (agentViewStore: ReturnType<typeof useAgentViewStore>): LLMessage[] => {
	const recentMessages = agentViewStore.getLatestMessages(10)
	const historyMessages: LLMessage[] = []
	for (const msg of recentMessages) {
		if (msg.type === 'ask') {
			historyMessages.push({ role: 'user', content: msg.content })
		} else if (msg.type === 'textResponse') {
			historyMessages.push({ role: 'assistant', content: msg.content })
		} else if (msg.type === 'agentExecution' && msg.status === 'success' && msg.thinkingContent) {
			historyMessages.push({ role: 'assistant', content: msg.thinkingContent })
		}
	}
	return historyMessages
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
	const historyMessages = buildHistoryMessages(agentViewStore)
	const messages: LLMessage[] = [
		{ role: 'system', content: agentSystemPrompt },
		{ role: 'system', content: contextText },
		...historyMessages,
		{ role: 'user', content: prompt }
	];
	const agentMessage = generateAgentExecutionMessage(agentViewStore.currentSessionId)
	const messageId = agentMessage.id
	let currentToolCalls: AgentToolCallInfo[] = []
	agentViewStore.agentViewMessageList.push(agentMessage)
	let currentResponse = await llmClientStore.chat({
		messages,
		tools: openaiTools
	});
	for (let iteration = 0; iteration < config.renderConfig.agentConfig.maxIterations; iteration++) {
		const { message, finish_reason } = currentResponse.choices[0];
		if (message.content && finish_reason === 'tool_calls' && message.tool_calls?.length) {
			agentViewStore.updateMessageInList(messageId, { thinkingContent: message.content })
		}
		if (finish_reason !== 'tool_calls' || !message.tool_calls?.length) {
			agentViewStore.updateMessageInList(messageId, { status: 'success', isStreaming: false })
			const finalMessage = agentViewStore.getMessageById(messageId)
			if (finalMessage) {
				await agentViewStore.updateAgentViewMessage(finalMessage)
			}
			const completionMessage = generateCompletionMessage(agentViewStore.currentSessionId, message.content || '')
			await agentViewStore.addAgentViewMessage(completionMessage)
			return message.content;
		}
		messages.push({
			role: 'assistant',
			content: message.content || '',
			tool_calls: message.tool_calls
		});
		const responseUsage = currentResponse.usage;
		for (let i = 0; i < message.tool_calls.length; i++) {
			const toolCall = message.tool_calls[i]
			const args = JSON.parse(toolCall.function.arguments || '{}')
			const toolCallInfo: AgentToolCallInfo = {
				id: toolCall.id,
				name: toolCall.function.name,
				arguments: args,
				status: 'running',
				tokenUsage: i === 0 && responseUsage ? responseUsage : undefined,
			}
			currentToolCalls = [...currentToolCalls, toolCallInfo]
			agentViewStore.updateMessageInList(messageId, { toolCalls: currentToolCalls })
			const tool = rawTools.find(t => t.name === toolCall.function.name);
			if (!tool) {
				currentToolCalls = currentToolCalls.map(tc =>
					tc.id === toolCall.id
						? { ...tc, status: 'error' as const, error: `工具 ${toolCall.function.name} 不存在`, endTime: Date.now() }
						: tc
				)
				agentViewStore.updateMessageInList(messageId, { toolCalls: currentToolCalls })
				messages.push({
					role: 'tool',
					content: `工具 ${toolCall.function.name} 不存在`,
					tool_call_id: toolCall.id
				});
				continue;
			}
			try {
				const result = await tool.execute(args);
				const newStatus = result.code === 0 ? 'success' : 'error' as AgentToolCallInfo['status']
				currentToolCalls = currentToolCalls.map(tc =>
					tc.id === toolCall.id
						? { ...tc, status: newStatus, result, endTime: Date.now() }
						: tc
				)
				agentViewStore.updateMessageInList(messageId, { toolCalls: currentToolCalls })
				messages.push({
					role: 'tool',
					content: result.code === 0
						? `执行成功：${JSON.stringify(result.data)}`
						: `执行失败：${JSON.stringify(result.data)}`,
					tool_call_id: toolCall.id
				});
			} catch (err) {
				currentToolCalls = currentToolCalls.map(tc =>
					tc.id === toolCall.id
						? { ...tc, status: 'error' as const, error: err instanceof Error ? err.message : String(err), endTime: Date.now() }
						: tc
				)
				agentViewStore.updateMessageInList(messageId, { toolCalls: currentToolCalls })
				messages.push({
					role: 'tool',
					content: `工具执行异常：${err instanceof Error ? err.message : String(err)}`,
					tool_call_id: toolCall.id
				});
			}
		}
		currentResponse = await llmClientStore.chat({
			messages,
			tools: openaiTools
		});
	}
	agentViewStore.updateMessageInList(messageId, { status: 'success', isStreaming: false })
	const finalMessage = agentViewStore.getMessageById(messageId)
	if (finalMessage) {
		await agentViewStore.updateAgentViewMessage(finalMessage)
	}
	const finalContent = currentResponse.choices[0]?.message?.content || ''
	const completionMessage = generateCompletionMessage(agentViewStore.currentSessionId, finalContent)
	await agentViewStore.addAgentViewMessage(completionMessage)
	return finalContent
}
