import { useProjectWorkbench } from '@/store/projectWorkbench/projectWorkbenchStore'
import { useProjectNav } from '@/store/projectWorkbench/projectNavStore'
import { useVariable } from '@/store/projectWorkbench/variablesStore'
import { useLLMClientStore } from './llmClientStore'
import { useAgentViewStore } from './agentViewStore'
import { openaiTools, rawTools, toolSummaries, getToolsByNames } from './tools/tools.ts'
import { LLMessage } from '@src/types/ai/agent.type.ts'
import type { AgentToolCallInfo, OpenAiToolDefinition, TodoItem } from '@src/types/ai'
import { generateAgentExecutionMessage, generateCompletionMessage } from '@/helper'
import { config } from '@src/config/config'
import { nanoid } from 'nanoid'

let agentAbortController: AbortController | null = null
export const stopAgent = () => {
	if (agentAbortController) {
		agentAbortController.abort()
		agentAbortController = null
	}
}
const checkAborted = (signal: AbortSignal | undefined) => {
	if (signal?.aborted) {
		throw new Error('AGENT_ABORTED')
	}
}

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

【任务计划规则】
对于需要超过2个步骤完成的复杂任务，你必须在第一次响应时输出任务计划。
任务计划格式要求：
1. 在响应开头用 <todo_plan> 标签包裹JSON数组
2. 每个步骤包含 stepNumber(步骤编号) 和 title(步骤标题，不超过15字)
3. 步骤应该简洁明了，描述要执行的操作
4. 完成每个步骤后，在响应中用 <current_step>步骤编号</current_step> 标记当前完成的步骤

示例：
<todo_plan>[{"stepNumber":1,"title":"查询现有接口"},{"stepNumber":2,"title":"创建新接口"},{"stepNumber":3,"title":"设置请求参数"}]</todo_plan>
我来帮你完成这个任务。首先我需要查询现有接口...

