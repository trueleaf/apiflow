import { onWorkspaceDataChange } from '@/cache/workspaceDataEvents'
import { apiNodesCache } from '@/cache/nodes/nodesCache'
import { projectCache } from '@/cache/project/projectCache'
import { nodeVariableCache } from '@/cache/variable/nodeVariableCache'
import { useProjectManagerStore } from '@/store/projectManager/projectManagerStore'
import { useProjectWorkbench } from '@/store/projectWorkbench/projectWorkbenchStore'
import { useProjectNav } from '@/store/projectWorkbench/projectNavStore'
import { useBanner } from '@/store/projectWorkbench/bannerStore'
import { useVariable } from '@/store/projectWorkbench/variablesStore'
import { useCommonHeader } from '@/store/projectWorkbench/commonHeaderStore'
import { useHttpNode } from '@/store/httpNode/httpNodeStore'
import { useWebSocket } from '@/store/websocketNode/websocketNodeStore'
import { useHttpMockNode } from '@/store/httpMockNode/httpMockNodeStore'
import { useWebSocketMockNode } from '@/store/websocketMockNode/websocketMockNodeStore'
import { useRuntime } from '@/store/runtime/runtimeStore'
import { router } from '@/router'
import { i18n } from '@/i18n'
import { message } from '@/helper'
import { logger } from '@/helper/logger'
import type { HttpNode, WebSocketNode, HttpMockNode, WebSocketMockNode } from '@src/types'

// 刷新当前已保存的节点并保留未保存的编辑
const refreshSelectedNode = async (projectId: string): Promise<void> => {
  const navStore = useProjectNav()
  const selected = navStore.currentSelectNav
  if (!selected || !['http', 'websocket', 'httpMock', 'websocketMock'].includes(selected.tabType)) return
  const node = await apiNodesCache.getNodeById(selected._id)
  if (router.currentRoute.value.query.id !== projectId || navStore.currentSelectNav?._id !== selected._id) return
  if (!selected.saved) {
    message.warning(i18n.global.t('项目数据已在其他窗口更新，未保存的编辑已保留'))
    return
  }
  if (!node) {
    await navStore.deleteNavByIds({ projectId, ids: [selected._id], force: true })
    return
  }
  navStore.changeNavInfoById({ id: node._id, field: 'label', value: node.info.name })
  if (node.info.type === 'http') {
    const store = useHttpNode()
    store.changeHttpNodeInfo(node as HttpNode)
    store.changeOriginHttpNodeInfo()
  } else if (node.info.type === 'websocket') {
    const store = useWebSocket()
    store.changeWebsocket(node as WebSocketNode)
    store.changeOriginWebsocket()
    store.cacheWebSocket()
  } else if (node.info.type === 'httpMock') {
    const store = useHttpMockNode()
    store.replaceHttpMockNode(node as HttpMockNode)
    store.replaceOriginHttpMockNode()
  } else if (node.info.type === 'websocketMock') {
    const store = useWebSocketMockNode()
    store.replaceWebSocketMockNode(node as WebSocketMockNode)
    store.replaceOriginWebSocketMockNode()
  }
}
// 刷新其他窗口提交的离线业务数据
const refreshWorkspace = async (stores: string[]): Promise<void> => {
  if (useRuntime().networkMode !== 'offline') return
  const projectId = router.currentRoute.value.query.id
  if (stores.includes('projects')) await useProjectManagerStore().getProjectList()
  if (typeof projectId !== 'string' || router.currentRoute.value.path !== '/workbench') return
  const project = await projectCache.getProjectInfo(projectId)
  if (router.currentRoute.value.query.id !== projectId) return
  if (!project) {
    if (useProjectNav().navs[projectId]?.some(nav => !nav.saved)) {
      message.warning(i18n.global.t('项目数据已在其他窗口更新，未保存的编辑已保留'))
      return
    }
    await router.replace('/home')
    return
  }
  useProjectWorkbench().changeProjectName(project.projectName)
  if (stores.includes('httpNodeList')) {
    const tree = await apiNodesCache.getApiNodesAsTree(projectId)
    if (router.currentRoute.value.query.id !== projectId) return
    useBanner().changeAllDocBanner(tree)
    await refreshSelectedNode(projectId)
  }
  if (stores.includes('variables')) {
    const variables = await nodeVariableCache.getVariableByProjectId(projectId)
    if (router.currentRoute.value.query.id !== projectId) return
    if (variables.code === 0) useVariable().replaceVariables(variables.data)
  }
  if (router.currentRoute.value.query.id === projectId && (stores.includes('commonHeaders') || stores.includes('httpNodeList'))) {
    await useCommonHeader().getCommonHeaders()
    await useCommonHeader().getGlobalCommonHeaders()
  }
}
// 订阅跨窗口更新并按顺序刷新界面
export const startWorkspaceSync = (): (() => void) => {
  let refreshQueue: Promise<void> = Promise.resolve()
  let disposed = false
  const unsubscribe = onWorkspaceDataChange((stores, external) => {
    if (!external) return
    refreshQueue = refreshQueue.then(async () => { if (!disposed) await refreshWorkspace(stores) }).catch(error => { logger.error('同步离线数据失败', { error }) })
  })
  return () => { disposed = true; unsubscribe() }
}
