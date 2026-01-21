import { AgentTool } from '@src/types/ai'
import { ApidocBanner, ApidocType } from '@src/types'
import { useBanner } from '@/store/projectWorkbench/bannerStore'
import { useProjectNav } from '@/store/projectWorkbench/projectNavStore'
import { apiNodesCache } from '@/cache/nodes/nodesCache'
import { findNodeById, findParentById, findSiblingById, flatTree, forEachForest, uniqueByKey } from '@/helper'
import { router } from '@/router/index'
import { request } from '@/api/api'
import { useRuntime } from '@/store/runtime/runtimeStore'
import { nanoid } from 'nanoid'
import { HttpNode, FolderNode, HttpMockNode } from '@src/types'
import { WebSocketNode } from '@src/types/websocketNode'
import { useSkill } from '../skillStore'
import { useLLMClientStore } from '../llmClientStore'
import { folderAutoRenameSystemPrompt, buildFolderAutoRenameUserPrompt } from '@/store/ai/prompt/prompt'

type ApidocBannerWithProjectId = ApidocBanner & { projectId: string }
type NodeMoveDropType = 'before' | 'after' | 'inner'
//模块级变量：存储剪切的节点
let cutNodesData: ApidocBannerWithProjectId[] = []
//校验节点移动是否合法
const validateNodeMove = (sourceType: ApidocType, targetType: ApidocType, dropType: NodeMoveDropType): { valid: boolean; reason?: string } => {
  if (sourceType !== 'folder' && targetType === 'folder' && dropType === 'before') {
    return { valid: false, reason: '非文件夹节点不能放在文件夹前面' }
  }
  if (sourceType === 'folder' && targetType !== 'folder') {
    return { valid: false, reason: '文件夹只能移动到其他文件夹之前或内部，不能放在非文件夹节点附近' }
  }
  if (targetType !== 'folder' && dropType === 'inner') {
    return { valid: false, reason: '只有文件夹可以包含子节点' }
  }
  return { valid: true }
}
//将节点转换为ApidocBanner格式
const nodeToBanner = (node: HttpNode | WebSocketNode | HttpMockNode | FolderNode): ApidocBanner => {
  const type = node.info.type
  const base = {
    _id: node._id,
    updatedAt: node.updatedAt,
    sort: node.sort,
    pid: node.pid,
    name: node.info.name,
    maintainer: node.info.maintainer,
    readonly: false,
    children: [],
  }
  if (type === 'http') {
    const httpNode = node as HttpNode
    return { ...base, type: 'http', method: httpNode.item.method, url: httpNode.item.url.path }
  }
  if (type === 'websocket') {
    const wsNode = node as WebSocketNode
    return { ...base, type: 'websocket', protocol: wsNode.item.protocol, url: wsNode.item.url }
  }
  if (type === 'httpMock') {
    const mockNode = node as HttpMockNode
    return { ...base, type: 'httpMock', method: 'ALL', url: mockNode.requestCondition.url, port: mockNode.requestCondition.port, state: 'stopped' }
  }
  const folderNode = node as FolderNode
  return { ...base, type: 'folder', commonHeaders: folderNode.commonHeaders || [] }
}

