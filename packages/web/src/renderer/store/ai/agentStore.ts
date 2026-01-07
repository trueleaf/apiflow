import { defineStore } from 'pinia'
import { useProjectWorkbench } from '@/store/projectWorkbench/projectWorkbenchStore'
import { useProjectNav } from '@/store/projectWorkbench/projectNavStore'
import { useVariable } from '@/store/projectWorkbench/variablesStore'
import { useLLMClientStore } from './llmClientStore'
import { useAgentViewStore } from './agentView'
import { openaiTools, rawTools, getToolSummaries, getToolsByNames } from './tools/tools.ts'
import { LLMessage } from '@src/types/ai/agent.type.ts'
import type { AgentToolCallInfo, OpenAiToolDefinition } from '@src/types/ai'
import type { CommonResponse } from '@src/types'
import { generateAgentExecutionMessage, generateCompletionMessage, generateInfoMessage } from '@/helper'
import { config } from '@src/config/config'
import { nanoid } from 'nanoid'
import { agentSystemPrompt, toolSelectionSystemPrompt } from '@/store/ai/prompt/prompt'
import { i18n } from '@/i18n'
export const useAgentStore = defineStore('agent', () => {
	let agentAbortController: AbortController | null = null
	const checkAborted = (signal: AbortSignal | undefined) => {
		if (signal?.aborted) {
			throw new Error('AGENT_ABORTED')
		}
	}
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
	const buildHistoryMessages = (): LLMessage[] => {
		const agentViewStore = useAgentViewStore()
		// 获取最近的消息，保留最近10轮对话用于上下文
		const recentMessages = agentViewStore.getLatestMessages(50)
		const historyMessages: LLMessage[] = []
		const maxConversations = 10
		const conversations: Array<{ user: LLMessage; assistant?: LLMessage }> = []
		
		// 从后往前收集对话对（用户提问 + 助手回复）
		for (let i = recentMessages.length - 1; i >= 0 && conversations.length < maxConversations; i--) {
			const msg = recentMessages[i]
			if (!msg.canBeContext) continue
			
			if (msg.type === 'ask') {
				// 找到用户消息，向前查找对应的助手回复
				const userMsg: LLMessage = { role: 'user', content: msg.content }
				let assistantMsg: LLMessage | undefined = undefined
				
				// 向前查找第一个 textResponse，跳过中间的其他消息类型
				for (let j = i - 1; j >= 0; j--) {
					const prevMsg = recentMessages[j]
					if (!prevMsg.canBeContext) continue
					
					if (prevMsg.type === 'textResponse') {
						assistantMsg = { role: 'assistant', content: prevMsg.content }
						break
					}
					// 如果遇到另一个 ask，说明前面没有配对的回复了，停止查找
					if (prevMsg.type === 'ask') {
						break
					}
					// 其他类型（agentExecution、info、loading等）继续向前查找
				}
				
				conversations.push({
					user: userMsg,
					assistant: assistantMsg
				})
			}
		}
		
		// 反转顺序，按时间正序构建历史消息
		conversations.reverse()
		for (const conv of conversations) {
			if (conv.assistant) {
				historyMessages.push(conv.assistant)
			}
			historyMessages.push(conv.user)
		}
		
		// 注意：工具执行结果不加入历史，避免干扰新任务的理解
		return historyMessages
	}
	const selectToolsByLLM = async (params: { prompt: string; contextText: string; historyMessages: LLMessage[]; signal?: AbortSignal }): Promise<{ tools: OpenAiToolDefinition[]; totalTokens: number }> => {
		const { prompt, contextText, historyMessages, signal } = params
		const llmClientStore = useLLMClientStore()
		checkAborted(signal)
		const toolListText = JSON.stringify(getToolSummaries())
		const messages: LLMessage[] = [
			{ role: 'system', content: toolSelectionSystemPrompt },
			{ role: 'system', content: `${i18n.global.t('可用工具列表')}：${toolListText}` },
			{ role: 'system', content: contextText },
			...historyMessages,
			{ role: 'user', content: `${i18n.global.t('用户意图')}：${prompt}` }
		]
		try {
			const response = await llmClientStore.chat({ messages, response_format: { type: 'json_object' } })
			checkAborted(signal)
			const content = response.choices[0]?.message?.content?.trim() || ''
			const parsed: unknown = JSON.parse(content)
			const toolNamesRaw: unknown = Array.isArray(parsed)
				? parsed
				: (typeof parsed === 'object' && parsed !== null && 'tools' in parsed)
					? (parsed as { tools?: unknown }).tools
					: null
			const toolNames = Array.isArray(toolNamesRaw)
				? toolNamesRaw.filter((name): name is string => typeof name === 'string' && name.length > 0)
				: []
			const totalTokens = response.usage?.total_tokens || 0
			if (!Array.isArray(toolNames) || toolNames.length === 0) {
				return { tools: openaiTools, totalTokens }
			}
			const selectedTools = getToolsByNames(toolNames)
			if (selectedTools.length === 0) {
				return { tools: openaiTools, totalTokens }
			}
			return { tools: selectedTools, totalTokens }
		} catch (err) {
			if (err instanceof Error && err.message === 'AGENT_ABORTED') {
				throw err
			}
			return { tools: openaiTools, totalTokens: 0 }
		}
	}
	const executeAgentLoop = async (params: { messages: LLMessage[]; tools: OpenAiToolDefinition[]; messageId: string; signal?: AbortSignal }): Promise<{ content: string; needFallback: boolean; hasToolCalls: boolean }> => {
		const { messages, tools, messageId, signal } = params
		const agentViewStore = useAgentViewStore()
		const llmClientStore = useLLMClientStore()
		let currentToolCalls: AgentToolCallInfo[] = []
		let hasToolCalls = false
		checkAborted(signal)
		let currentResponse = await llmClientStore.chat({ messages, tools })
		checkAborted(signal)
		for (let iteration = 0; iteration < config.renderConfig.agentConfig.maxIterations; iteration++) {
			const { message, finish_reason } = currentResponse.choices[0]
			const messageContent = message.content || ''
			if (messageContent && finish_reason === 'tool_calls' && message.tool_calls?.length) {
				void agentViewStore.updateCurrentMessageById(messageId, { thinkingContent: messageContent })
			}
			if (finish_reason !== 'tool_calls' || !message.tool_calls?.length) {
				const content = messageContent
				const needFallback = !hasToolCalls && content.length < 10
				return { content, needFallback, hasToolCalls }
			}
			hasToolCalls = true
			messages.push({
				role: 'assistant',
				content: messageContent,
				tool_calls: message.tool_calls
			})
			const responseUsage = currentResponse.usage
			for (let i = 0; i < message.tool_calls.length; i++) {
				checkAborted(signal)
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
				void agentViewStore.updateCurrentMessageById(messageId, { toolCalls: currentToolCalls })
				const tool = rawTools.find(t => t.name === toolCall.function.name)
				if (!tool) {
					const errorMsg = i18n.global.t('工具不存在', { name: toolCall.function.name })
					currentToolCalls = currentToolCalls.map(tc =>
						tc.id === toolCall.id
							? { ...tc, status: 'error' as const, error: errorMsg, endTime: Date.now() }
							: tc
					)
					void agentViewStore.updateCurrentMessageById(messageId, { toolCalls: currentToolCalls })
					messages.push({
						role: 'tool',
						content: errorMsg,
						tool_call_id: toolCall.id
					})
					continue
				}
				try {
					const result = await tool.execute(args)
					checkAborted(signal)
					const newStatus = result.code === 0 ? 'success' : 'error' as AgentToolCallInfo['status']
					currentToolCalls = currentToolCalls.map(tc =>
						tc.id === toolCall.id
							? { ...tc, status: newStatus, result, endTime: Date.now() }
							: tc
					)
					void agentViewStore.updateCurrentMessageById(messageId, { toolCalls: currentToolCalls })
					messages.push({
						role: 'tool',
						content: result.code === 0
							? `${i18n.global.t('执行成功')}：${JSON.stringify(result.data)}`
							: `${i18n.global.t('执行失败')}：${JSON.stringify(result.data)}`,
						tool_call_id: toolCall.id
					})
				} catch (err) {
					if (err instanceof Error && err.message === 'AGENT_ABORTED') {
						throw err
					}
					currentToolCalls = currentToolCalls.map(tc =>
						tc.id === toolCall.id
							? { ...tc, status: 'error' as const, error: err instanceof Error ? err.message : String(err), endTime: Date.now() }
							: tc
					)
					void agentViewStore.updateCurrentMessageById(messageId, { toolCalls: currentToolCalls })
					messages.push({
						role: 'tool',
						content: `${i18n.global.t('工具执行异常')}：${err instanceof Error ? err.message : String(err)}`,
						tool_call_id: toolCall.id
					})
				}
			}
			checkAborted(signal)
			currentResponse = await llmClientStore.chat({ messages, tools })
			checkAborted(signal)
		}
		const finalContent = currentResponse.choices[0]?.message?.content || ''
		return { content: finalContent, needFallback: false, hasToolCalls }
	}
	const stopAgent = () => {
		if (agentAbortController) {
			agentAbortController.abort()
			agentAbortController = null
		}
	}
	const runAgent = async (params: { prompt: string }): Promise<CommonResponse<string>> => {
		const { prompt } = params
		agentAbortController = new AbortController()
		const signal = agentAbortController.signal
		const agentViewStore = useAgentViewStore()
		const context = buildAgentContext()
		const contextText = `【上下文（只读）】以下信息来自 ApiFlow 当前界面状态，用于辅助工具入参填充与减少反问。
规则：
- 不要编造 id（projectId/nodeId/folderId），优先从这里读取；若为 null，再询问用户或先用搜索/详情类工具定位。
- activeTab 不为 null 时，通常可直接用 activeTab.id 作为 nodeId；结合 activeTab.type 判断节点类型。
- 当需要 projectId（如创建节点/启停 Mock/启动服务等）时，优先使用 project.id；若为 null，先提示用户选择/打开项目。
JSON：${JSON.stringify({ project: context.project, activeTab: context.activeTab, variables: context.variables })}`
		const historyMessages = buildHistoryMessages()
		const messages: LLMessage[] = [
			{ role: 'system', content: agentSystemPrompt },
			{ role: 'system', content: contextText },
			...historyMessages,
			{ role: 'user', content: prompt }
		]
		const agentMessage = generateAgentExecutionMessage(agentViewStore.currentSessionId)
		const messageId = agentMessage.id
		try {
			const loadingMessage: import('@src/types/ai').LoadingMessage = {
				id: nanoid(),
				type: 'loading',
				content: i18n.global.t('准备执行'),
				timestamp: new Date().toISOString(),
				sessionId: agentViewStore.currentSessionId,
				mode: 'agent',
				canBeContext: false
			}
			agentViewStore.currentMessageList.push(loadingMessage)
			setTimeout(() => {
				agentViewStore.updateMessageById(loadingMessage.id, { content: i18n.global.t('搜索工具中') })
			}, 1000)
			const { tools: selectedTools, totalTokens } = await selectToolsByLLM({ prompt, contextText, historyMessages, signal })
			agentViewStore.deleteCurrentMessageById(loadingMessage.id)
			const toolNames = selectedTools.map(tool => tool.function.name)
			const infoMessage = generateInfoMessage(
				agentViewStore.currentSessionId,
				i18n.global.t('已挑选工具', { count: selectedTools.length }),
				'agent',
				totalTokens,
				toolNames
			)
			agentViewStore.currentMessageList.push(infoMessage)
			agentViewStore.currentMessageList.push(agentMessage)
			const result = await executeAgentLoop({ messages, tools: selectedTools, messageId, signal })
			await agentViewStore.updateCurrentMessageById(messageId, { status: 'success', isStreaming: false })
			const completionMessage = generateCompletionMessage(agentViewStore.currentSessionId, result.content)
			await agentViewStore.addCurrentMessage(completionMessage)
			agentAbortController = null
			return { code: 0, msg: '', data: result.content }
		} catch (err) {
			const isAborted = err instanceof Error && err.message === 'AGENT_ABORTED'
			if (isAborted) {
				await agentViewStore.updateCurrentMessageById(messageId, { status: 'aborted', isStreaming: false })
			} else {
				agentViewStore.deleteCurrentMessageById(messageId)
			}
			agentAbortController = null
			const errorMessage = err instanceof Error ? err.message : String(err)
			return { code: isAborted ? -2 : -1, msg: errorMessage, data: '' }
		}
	}
	return {
		stopAgent,
		runAgent
	}
})
