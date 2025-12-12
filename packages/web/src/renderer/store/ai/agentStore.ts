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

const agentSystemPrompt = `你是 Apiflow 智能代理，需使用工具完成用户意图。
- 优先调用工具完成修改，避免凭空编造。
- 工具调用前先用一句话确认理解；缺信息则先追问。
- 仅在工具执行后，用中文简要说明修改结果或下一步需求。
- 不生成与当前请求无关的代码或文本。
- 创建接口时，如果用户只提供了简单描述而没有给出完整参数，优先使用simpleCreateHttpNode工具。
- 重命名文件夹时，若用户未指定具体名称，优先使用autoRenameFoldersByContent工具，它会根据子节点内容自动生成不超过10个字的有意义命名并执行重命名。
- 操作变量时，使用getVariables获取变量列表，createVariable创建变量，updateVariable更新变量，deleteVariables删除变量。变量可在请求URL、Header、Body中通过{{ variableName }}方式引用。

【创建节点规则】
- 只有 folder（目录）类型的节点可以包含子节点
- 创建节点时，pid 参数只能是空字符串（表示根目录）或已存在的 folder 节点的 ID
- http、httpMock、websocket、websocketMock、markdown 类型的节点不能作为父节点
`

const toolSelectionSystemPrompt = `你是工具选择助手。根据用户意图从工具列表中选择所有可能用到的工具。
返回格式必须是纯JSON数组，只包含工具名称，不要有其他内容。
例如：["toolName1", "toolName2", "toolName3"]
选择原则：
- 宁多勿少，确保覆盖用户可能需要的所有操作
- 如果是创建接口相关，包含simpleCreateHttpNode和createHttpNode
- 如果涉及查询/获取，包含相应的get/search工具
- 如果涉及修改/更新，包含相应的patch/update/set工具
- 如果涉及文件夹操作，包含folder相关工具
- 如果不确定具体操作类型，选择该类别的所有相关工具`

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
		const recentMessages = agentViewStore.getLatestMessages(10)
		const historyMessages: LLMessage[] = []
		for (const msg of recentMessages) {
			if (!msg.canBeContext) continue
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
	const selectToolsByLLM = async (params: { prompt: string; contextText: string; signal?: AbortSignal }): Promise<{ tools: OpenAiToolDefinition[]; totalTokens: number }> => {
		const { prompt, contextText, signal } = params
		const llmClientStore = useLLMClientStore()
		checkAborted(signal)
		const toolListText = JSON.stringify(getToolSummaries())
		const messages: LLMessage[] = [
			{ role: 'system', content: toolSelectionSystemPrompt },
			{ role: 'system', content: `可用工具列表：${toolListText}` },
			{ role: 'system', content: contextText },
			{ role: 'user', content: `用户意图：${prompt}` }
		]
		try {
			const response = await llmClientStore.chat({ messages, response_format: { type: 'json_object' } })
			checkAborted(signal)
			const content = response.choices[0]?.message?.content?.trim() || ''
			const toolNames: string[] = JSON.parse(content)
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
					currentToolCalls = currentToolCalls.map(tc =>
						tc.id === toolCall.id
							? { ...tc, status: 'error' as const, error: `工具 ${toolCall.function.name} 不存在`, endTime: Date.now() }
							: tc
					)
					void agentViewStore.updateCurrentMessageById(messageId, { toolCalls: currentToolCalls })
					messages.push({
						role: 'tool',
						content: `工具 ${toolCall.function.name} 不存在`,
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
							? `执行成功：${JSON.stringify(result.data)}`
							: `执行失败：${JSON.stringify(result.data)}`,
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
						content: `工具执行异常：${err instanceof Error ? err.message : String(err)}`,
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
		const contextText = `当前上下文信息，若字段为null表示未选中：${JSON.stringify({
			project: context.project,
			activeTab: context.activeTab,
			variables: context.variables
		})}`
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
				content: '准备执行',
				timestamp: new Date().toISOString(),
				sessionId: agentViewStore.currentSessionId,
				mode: 'agent',
				canBeContext: false
			}
			agentViewStore.currentMessageList.push(loadingMessage)
			setTimeout(() => {
				agentViewStore.updateMessageById(loadingMessage.id, { content: '搜索工具中...' })
			}, 1000)
			const { tools: selectedTools, totalTokens } = await selectToolsByLLM({ prompt, contextText, signal })
			agentViewStore.deleteCurrentMessageById(loadingMessage.id)
			const infoMessage = generateInfoMessage(
				agentViewStore.currentSessionId,
				`已挑选${selectedTools.length}个工具`,
				'agent',
				totalTokens
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