export const nodeOperationTools: AgentTool[] = [
  {
    name: 'getChildNodes',
    description: 'Retrieve direct child nodes within a specific folder or root directory. Returns all immediate children (one level deep) with type filtering support. Use this to explore folder structure, count items, or gather information before batch operations. For recursive/all nodes, use getAllNodeIds instead.',
    type: 'nodeOperation',
    parameters: {
      type: 'object',
      properties: {
        folderId: {
          type: 'string',
          description: 'The unique identifier of the parent folder. Pass empty string or omit to retrieve root-level nodes',
        },
        filterType: {
          type: 'string',
          enum: ['folder', 'http', 'httpMock', 'websocket', 'websocketMock'],
          description: 'Optional filter to return only nodes of a specific type. Omit to get all node types',
        },
      },
      required: [],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const folderId = (args.folderId as string) || ''
      const filterType = args.filterType as ApidocType | undefined
      const bannerStore = useBanner()
      let children: ApidocBanner[] = []
      if (!folderId) {
        children = bannerStore.banner
      } else {
        const folder = findNodeById(bannerStore.banner, folderId, { idKey: '_id' }) as ApidocBanner | null
        if (!folder) {
          return { code: 1, data: { error: '文件夹不存在' } }
        }
        if (folder.type !== 'folder') {
          return { code: 1, data: { error: '指定的节点不是文件夹' } }
        }
        children = folder.children || []
      }
      if (filterType) {
        children = children.filter(node => node.type === filterType)
      }
      const result = children.map(node => {
        const base = {
          _id: node._id,
          type: node.type,
          name: node.name,
          sort: node.sort,
          pid: node.pid,
        }
        if (node.type === 'http') {
          return { ...base, method: node.method, url: node.url }
        }
        if (node.type === 'websocket') {
          return { ...base, protocol: node.protocol, url: node.url }
        }
        if (node.type === 'httpMock') {
          return { ...base, method: node.method, url: node.url, port: node.port }
        }
        if (node.type === 'folder') {
          return { ...base, childrenCount: node.children?.length || 0 }
        }
        return base
      })
      return {
        code: 0,
        data: {
          folderId: folderId || 'root',
          count: result.length,
          nodes: result,
        },
      }
    },
  },
  {
    name: 'copyNodes',
    description: 'Copy one or more nodes to internal clipboard for later pasting. Original nodes remain in place. After copying, use pasteNodes to insert duplicates at the target location. This operation clears any previously cut nodes.',
    type: 'nodeOperation',
    parameters: {
      type: 'object',
      properties: {
        nodeIds: {
          type: 'array',
          description: 'Array of node IDs to copy. Can include any mix of folders, HTTP, WebSocket, or Mock nodes',
          items: { type: 'string' },
        },
        projectId: {
          type: 'string',
          description: 'The unique identifier of the project containing the nodes to copy',
        },
      },
      required: ['nodeIds', 'projectId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const nodeIds = args.nodeIds as string[]
      const projectId = args.projectId as string
      const bannerStore = useBanner()
      const copiedNodes: ApidocBannerWithProjectId[] = []
      for (const nodeId of nodeIds) {
        const node = findNodeById(bannerStore.banner, nodeId, { idKey: '_id' }) as ApidocBanner | null
        if (node) {
          copiedNodes.push({ ...JSON.parse(JSON.stringify(node)), projectId })
        }
      }
      if (copiedNodes.length === 0) {
        return { code: 1, data: { error: '未找到要复制的节点' } }
      }
      cutNodesData = []
      return { code: 0, data: { copiedCount: copiedNodes.length, nodes: copiedNodes } }
    },
  },
  {
    name: 'cutNodes',
    description: 'Cut one or more nodes for moving. After using pasteNodes, the original nodes will be permanently removed from their current location. Use this for relocating nodes rather than duplicating them.',
    type: 'nodeOperation',
    parameters: {
      type: 'object',
      properties: {
        nodeIds: {
          type: 'array',
          description: 'Array of node IDs to cut. Can include any mix of folders, HTTP, WebSocket, or Mock nodes',
          items: { type: 'string' },
        },
        projectId: {
          type: 'string',
          description: 'The unique identifier of the project containing the nodes to cut',
        },
      },
      required: ['nodeIds', 'projectId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const nodeIds = args.nodeIds as string[]
      const projectId = args.projectId as string
      const bannerStore = useBanner()
      const cutNodes: ApidocBannerWithProjectId[] = []
      for (const nodeId of nodeIds) {
        const node = findNodeById(bannerStore.banner, nodeId, { idKey: '_id' }) as ApidocBanner | null
        if (node) {
          cutNodes.push({ ...JSON.parse(JSON.stringify(node)), projectId })
        }
      }
      if (cutNodes.length === 0) {
        return { code: 1, data: { error: '未找到要剪切的节点' } }
      }
      cutNodesData = cutNodes
      return { code: 0, data: { cutCount: cutNodes.length, nodes: cutNodes } }
    },
  },
  {
    name: 'pasteNodes',
    description: 'Paste previously copied or cut nodes into a target folder or root directory. If nodes were cut (not copied), the originals will be deleted after pasting. All child nodes in folders are recursively processed with new IDs.',
    type: 'nodeOperation',
    parameters: {
      type: 'object',
      properties: {
        targetFolderId: {
          type: 'string',
          description: 'The unique identifier of the destination folder. Pass empty string to paste at root level',
        },
        nodes: {
          type: 'array',
          description: 'Node data array obtained from copyNodes or cutNodes operation results. Contains full node metadata including project context',
          items: { type: 'object' },
        },
      },
      required: ['nodes'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const targetFolderId = (args.targetFolderId as string) || ''       
      const nodes = args.nodes as ApidocBannerWithProjectId[]
      const bannerStore = useBanner()
      const projectNavStore = useProjectNav()
      const currentProjectId = router.currentRoute.value.query.id as string
      if (targetFolderId) {
        const targetFolder = findNodeById(bannerStore.banner, targetFolderId, { idKey: '_id' }) as ApidocBanner | null
        if (!targetFolder || targetFolder.type !== 'folder') {
          return { code: 1, data: { error: '目标必须是文件夹' } }        
        }
      }
      const runtimeStore = useRuntime()
      if (runtimeStore.networkMode !== 'offline') {
        if (!currentProjectId) {
          return { code: 1, data: { error: '未找到当前项目ID' } }
        }
        if (!nodes || nodes.length === 0) {
          return { code: 1, data: { error: '未找到要粘贴的节点' } }
        }
        const fromProjectId = nodes[0]?.projectId || currentProjectId
        const sourceIdsSet = new Set<string>()
        nodes.forEach((node) => {
          sourceIdsSet.add(node._id)
          if (node.type === 'folder') {
            forEachForest(node.children, (item) => {
              sourceIdsSet.add(item._id)
            })
          }
        })
        const sourceIds = Array.from(sourceIdsSet)
        const idMap = await request.post<{ newId: string; oldId: string; newPid: string }[], { newId: string; oldId: string; newPid: string }[]>('/api/project/paste_docs', {
          projectId: currentProjectId,
          fromProjectId,
          mountedId: targetFolderId,
          docs: sourceIds.map(_id => ({ _id })),
        })
        if (cutNodesData.length > 0) {
          const deleteIdsSet = new Set<string>()
          cutNodesData.forEach((node) => {
            deleteIdsSet.add(node._id)
            if (node.type === 'folder') {
              forEachForest(node.children, (item) => {
                deleteIdsSet.add(item._id)
              })
            }
          })
          const deleteIds = Array.from(deleteIdsSet)
          await request.delete('/api/project/doc', { data: { projectId: fromProjectId, ids: deleteIds } })
          const delNodeIds: string[] = []
          forEachForest(cutNodesData, (node) => {
            if (node.type !== 'folder') {
              delNodeIds.push(node._id)
            }
          })
          projectNavStore.deleteNavByIds({ projectId: fromProjectId, ids: delNodeIds, force: true })
          cutNodesData = []
        }
        await bannerStore.getDocBanner({ projectId: currentProjectId })
        return { code: 0, data: { pastedCount: nodes.length, idMap } }
      }
      const copyPasteNodes: ApidocBanner[] = JSON.parse(JSON.stringify(nodes))
      const flatNodes: ApidocBanner[] = []
      copyPasteNodes.forEach((pasteNode) => {
        flatNodes.push(...flatTree(pasteNode))
      })
      const uniqueFlatNodes = uniqueByKey(flatNodes, '_id')
      const fromProjectId = nodes[0]?.projectId || currentProjectId
      const sourceProjectDocs = await apiNodesCache.getNodesByProjectId(fromProjectId)
      const sourceDocsMap = new Map(sourceProjectDocs.map(doc => [doc._id, doc]))
      const docsToProcess = uniqueFlatNodes.map(node => sourceDocsMap.get(node._id)).filter(Boolean)
      const idMapping = new Map<string, string>()
      const processedDocs: (HttpNode | WebSocketNode | HttpMockNode | FolderNode)[] = []
      for (const doc of docsToProcess) {
        if (!doc) continue
        const oldId = doc._id
        const newId = nanoid()
        idMapping.set(oldId, newId)
        processedDocs.push({
          ...doc,
          _id: newId,
          projectId: currentProjectId,
          updatedAt: new Date().toISOString(),
        } as HttpNode | WebSocketNode | HttpMockNode | FolderNode)
      }
      for (const doc of processedDocs) {
        if (doc.pid && idMapping.has(doc.pid)) {
          doc.pid = idMapping.get(doc.pid)!
        } else {
          doc.pid = targetFolderId
        }
      }
      for (const doc of processedDocs) {
        await apiNodesCache.addNode(doc)
      }
      forEachForest(copyPasteNodes, (node) => {
        const newId = idMapping.get(node._id)
        if (newId) {
          node._id = newId
          if (node.pid && idMapping.has(node.pid)) {
            node.pid = idMapping.get(node.pid)!
          } else {
            node.pid = targetFolderId
          }
        }
      })
      const targetFolder = targetFolderId ? findNodeById(bannerStore.banner, targetFolderId, { idKey: '_id' }) as ApidocBanner | null : null
      copyPasteNodes.forEach((pasteNode) => {
        pasteNode.pid = targetFolderId
        if (targetFolder && targetFolder.type === 'folder') {
          const lastFolderIndex = targetFolder.children.findIndex((node) => node.type !== 'folder')
          if (pasteNode.type === 'folder') {
            if (lastFolderIndex === -1) {
              bannerStore.splice({ start: targetFolder.children.length, deleteCount: 0, item: pasteNode, opData: targetFolder.children })
            } else {
              bannerStore.splice({ start: lastFolderIndex, deleteCount: 0, item: pasteNode, opData: targetFolder.children })
            }
          } else {
            bannerStore.splice({ start: targetFolder.children.length, deleteCount: 0, item: pasteNode, opData: targetFolder.children })
          }
        } else {
          const lastFolderIndex = bannerStore.banner.findIndex((node) => node.type !== 'folder')
          if (pasteNode.type === 'folder') {
            if (lastFolderIndex === -1) {
              bannerStore.splice({ start: bannerStore.banner.length, deleteCount: 0, item: pasteNode })
            } else {
              bannerStore.splice({ start: lastFolderIndex, deleteCount: 0, item: pasteNode })
            }
          } else {
            bannerStore.splice({ start: bannerStore.banner.length, deleteCount: 0, item: pasteNode })
          }
        }
      })
      if (cutNodesData.length > 0) {
        const deleteIds: string[] = []
        cutNodesData.forEach((node) => {
          deleteIds.push(node._id)
          if (node.type === 'folder') {
            forEachForest(node.children, (item) => {
              if (!deleteIds.includes(item._id)) {
                deleteIds.push(item._id)
              }
            })
          }
        })
        await apiNodesCache.deleteNodes(deleteIds)
        const delNodeIds: string[] = []
        forEachForest(cutNodesData, (node) => {
          if (node.type !== 'folder') {
            delNodeIds.push(node._id)
          }
        })
        projectNavStore.deleteNavByIds({
          projectId: fromProjectId,
          ids: delNodeIds,
          force: true,
        })
        cutNodesData = []
      }
      return { code: 0, data: { pastedCount: copyPasteNodes.length, nodes: copyPasteNodes } }
    },
  },
  {
    name: 'forkNode',
    description: 'Create an immediate duplicate of a node positioned right after the original. The duplicate gets a "_副本" (copy) suffix and a new unique ID. Use this for quick in-place duplication without clipboard operations.',
    type: 'nodeOperation',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: 'The unique identifier of the node to duplicate',
        },
      },
      required: ['nodeId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const nodeId = args.nodeId as string
      const bannerStore = useBanner()
      const runtimeStore = useRuntime()
      if (runtimeStore.networkMode !== 'offline') {
        const projectId = router.currentRoute.value.query.id as string
        if (!projectId) {
          return { code: 1, data: { error: '未找到当前项目ID' } }
        }
        const currentNode = findNodeById(bannerStore.banner, nodeId, { idKey: '_id' }) as ApidocBanner | null
        if (!currentNode) {
          return { code: 1, data: { error: '在Banner中未找到节点' } }
        }
        const nextSibling = findSiblingById<ApidocBanner>(bannerStore.banner, nodeId, 'next', { idKey: '_id' })
        const newSort = nextSibling ? (currentNode.sort + nextSibling.sort) / 2 : Date.now()
        try {
          const copied = await request.post<ApidocBanner, ApidocBanner>('/api/project/copy_doc', { projectId, _id: nodeId })
          const pData = findParentById(bannerStore.banner, nodeId, { idKey: '_id' })
          await request.put('/api/project/change_doc_pos', { projectId, _id: copied._id, pid: pData ? pData._id : '', sort: newSort })
          await request.put('/api/project/change_doc_info', { projectId, _id: copied._id, name: `${currentNode.name}_副本` })
          await bannerStore.getDocBanner({ projectId })
          return { code: 0, data: { newNodeId: copied._id } }
        } catch {
          return { code: 1, data: { error: '创建副本失败' } }
        }
      }
      const originalDoc = await apiNodesCache.getNodeById(nodeId)
      if (!originalDoc) {
        return { code: 1, data: { error: '节点不存在' } }
      }
      const currentNode = findNodeById(bannerStore.banner, nodeId, { idKey: '_id' }) as ApidocBanner | null
      if (!currentNode) {
        return { code: 1, data: { error: '在Banner中未找到节点' } }
      }
      const nextSibling = findSiblingById<ApidocBanner>(bannerStore.banner, nodeId, 'next', { idKey: '_id' })
      const newSort = nextSibling ? (currentNode.sort + nextSibling.sort) / 2 : Date.now()
      const newId = nanoid()
      const copyDoc = {
        ...originalDoc,
        _id: newId,
        sort: newSort,
        updatedAt: new Date().toISOString(),
        info: {
          ...originalDoc.info,
          name: `${originalDoc.info.name}_副本`,
        }
      }
      await apiNodesCache.addNode(copyDoc)
      const bannerData = nodeToBanner(copyDoc as HttpNode | WebSocketNode | HttpMockNode | FolderNode)
      bannerData.sort = newSort
      bannerData.name = copyDoc.info.name
      const pData = findParentById(bannerStore.banner, nodeId, { idKey: '_id' })
      if (!pData) {
        const currentIndex = bannerStore.banner.findIndex((node) => node._id === nodeId)
        bannerStore.splice({ start: currentIndex + 1, deleteCount: 0, item: bannerData })
      } else {
        const currentIndex = pData.children.findIndex((node) => node._id === nodeId)
        bannerStore.splice({ start: currentIndex + 1, deleteCount: 0, item: bannerData, opData: pData.children })
      }
      return { code: 0, data: { newNodeId: newId, node: bannerData } }
    },
  },
  {
    name: 'dragNode',
    description: 'Reposition a node relative to another node with precise placement control. Supports three placement strategies: before (insert before target), after (insert after target), or inner (place inside target folder). Enforces structural rules: folders cannot be placed before non-folders, only folders can contain children.',
    type: 'nodeOperation',
    parameters: {
      type: 'object',
      properties: {
        sourceNodeId: {
          type: 'string',
          description: 'The unique identifier of the node to move',
        },
        targetNodeId: {
          type: 'string',
          description: 'The unique identifier of the reference node for positioning',
        },
        dropType: {
          type: 'string',
          enum: ['before', 'after', 'inner'],
          description: 'Placement strategy: "before" inserts above target, "after" inserts below target, "inner" places inside target folder (only valid for folder targets)',
        },
      },
      required: ['sourceNodeId', 'targetNodeId', 'dropType'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const sourceNodeId = args.sourceNodeId as string
      const targetNodeId = args.targetNodeId as string
      const dropType = args.dropType as NodeMoveDropType
      const bannerStore = useBanner()
      const sourceNode = findNodeById(bannerStore.banner, sourceNodeId, { idKey: '_id' }) as ApidocBanner | null
      const targetNode = findNodeById(bannerStore.banner, targetNodeId, { idKey: '_id' }) as ApidocBanner | null
      if (!sourceNode) {
        return { code: 1, data: { error: '源节点不存在' } }
      }
      if (!targetNode) {
        return { code: 1, data: { error: '目标节点不存在' } }
      }
      const validation = validateNodeMove(sourceNode.type, targetNode.type, dropType)
      if (!validation.valid) {
        return { code: 1, data: { error: validation.reason } }
      }
      const runtimeStore = useRuntime()
      if (runtimeStore.networkMode !== 'offline') {
        const projectId = router.currentRoute.value.query.id as string
        if (!projectId) {
          return { code: 1, data: { error: '未找到当前项目ID' } }
        }
        let newPid = ''
        let newSort = 0
        if (dropType === 'inner') {
          newPid = targetNode._id
          newSort = Date.now()
        } else {
          newPid = targetNode.pid || ''
          const previousSibling = dropType === 'before' ? findSiblingById<ApidocBanner>(bannerStore.banner, targetNodeId, 'previous', { idKey: '_id' }) : targetNode
          const nextSibling = dropType === 'before' ? targetNode : findSiblingById<ApidocBanner>(bannerStore.banner, targetNodeId, 'next', { idKey: '_id' })
          const previousSiblingSort = previousSibling ? previousSibling.sort : 0
          const nextSiblingSort = nextSibling ? nextSibling.sort : Date.now()
          newSort = (nextSiblingSort + previousSiblingSort) / 2
        }
        await request.put('/api/project/change_doc_pos', { projectId, _id: sourceNodeId, pid: newPid, sort: newSort })
        await bannerStore.getDocBanner({ projectId })
        return { code: 0, data: { nodeId: sourceNodeId, newPid, newSort } }
      }
      const dragDoc = await apiNodesCache.getNodeById(sourceNodeId)
      if (!dragDoc) {
        return { code: 1, data: { error: '源节点数据不存在' } }
      }
      let newPid = ''
      let newSort = 0
      if (dropType === 'inner') {
        newPid = targetNode._id
        newSort = Date.now()
      } else {
        const pData = findParentById(bannerStore.banner, sourceNodeId, { idKey: '_id' })
        newPid = pData ? pData._id : ''
        const nextSibling = findSiblingById<ApidocBanner>(bannerStore.banner, sourceNodeId, 'next', { idKey: '_id' })
        const previousSibling = findSiblingById<ApidocBanner>(bannerStore.banner, sourceNodeId, 'previous', { idKey: '_id' })
        const previousSiblingSort = previousSibling ? previousSibling.sort : 0
        const nextSiblingSort = nextSibling ? nextSibling.sort : Date.now()
        newSort = (nextSiblingSort + previousSiblingSort) / 2
      }
      const updatedDoc = {
        ...dragDoc,
        pid: newPid,
        sort: newSort,
        updatedAt: new Date().toISOString(),
      }
      await apiNodesCache.replaceNode(updatedDoc)
      sourceNode.pid = newPid
      sourceNode.sort = newSort
      return { code: 0, data: { nodeId: sourceNodeId, newPid, newSort } }
    },
  },
  {
    name: 'moveNode',
    description: 'Change the parent folder of a node. Moves a node from its current location to a different folder or to the root directory. Unlike dragNode, this only changes hierarchy without precise positioning. Folders can only be moved into other folders, not into non-folder nodes.',
    type: 'nodeOperation',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: 'The unique identifier of the node to relocate',
        },
        newPid: {
          type: 'string',
          description: 'The unique identifier of the new parent folder (must be a folder type). Pass empty string to move to root directory',
        },
      },
      required: ['nodeId', 'newPid'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const nodeId = args.nodeId as string
      const newPid = (args.newPid as string) || ''
      const bannerStore = useBanner()
      const runtimeStore = useRuntime()
      if (runtimeStore.networkMode !== 'offline') {
        const projectId = router.currentRoute.value.query.id as string
        if (!projectId) {
          return { code: 1, data: { error: '未找到当前项目ID' } }
        }
        if (newPid) {
          const targetFolder = findNodeById(bannerStore.banner, newPid, { idKey: '_id' }) as ApidocBanner | null
          if (!targetFolder) {
            return { code: 1, data: { error: '目标文件夹不存在' } }
          }
          if (targetFolder.type !== 'folder') {
            return { code: 1, data: { error: '目标必须是文件夹' } }
          }
        }
        const node = findNodeById(bannerStore.banner, nodeId, { idKey: '_id' }) as ApidocBanner | null
        if (!node) {
          return { code: 1, data: { error: '节点不存在' } }
        }
        const oldPid = node.pid
        await request.put('/api/project/change_doc_pos', { projectId, _id: nodeId, pid: newPid, sort: Date.now() })
        await bannerStore.getDocBanner({ projectId })
        return { code: 0, data: { nodeId, oldPid, newPid } }
      }
      const existingNode = await apiNodesCache.getNodeById(nodeId)
      if (!existingNode) {
        return { code: 1, data: { error: '节点不存在' } }
      }
      if (newPid) {
        const targetFolder = findNodeById(bannerStore.banner, newPid, { idKey: '_id' }) as ApidocBanner | null
        if (!targetFolder) {
          return { code: 1, data: { error: '目标文件夹不存在' } }
        }
        if (targetFolder.type !== 'folder') {
          return { code: 1, data: { error: '目标必须是文件夹' } }
        }
      }
      const node = findNodeById(bannerStore.banner, nodeId, { idKey: '_id' }) as ApidocBanner | null
      const oldPid = existingNode.pid
      existingNode.pid = newPid
      existingNode.sort = Date.now()
      existingNode.updatedAt = new Date().toISOString()
      const success = await apiNodesCache.replaceNode(existingNode)
      if (!success) {
        return { code: 1, data: { error: '更新节点缓存失败' } }
      }
      if (node) {
        const oldParent = oldPid ? findNodeById(bannerStore.banner, oldPid, { idKey: '_id' }) as ApidocBanner | null : null
        if (!oldParent) {
          const index = bannerStore.banner.findIndex(n => n._id === nodeId)
          if (index !== -1) bannerStore.splice({ start: index, deleteCount: 1 })
        } else if (oldParent.children) {
          const index = oldParent.children.findIndex(n => n._id === nodeId)
          if (index !== -1) bannerStore.splice({ start: index, deleteCount: 1, opData: oldParent.children })
        }
        node.pid = newPid
        node.sort = existingNode.sort
        const newParent = newPid ? findNodeById(bannerStore.banner, newPid, { idKey: '_id' }) as ApidocBanner | null : null
        if (!newParent) {
          bannerStore.splice({ start: bannerStore.banner.length, deleteCount: 0, item: node })
        } else if (newParent.children) {
          bannerStore.splice({ start: newParent.children.length, deleteCount: 0, item: node, opData: newParent.children })
        }
      }
      return { code: 0, data: { nodeId, oldPid, newPid } }
    },
  },
  {
    name: 'renameNode',
    description: 'Change the display name of any node (folder, HTTP, WebSocket, or Mock). Updates the node\'s name in storage, UI banners, and navigation panels. The node ID remains unchanged.',
    type: 'nodeOperation',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: 'The unique identifier of the node to rename',
        },
        newName: {
          type: 'string',
          description: 'The new display name for the node (cannot be empty or whitespace-only)',
        },
      },
      required: ['nodeId', 'newName'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const nodeId = args.nodeId as string
      const newName = args.newName as string
      if (!newName.trim()) {
        return { code: 1, data: { error: '节点名称不能为空' } }
      }
      const bannerStore = useBanner()
      const projectNavStore = useProjectNav()
      const runtimeStore = useRuntime()
      if (runtimeStore.networkMode !== 'offline') {
        const projectId = router.currentRoute.value.query.id as string
        if (!projectId) {
          return { code: 1, data: { error: '未找到当前项目ID' } }
        }
        await request.put('/api/project/change_doc_info', { projectId, _id: nodeId, name: newName })
        bannerStore.changeBannerInfoById({ id: nodeId, field: 'name', value: newName })
        projectNavStore.changeNavInfoById({ id: nodeId, field: 'label', value: newName })
        return { code: 0, data: { nodeId, newName } }
      }
      await apiNodesCache.updateNodeName(nodeId, newName)
      bannerStore.changeBannerInfoById({
        id: nodeId,
        field: 'name',
        value: newName,
      })
      projectNavStore.changeNavInfoById({
        id: nodeId,
        field: 'label',
        value: newName,
      })
      return { code: 0, data: { nodeId, newName } }
    },
  },
  {
    name: 'deleteNodes',
    description: 'Permanently delete one or more nodes. When deleting folders, all nested children are recursively deleted. Requires confirmation. Use getAllNodeIds + deleteNodes for bulk deletion, or use deleteAllNodes to clear entire project.',
    type: 'nodeOperation',
    parameters: {
      type: 'object',
      properties: {
        nodeIds: {
          type: 'array',
          description: 'Array of node IDs to permanently delete. Accepts any node type',
          items: { type: 'string' },
        },
      },
      required: ['nodeIds'],
    },
    needConfirm: true,
    execute: async (args: Record<string, unknown>) => {
      const nodeIds = args.nodeIds as string[]
      const bannerStore = useBanner()
      const projectNavStore = useProjectNav()
      const projectId = router.currentRoute.value.query.id as string
      const selectNodes: ApidocBanner[] = []
      for (const nodeId of nodeIds) {
        const node = findNodeById(bannerStore.banner, nodeId, { idKey: '_id' }) as ApidocBanner | null
        if (node) {
          selectNodes.push(node)
        }
      }
      if (selectNodes.length === 0) {
        return { code: 1, data: { error: '未找到要删除的节点' } }
      }
      const deleteIds: string[] = []
      selectNodes.forEach((node) => {
        deleteIds.push(node._id)
        if (node.type === 'folder') {
          forEachForest(node.children, (item) => {
            if (!deleteIds.includes(item._id)) {
              deleteIds.push(item._id)
            }
          })
        }
      })
      const runtimeStore = useRuntime()
      if (runtimeStore.networkMode !== 'offline') {
        await request.delete('/api/project/doc', { data: { projectId, ids: deleteIds } })
        await bannerStore.getDocBanner({ projectId })
        const delNodeIds: string[] = []
        forEachForest(selectNodes, (node) => {
          if (node.type !== 'folder') {
            delNodeIds.push(node._id)
          }
        })
        projectNavStore.deleteNavByIds({ projectId, ids: delNodeIds, force: true })
        return { code: 0, data: { deletedCount: deleteIds.length, deletedIds: deleteIds } }
      }
      await apiNodesCache.deleteNodes(deleteIds)
      selectNodes.forEach((node) => {
        const deletePid = node.pid
        if (!deletePid) {
          const delIndex = bannerStore.banner.findIndex((val) => val._id === node._id)
          if (delIndex !== -1) {
            bannerStore.splice({ start: delIndex, deleteCount: 1 })
          }
        } else {
          const parentNode = findNodeById(bannerStore.banner, node.pid, { idKey: '_id' })
          const delIndex = parentNode?.children?.findIndex((val) => val._id === node._id)
          if (delIndex != null && delIndex !== -1) {
            bannerStore.splice({ start: delIndex, deleteCount: 1, opData: parentNode?.children })
          }
        }
      })
      const delNodeIds: string[] = []
      forEachForest(selectNodes, (node) => {
        if (node.type !== 'folder') {
          delNodeIds.push(node._id)
        }
      })
      projectNavStore.deleteNavByIds({
        projectId,
        ids: delNodeIds,
        force: true,
      })
      return { code: 0, data: { deletedCount: deleteIds.length, deletedIds: deleteIds } }
    },
  },
  {
    name: 'getAllNodeIds',
    description: 'Retrieve IDs of all nodes in the current project with optional type filtering. Returns a flat list including folders and all nested descendants. Use this to collect node IDs for batch operations like mass deletion or analysis. For deleting all nodes, prefer deleteAllNodes instead.',
    type: 'nodeOperation',
    parameters: {
      type: 'object',
      properties: {
        filterType: {
          type: 'string',
          enum: ['folder', 'http', 'httpMock', 'websocket', 'websocketMock'],
          description: 'Optional, filter by node type. If not provided, returns all types of nodes',
        },
      },
      required: [],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const filterType = args.filterType as ApidocType | undefined
      const bannerStore = useBanner()
      const allNodes: { _id: string; type: ApidocType; name: string; pid: string }[] = []
      forEachForest(bannerStore.banner, (node) => {
        if (!filterType || node.type === filterType) {
          allNodes.push({
            _id: node._id,
            type: node.type,
            name: node.name,
            pid: node.pid,
          })
        }
      })
      return {
        code: 0,
        data: {
          count: allNodes.length,
          nodes: allNodes,
        },
      }
    },
  },
  {
    name: 'deleteAllNodes',
    description: 'Clear all content from the current project by deleting every node (DESTRUCTIVE OPERATION). Removes all folders, HTTP APIs, WebSocket connections, and Mock servers. The project container itself remains intact. Requires confirmation. To delete the project entirely, use deleteProject instead.',
    type: 'nodeOperation',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
    needConfirm: true,
    execute: async () => {
      const bannerStore = useBanner()
      const projectNavStore = useProjectNav()
      const projectId = router.currentRoute.value.query.id as string
      if (!projectId) {
        return { code: 1, data: { error: '未找到当前项目ID' } }
      }
      const allIds: string[] = []
      const nonFolderIds: string[] = []
      forEachForest(bannerStore.banner, (node) => {
        allIds.push(node._id)
        if (node.type !== 'folder') {
          nonFolderIds.push(node._id)
        }
      })
      if (allIds.length === 0) {
        return { code: 0, data: { message: '项目已为空，无需删除', deletedCount: 0 } }
      }
      const runtimeStore = useRuntime()
      if (runtimeStore.networkMode !== 'offline') {
        await request.delete('/api/project/doc', { data: { projectId, ids: allIds } })
        await bannerStore.getDocBanner({ projectId })
        projectNavStore.deleteNavByIds({ projectId, ids: nonFolderIds, force: true })
        return { code: 0, data: { deletedCount: allIds.length, deletedIds: allIds } }
      }
      await apiNodesCache.deleteNodes(allIds)
      bannerStore.banner = []
      projectNavStore.deleteNavByIds({
        projectId,
        ids: nonFolderIds,
        force: true,
      })
      return { code: 0, data: { deletedCount: allIds.length, deletedIds: allIds } }
    },
  },
  {
    name: 'changeNodeSort',
    description: 'Adjust the sort order of a single node. Lower sort values appear higher in lists, higher values appear lower. Use this for precise positioning. For reordering multiple nodes at once, use changeNodesSort.',
    type: 'nodeOperation',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: 'The unique identifier of the node to reorder',
        },
        sort: {
          type: 'number',
          description: 'New sort value (typically a timestamp or sequential number). Lower values = higher position',
        },
      },
      required: ['nodeId', 'sort'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const nodeId = args.nodeId as string
      const sort = args.sort as number
      const bannerStore = useBanner()
      const node = findNodeById(bannerStore.banner, nodeId, { idKey: '_id' }) as ApidocBanner | null
      if (!node) {
        return { code: 1, data: { error: '未找到要修改排序的节点' } }
      }
      const runtimeStore = useRuntime()
      if (runtimeStore.networkMode !== 'offline') {
        const projectId = router.currentRoute.value.query.id as string
        if (!projectId) {
          return { code: 1, data: { error: '未找到当前项目ID' } }
        }
        await request.put('/api/project/change_doc_pos', { projectId, _id: nodeId, pid: node.pid || '', sort })
        node.sort = sort
        return { code: 0, data: { nodeId, sort } }
      }
      await apiNodesCache.updateNodeById(nodeId, { sort })
      node.sort = sort
      return { code: 0, data: { nodeId, sort } }
    },
  },
  {
    name: 'changeNodesSort',
    description: 'Batch update sort order for multiple nodes efficiently. Lower sort values position nodes higher in lists. Use this to reorder an entire section or reorganize folder contents in one operation.',
    type: 'nodeOperation',
    parameters: {
      type: 'object',
      properties: {
        nodes: {
          type: 'array',
          description: 'Array of nodes to reorder, each specifying nodeId and new sort value',
          items: {
            type: 'object',
            properties: {
              nodeId: { type: 'string', description: 'The unique identifier of the node to reorder' },
              sort: { type: 'number', description: 'New sort value (lower = higher position)' },
            },
            required: ['nodeId', 'sort'],
          },
        },
      },
      required: ['nodes'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const nodes = args.nodes as { nodeId: string; sort: number }[]
      if (!nodes || nodes.length === 0) {
        return { code: 1, data: { error: '节点列表不能为空' } }
      }
      const bannerStore = useBanner()
      const results: { nodeId: string; sort: number; success: boolean }[] = []  
      const runtimeStore = useRuntime()
      const isOnline = runtimeStore.networkMode !== 'offline'
      const projectId = isOnline ? router.currentRoute.value.query.id as string : ''
      if (isOnline && !projectId) {
        return { code: 1, data: { error: '未找到当前项目ID' } }
      }
      for (const item of nodes) {
        const node = findNodeById(bannerStore.banner, item.nodeId, { idKey: '_id' }) as ApidocBanner | null
        if (!node) {
          results.push({ nodeId: item.nodeId, sort: item.sort, success: false })
          continue
        }
        if (isOnline) {
          await request.put('/api/project/change_doc_pos', { projectId, _id: item.nodeId, pid: node.pid || '', sort: item.sort })
          node.sort = item.sort
          results.push({ nodeId: item.nodeId, sort: item.sort, success: true })
          continue
        }
        await apiNodesCache.updateNodeById(item.nodeId, { sort: item.sort })    
        node.sort = item.sort
        results.push({ nodeId: item.nodeId, sort: item.sort, success: true })   
      }
      if (isOnline) {
        await bannerStore.getDocBanner({ projectId })
      }
      const successCount = results.filter(r => r.success).length
      const failCount = results.filter(r => !r.success).length
      return { code: 0, data: { total: nodes.length, successCount, failCount, results } }
    },
  },
  {
    name: 'searchNodes',
    description: 'Find nodes in the current project using flexible search criteria with fuzzy matching. Search by general keyword (searches name + URL), specific name, node type, or maintainer. Supports result limits and optional inclusion of deleted nodes. Returns metadata including URLs for HTTP/WebSocket/Mock nodes.',
    type: 'nodeOperation',
    parameters: {
      type: 'object',
      properties: {
        keyword: {
          type: 'string',
          description: 'General search term that fuzzy-matches against both node names and URLs (HTTP/WebSocket/Mock)',
        },
        type: {
          type: 'string',
          enum: ['folder', 'http', 'httpMock', 'websocket', 'websocketMock'],
          description: 'Filter to exact node type. Omit to search all types',
        },
        name: {
          type: 'string',
          description: 'Filter by node name with fuzzy matching',
        },
        maintainer: {
          type: 'string',
          description: 'Filter by maintainer username with fuzzy matching',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return (default 50). Use -1 or 0 for unlimited results',
        },
        includeDeleted: {
          type: 'boolean',
          description: 'Whether to include soft-deleted nodes in results (default false)',
        },
      },
      required: [],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const keyword = args.keyword as string | undefined
      const nodeType = args.type as ApidocType | undefined
      const name = args.name as string | undefined
      const maintainer = args.maintainer as string | undefined
      const limitArg = args.limit as number | undefined
      const limit = limitArg === undefined ? 50 : limitArg
      const includeDeleted = (args.includeDeleted as boolean) || false
      const projectId = router.currentRoute.value.query.id as string
      if (!projectId) {
        return { code: 1, data: { error: '未找到当前项目ID' } }
      }
      const runtimeStore = useRuntime()
      if (runtimeStore.networkMode !== 'offline') {
        const bannerStore = useBanner()
        const allNodes: { _id: string; type: ApidocType; name: string; pid: string; maintainer: string; url?: string; method?: string; protocol?: string; port?: number; deleted?: boolean }[] = []
        forEachForest(bannerStore.banner, (node) => {
          const base = { _id: node._id, type: node.type, name: node.name, pid: node.pid, maintainer: node.maintainer }
          if (node.type === 'http') {
            allNodes.push({ ...base, method: String(node.method), url: String(node.url) })
            return
          }
          if (node.type === 'websocket') {
            const url = typeof node.url === 'string' ? node.url : (node.url?.path || '')
            allNodes.push({ ...base, protocol: String(node.protocol), url })
            return
          }
          if (node.type === 'httpMock') {
            allNodes.push({ ...base, method: String(node.method), url: String(node.url), port: node.port })
            return
          }
          if (node.type === 'websocketMock') {
            allNodes.push({ ...base, url: String((node as { path?: string }).path || ''), port: (node as { port?: number }).port, deleted: false })
            return
          }
          allNodes.push(base)
        })
        let merged = allNodes
        if (includeDeleted) {
          const deleted = await request.post<{ rows: { _id: string; pid: string; name: string; type: ApidocType; path: string; method: string; protocol?: 'ws' | 'wss'; updatedAt: string; deletePerson: string; isFolder: boolean }[]; total: number }, { rows: { _id: string; pid: string; name: string; type: ApidocType; path: string; method: string; protocol?: 'ws' | 'wss'; updatedAt: string; deletePerson: string; isFolder: boolean }[]; total: number }>('/api/docs/docs_deleted_list', {
            projectId,
            pageNum: 1,
            pageSize: limit <= 0 ? 100 : Math.min(limit, 100),
            url: keyword || '',
            docName: keyword || '',
            operators: [],
            startTime: null,
            endTime: null,
          })
          const deletedNodes = deleted.rows.map((n) => ({
            _id: n._id,
            type: n.type,
            name: n.name,
            pid: n.pid,
            maintainer: '',
            url: n.path,
            method: n.method,
            protocol: n.protocol,
            deleted: true,
          }))
          merged = [...merged, ...deletedNodes]
        }
        const filtered = merged.filter((node) => {
          if (nodeType && node.type !== nodeType) return false
          if (name && !node.name.toLowerCase().includes(name.toLowerCase())) return false
          if (maintainer && !node.maintainer.toLowerCase().includes(maintainer.toLowerCase())) return false
          if (keyword) {
            const kw = keyword.toLowerCase()
            const matchName = node.name.toLowerCase().includes(kw)
            const matchUrl = (node.url || '').toLowerCase().includes(kw)
            if (!matchName && !matchUrl) return false
          }
          return true
        })
        const limited = limit <= 0 ? filtered : filtered.slice(0, limit)
        return { code: 0, data: { count: limited.length, total: filtered.length, nodes: limited } }
      }
      const allNodes = await apiNodesCache.getNodesByProjectId(projectId)       
      const filteredNodes = allNodes.filter(node => {
        if (!includeDeleted && (node as HttpNode).isDeleted) return false       
        if (nodeType && node.info.type !== nodeType) return false
        if (name && !node.info.name.toLowerCase().includes(name.toLowerCase())) return false
        if (maintainer && !node.info.maintainer.toLowerCase().includes(maintainer.toLowerCase())) return false
        if (keyword) {
          const kw = keyword.toLowerCase()
          const matchName = node.info.name.toLowerCase().includes(kw)
          let matchUrl = false
          if (node.info.type === 'http') {
            matchUrl = (node as HttpNode).item.url.path.toLowerCase().includes(kw)
          } else if (node.info.type === 'websocket') {
            matchUrl = (node as WebSocketNode).item.url.path.toLowerCase().includes(kw)
          } else if (node.info.type === 'httpMock') {
            matchUrl = (node as HttpMockNode).requestCondition.url.toLowerCase().includes(kw)
          }
          if (!matchName && !matchUrl) return false
        }
        return true
      })
      const limitedNodes = limit <= 0 ? filteredNodes : filteredNodes.slice(0, limit)
      const result = limitedNodes.map(node => {
        const base = {
          _id: node._id,
          type: node.info.type,
          name: node.info.name,
          pid: node.pid,
          maintainer: node.info.maintainer,
        }
        if (node.info.type === 'http') {
          const httpNode = node as HttpNode
          return { ...base, method: httpNode.item.method, url: httpNode.item.url.path }
        }
        if (node.info.type === 'websocket') {
          const wsNode = node as WebSocketNode
          return { ...base, protocol: wsNode.item.protocol, url: wsNode.item.url.path }
        }
        if (node.info.type === 'httpMock') {
          const mockNode = node as HttpMockNode
          return { ...base, method: 'ALL', url: mockNode.requestCondition.url, port: mockNode.requestCondition.port }
        }
        return base
      })
      return {
        code: 0,
        data: {
          count: result.length,
          total: filteredNodes.length,
          nodes: result,
        },
      }
    },
  },
  {
    name: 'getFolderList',
    description: 'Retrieve all folder (directory) nodes in a project, including nested subfolders at all depth levels. Returns folder metadata with IDs, names, parent references, and descriptions. Use this to analyze project structure or gather folder information for batch operations.',
    type: 'nodeOperation',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'The unique identifier of the project to scan for folders',
        },
      },
      required: ['projectId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const projectId = args.projectId as string
      const result = await skillStore.getFolderList(projectId)
      return {
        code: 0,
        data: result.map(folder => ({
          _id: folder._id,
          pid: folder.pid,
          name: folder.info.name,
          description: folder.info.description,
        })),
      }
    },
  },
  {
    name: 'renameFolder',
    description: 'Change the name of a single folder (directory). Use this for explicit one-off folder renaming. For renaming multiple folders, use batchRenameFolders. For AI-powered automatic renaming based on contents, use autoRenameFoldersByContent.',
    type: 'nodeOperation',
    parameters: {
      type: 'object',
      properties: {
        folderId: {
          type: 'string',
          description: 'The unique identifier of the folder to rename',
        },
        newName: {
          type: 'string',
          description: 'The new display name for the folder',
        },
      },
      required: ['folderId', 'newName'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const folderId = args.folderId as string
      const newName = args.newName as string
      const result = await skillStore.renameFolder(folderId, newName)
      return {
        code: result ? 0 : 1,
        data: result,
      }
    },
  },
  {
    name: 'batchRenameFolders',
    description: 'Rename multiple folders in a single operation for efficient bulk updates. Provide explicit new names for each folder. Returns success/failure counts. Use autoRenameFoldersByContent for AI-powered automatic naming.',
    type: 'nodeOperation',
    parameters: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          description: 'Array of folder rename operations',
          items: {
            type: 'object',
            properties: {
              folderId: {
                type: 'string',
                description: 'The unique identifier of the folder to rename',
              },
              newName: {
                type: 'string',
                description: 'The new display name for this folder',
              },
            },
            required: ['folderId', 'newName'],
          },
        },
      },
      required: ['items'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const items = args.items as { folderId: string; newName: string }[]
      const result = await skillStore.batchRenameFolders(items)
      return {
        code: result.failed.length === 0 ? 0 : 1,
        data: result,
      }
    },
  },
  {
    name: 'getFolderChildrenForRename',
    description: 'Extract comprehensive content data from a folder and all its children for context-aware renaming. Returns the target folder metadata, all subfolders, and all child nodes (HTTP/WebSocket/Mock) with their URLs and descriptions. Use this data to generate meaningful folder names based on actual contents. Typically precedes AI-powered renaming operations.',
    type: 'nodeOperation',
    parameters: {
      type: 'object',
      properties: {
        folderId: {
          type: 'string',
          description: 'The unique identifier of the folder to analyze',
        },
        projectId: {
          type: 'string',
          description: 'The unique identifier of the containing project',
        },
      },
      required: ['folderId', 'projectId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const folderId = args.folderId as string
      const projectId = args.projectId as string
      const result = await skillStore.getFolderChildrenForRename(folderId, projectId)
      if (!result) {
        return {
          code: 1,
          data: '文件夹不存在',
        }
      }
      return {
        code: 0,
        data: result,
      }
    },
  },
  {
    name: 'autoRenameFoldersByContent',
    description: 'Automatically generate and apply meaningful folder names using AI analysis of folder contents (AI-Powered Smart Rename). Analyzes all child nodes (APIs, WebSockets, sub-folders) and their purposes, then calls LLM to suggest contextually appropriate names. Executes the renaming automatically. Use this when users want intelligent folder organization without manually specifying names.',
    type: 'nodeOperation',
    parameters: {
      type: 'object',
      properties: {
        folderId: {
          type: 'string',
          description: 'The unique identifier of the folder to automatically rename based on its contents',
        },
        projectId: {
          type: 'string',
          description: 'The unique identifier of the containing project',
        },
      },
      required: ['folderId', 'projectId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const llmClientStore = useLLMClientStore()
      const folderId = args.folderId as string
      const projectId = args.projectId as string
      const folderData = await skillStore.getFolderChildrenForRename(folderId, projectId)
      if (!folderData) {
        return { code: 1, data: { success: false, message: '文件夹不存在' } }
      }
      const foldersToRename = [
        { _id: folderData.folder._id, name: folderData.folder.name },
        ...folderData.childFolders.map(f => ({ _id: f._id, name: f.name })),
      ]
      if (foldersToRename.length === 0) {
        return { code: 0, data: { success: true, message: '没有需要重命名的文件夹', renamed: [] } }
      }
      const systemPrompt = folderAutoRenameSystemPrompt
      const userMessage = buildFolderAutoRenameUserPrompt(folderData)
      try {
        const response = await llmClientStore.chat({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
        })
        const content = response.choices[0]?.message?.content || ''
        const jsonMatch = content.match(/\[.*\]/s)
        if (!jsonMatch) {
          return { code: 1, data: { success: false, message: 'AI返回格式错误', raw: content } }
        }
        const renameItems = JSON.parse(jsonMatch[0]) as { _id: string; newName: string }[]
        const result = await skillStore.batchRenameFolders(renameItems.map(item => ({ folderId: item._id, newName: item.newName })))
        return {
          code: result.failed.length === 0 ? 0 : 1,
          data: { success: result.failed.length === 0, renamed: renameItems, result },
        }
      } catch (error) {
        return {
          code: 1,
          data: { success: false, message: error instanceof Error ? error.message : '重命名失败' },
        }
      }
    },
  },
]
