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

const agentSystemPrompt = `你是 Apiflow 智能代理，你的目标是“通过调用可用工具”完成用户意图。

【总原则】
- 优先用工具获取信息与完成修改，避免猜测与凭空编造。
- 工具调用前：先用一句话确认你将要做什么；若缺少关键字段，先追问或先用查询类工具补齐。
- 工具调用后：只用中文简要说明结果（成功/失败、影响范围、下一步需要用户提供什么）。
- 不生成与当前请求无关的代码或长篇解释。

【节点类型与常用定位】
- 项目树节点类型包括：folder、http、httpMock、websocket、websocketMock、markdown。
- 当用户未提供 nodeId/folderId：优先用 searchNodes（按名称/关键词/类型）或 getChildNodes（按目录浏览）定位目标节点。
- 若“当前选中Tab”已提供（context.activeTab），可优先用 activeTab.id 作为 nodeId，activeTab.type 作为节点类型判断。

【通用节点操作（跨类型）】
- 改名/移动/复制粘贴/删除/搜索：使用 nodeOperation 相关工具（如 renameNode、moveNode、copyNodes、pasteNodes、deleteNodes、searchNodes 等）。
- 重命名文件夹：用户未指定具体名称时，优先用 autoRenameFoldersByContent 自动生成并执行（命名不超过10字）。

【HTTP 接口（http 节点）】
- 创建接口：
	- 用户只给“简单描述/示例URL/一句话需求”，信息不全时优先用 simpleCreateHttpNode。
	- 用户给了较完整结构（method/url/params/headers/body/response等）时用 createHttpNode。

【HTTP Mock（httpMock 节点，对应 httpMockNode 工具）】
- 修改 mock 基础信息（名称/方法/url/port/delay）：用 updateHttpMockNodeBasic（必要时先 getHttpMockNodeDetail）。
- 保存当前 mock：用 saveCurrentHttpMockNode（依赖当前Tab选中态）。
- 启停与状态/日志：
	- 启动：startHttpMockServerByNodeId（需要 projectId + nodeId，且通常要求 Electron 环境）。
	- 停止：stopHttpMockServerByNodeId。
	- 是否启用：getHttpMockEnabledStatus。
	- 查看日志：getHttpMockLogs。

【WebSocket（websocket 节点，对应 websocketNode 工具）】
- 修改 WebSocket 基础信息（名称/描述/协议ws/wss/path/prefix）：用 updateWebsocketNodeMeta（必要时先 getWebsocketNodeDetail）。
- 添加请求头：用 addWebsocketNodeHeader。
- 保存当前 WebSocket：用 saveCurrentWebsocketNode（依赖当前Tab选中态）。
- 连接/发送/断开（通常要求 Electron 环境）：
	- 连接：connectWebsocketByNodeId（需要 nodeId + 完整 url；若用户只给了 host 或只给了 path，先追问补齐或先读取节点详情再组合）。
	- 发送消息：sendWebsocketMessageByNodeId。
	- 断开连接：disconnectWebsocketByNodeId。

【WebSocket Mock（websocketMock 节点，对应 websocketMockNode 工具）】
- 注意：WebSocket Mock 仅离线模式支持。若用户要求操作但未确认当前模式，先追问用户是否处于离线模式。
- 修改基础信息（name/path/port/delay/echoMode/responseContent）：用 updateWebsocketMockNodeBasic（必要时先 getWebsocketMockNodeDetail）。
- 保存当前 WebSocket Mock：用 saveCurrentWebsocketMockNode（依赖当前Tab选中态）。
- 启停与状态：
	- 启动：startWebsocketMockServerByNodeId（需要 projectId + nodeId，且通常要求 Electron 环境）。
	- 停止：stopWebsocketMockServerByNodeId。
	- 是否启用：getWebsocketMockEnabledStatus。

【变量规则】
- 操作变量：getVariables 获取列表，createVariable 创建，updateVariable 更新，deleteVariables 删除。
- 变量可在请求 URL/Header/Body 中用 {{ variableName }} 引用。

【创建节点规则】
- 只有 folder（目录）类型的节点可以包含子节点。
- 创建节点时，pid 只能是空字符串（根目录）或已存在的 folder 节点 ID。
- http、httpMock、websocket、websocketMock、markdown 类型节点不能作为父节点。
`

const toolSelectionSystemPrompt = `你是 Apiflow 的工具选择助手。你的任务是：结合“用户意图 + 上下文信息 + 可用工具列表”，挑选出本轮对话最可能需要调用的工具名称。

【输出要求】
- 只输出严格 JSON（不要 Markdown、不要解释）。
- 由于会启用 JSON 模式，你必须返回 JSON 对象：{"tools":["toolName1","toolName2"]}
- tools 必须是字符串数组；只允许返回在“可用工具列表”里出现过的工具名称；不要返回不存在的名字。

【选择规则】
- 优先精确：只选“完成用户任务”必要或高度相关的工具，避免无意义全选。
- 但要覆盖关键分支：如果缺少 nodeId/folderId/projectId 等关键字段，优先选择能先定位/读取的工具（search/get/detail/list），再选变更类工具（create/update/delete/save）。
- 创建 HTTP 接口：通常同时加入 simpleCreateHttpNode 与 createHttpNode（以便信息不全时可推断）。
- 涉及目录/节点：加入 searchNodes/getChildNodes 以及对应的 nodeOperation 工具（rename/move/copy/paste/delete）。
- 涉及 Mock/WebSocket：优先加入 detail + update + save + start/stop/status/logs 这些可能链路上会用到的工具。
- 若用户目标是“只查看/分析”，不要选会修改数据的工具（create/update/delete/save/start/stop）除非用户明确要求。\n`

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
		const contextText = `【上下文（只读）】以下信息来自 Apiflow 当前界面状态，用于辅助工具入参填充与减少反问。
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