完成一个步骤后：
<current_step>1</current_step>
已完成接口查询，接下来创建新接口...
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
// 从 LLM 响应中解析任务计划
const parseTodoPlan = (content: string): TodoItem[] | null => {
	const todoPlanMatch = content.match(/<todo_plan>([\s\S]*?)<\/todo_plan>/)
	if (!todoPlanMatch) return null
	try {
		const planData = JSON.parse(todoPlanMatch[1]) as Array<{ stepNumber: number; title: string }>
		if (!Array.isArray(planData) || planData.length <= 2) return null
		return planData.map((item) => ({
			id: nanoid(),
			stepNumber: item.stepNumber,
			title: item.title,
			status: 'pending' as const,
		}))
	} catch {
		return null
	}
}
// 从 LLM 响应中解析当前完成的步骤编号
const parseCurrentStep = (content: string): number | null => {
	const stepMatch = content.match(/<current_step>(\d+)<\/current_step>/)
	if (!stepMatch) return null
	return parseInt(stepMatch[1], 10)
}
// 更新 todoList 中指定步骤的状态
const updateTodoItemStatus = (
	todoList: TodoItem[],
	stepNumber: number,
	status: TodoItem['status']
): TodoItem[] => {
	return todoList.map((item) =>
		item.stepNumber === stepNumber ? { ...item, status } : item
	)
}
// 标记当前步骤为进行中
const markStepAsRunning = (
	todoList: TodoItem[],
	stepNumber: number
): TodoItem[] => {
	return todoList.map((item) => {
		if (item.stepNumber === stepNumber) {
			return { ...item, status: 'running' as const }
		}
		return item
	})
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
// 使用 LLM 从工具摘要中筛选相关工具
const selectToolsByLLM = async (prompt: string, contextText: string, llmClientStore: ReturnType<typeof useLLMClientStore>, signal?: AbortSignal): Promise<OpenAiToolDefinition[]> => {
	checkAborted(signal)
	const toolListText = JSON.stringify(toolSummaries)
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
		if (!Array.isArray(toolNames) || toolNames.length === 0) {
			return openaiTools
		}
		const selectedTools = getToolsByNames(toolNames)
		if (selectedTools.length === 0) {
			return openaiTools
		}
		return selectedTools
	} catch (err) {
		if (err instanceof Error && err.message === 'AGENT_ABORTED') {
			throw err
		}
		return openaiTools
	}
}
// 执行 Agent 循环，返回最终响应内容和是否需要 fallback
const executeAgentLoop = async (
	messages: LLMessage[],
	tools: OpenAiToolDefinition[],
	messageId: string,
	agentViewStore: ReturnType<typeof useAgentViewStore>,
	llmClientStore: ReturnType<typeof useLLMClientStore>,
	signal?: AbortSignal
): Promise<{ content: string; needFallback: boolean; hasToolCalls: boolean }> => {
	let currentToolCalls: AgentToolCallInfo[] = []
	let hasToolCalls = false
	let todoList: TodoItem[] = []
	let lastCompletedStep = 0
	checkAborted(signal)
	let currentResponse = await llmClientStore.chat({ messages, tools })
	checkAborted(signal)
	for (let iteration = 0; iteration < config.renderConfig.agentConfig.maxIterations; iteration++) {
		const { message, finish_reason } = currentResponse.choices[0]
		const messageContent = message.content || ''
		// 解析任务计划（仅在第一次迭代时）
		if (iteration === 0 && todoList.length === 0) {
			const parsedTodoList = parseTodoPlan(messageContent)
			if (parsedTodoList) {
				todoList = parsedTodoList
				// 标记第一个步骤为进行中
				todoList = markStepAsRunning(todoList, 1)
				agentViewStore.updateMessageInList(messageId, { todoList, currentTodoId: todoList[0]?.id })
			}
		}
		// 解析当前完成的步骤
		const completedStep = parseCurrentStep(messageContent)
		if (completedStep && completedStep > lastCompletedStep && todoList.length > 0) {
			// 标记已完成的步骤
			todoList = updateTodoItemStatus(todoList, completedStep, 'success')
			lastCompletedStep = completedStep
			// 标记下一个步骤为进行中
			const nextStep = completedStep + 1
			const nextTodoItem = todoList.find(item => item.stepNumber === nextStep)
			if (nextTodoItem) {
				todoList = markStepAsRunning(todoList, nextStep)
				agentViewStore.updateMessageInList(messageId, { todoList, currentTodoId: nextTodoItem.id })
			} else {
				agentViewStore.updateMessageInList(messageId, { todoList, currentTodoId: undefined })
			}
		}
		if (messageContent && finish_reason === 'tool_calls' && message.tool_calls?.length) {
			agentViewStore.updateMessageInList(messageId, { thinkingContent: messageContent })
		}
		if (finish_reason !== 'tool_calls' || !message.tool_calls?.length) {
			const content = messageContent
			const needFallback = !hasToolCalls && content.length < 10
			// 任务结束时，将所有剩余 pending 步骤标记为完成
			if (todoList.length > 0) {
				todoList = todoList.map(item =>
					item.status === 'pending' || item.status === 'running'
						? { ...item, status: 'success' as const }
						: item
				)
				agentViewStore.updateMessageInList(messageId, { todoList, currentTodoId: undefined })
			}
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
			agentViewStore.updateMessageInList(messageId, { toolCalls: currentToolCalls })
			const tool = rawTools.find(t => t.name === toolCall.function.name)
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
				agentViewStore.updateMessageInList(messageId, { toolCalls: currentToolCalls })
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
				agentViewStore.updateMessageInList(messageId, { toolCalls: currentToolCalls })
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
export const runAgent = async ({ prompt }: { prompt: string }): Promise<{ success: true; content: string } | { success: false; error: string; aborted?: boolean }> => {
	agentAbortController = new AbortController()
	const signal = agentAbortController.signal
	const llmClientStore = useLLMClientStore()
	const agentViewStore = useAgentViewStore()
	const context = buildAgentContext()
	const contextText = `当前上下文信息，若字段为null表示未选中：${JSON.stringify({
		project: context.project,
		activeTab: context.activeTab,
		variables: context.variables
	})}`
	const historyMessages = buildHistoryMessages(agentViewStore)
	const baseMessages: LLMessage[] = [
		{ role: 'system', content: agentSystemPrompt },
		{ role: 'system', content: contextText },
		...historyMessages,
		{ role: 'user', content: prompt }
	]
	const agentMessage = generateAgentExecutionMessage(agentViewStore.currentSessionId)
	const messageId = agentMessage.id
	agentViewStore.agentViewMessageList.push(agentMessage)
	try {
		// 第一阶段：使用 LLM 筛选相关工具
		const selectedTools = await selectToolsByLLM(prompt, contextText, llmClientStore, signal);
		const isUsingSubset = selectedTools.length < openaiTools.length
		// 第二阶段：使用筛选后的工具执行 Agent 循环
		const messages = [...baseMessages]
		let result = await executeAgentLoop(messages, selectedTools, messageId, agentViewStore, llmClientStore, signal)
		// 第三阶段：如果使用子集且需要 fallback，用完整工具集重试
		if (isUsingSubset && result.needFallback) {
			const retryMessages: LLMessage[] = [...baseMessages]
			result = await executeAgentLoop(retryMessages, openaiTools, messageId, agentViewStore, llmClientStore, signal)
		}
		agentViewStore.updateMessageInList(messageId, { status: 'success', isStreaming: false })
		const finalMessage = agentViewStore.getMessageById(messageId)
		if (finalMessage) {
			await agentViewStore.updateAgentViewMessage(finalMessage)
		}
		const completionMessage = generateCompletionMessage(agentViewStore.currentSessionId, result.content)
		await agentViewStore.addAgentViewMessage(completionMessage)
		agentAbortController = null
		return { success: true, content: result.content }
	} catch (err) {
		const isAborted = err instanceof Error && err.message === 'AGENT_ABORTED'
		if (isAborted) {
			agentViewStore.updateMessageInList(messageId, { status: 'aborted', isStreaming: false })
			const finalMessage = agentViewStore.getMessageById(messageId)
			if (finalMessage) {
				await agentViewStore.updateAgentViewMessage(finalMessage)
			}
		} else {
			agentViewStore.deleteAgentViewMessageById(messageId)
		}
		agentAbortController = null
		const errorMessage = err instanceof Error ? err.message : String(err)
		return { success: false, error: errorMessage, aborted: isAborted }
	}
}
