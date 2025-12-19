import { AgentTool } from '@src/types/ai'
import { ApidocBanner, ApidocType } from '@src/types'
import { useBanner } from '@/store/projectWorkbench/bannerStore'
import { useProjectNav } from '@/store/projectWorkbench/projectNavStore'
import { apiNodesCache } from '@/cache/nodes/nodesCache'
import { findNodeById, findParentById, findSiblingById, flatTree, forEachForest, uniqueByKey } from '@/helper'
import { router } from '@/router/index'
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
    description: '获取指定文件夹下的子节点列表。可以获取根目录或任意文件夹下的直接子节点，支持按节点类型过滤。常用于查看项目结构、统计节点、批量操作前的信息收集等场景',
    type: 'nodeOperation',
    parameters: {
      type: 'object',
      properties: {
        folderId: {
          type: 'string',
          description: '文件夹ID。传空字符串或不传表示获取根目录下的节点',
        },
        filterType: {
          type: 'string',
          enum: ['folder', 'http', 'httpMock', 'websocket', 'websocketMock', 'markdown'],
          description: '可选，按节点类型过滤。不传则返回所有类型的节点',
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
    description: '复制节点到剪贴板。可以复制单个或多个节点，复制后可以使用pasteNodes粘贴到目标位置',
    type: 'nodeOperation',
    parameters: {
      type: 'object',
      properties: {
        nodeIds: {
          type: 'array',
          description: '要复制的节点ID列表',
          items: { type: 'string' },
        },
        projectId: {
          type: 'string',
          description: '节点所属的项目ID',
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
    description: '剪切节点。剪切后粘贴时会删除原节点',
    type: 'nodeOperation',
    parameters: {
      type: 'object',
      properties: {
        nodeIds: {
          type: 'array',
          description: '要剪切的节点ID列表',
          items: { type: 'string' },
        },
        projectId: {
          type: 'string',
          description: '节点所属的项目ID',
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
    description: '粘贴节点到目标文件夹。只能粘贴到文件夹内或根目录。如果之前是剪切操作，粘贴后会删除原节点',
    type: 'nodeOperation',
    parameters: {
      type: 'object',
      properties: {
        targetFolderId: {
          type: 'string',
          description: '目标文件夹ID，如果粘贴到根目录则传空字符串',
        },
        nodes: {
          type: 'array',
          description: '要粘贴的节点数据（从copyNodes或cutNodes的返回结果中获取）',
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
    description: '生成节点的副本。在原节点后面插入一个名称带"_副本"后缀的拷贝',
    type: 'nodeOperation',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: '要复制的节点ID',
        },
      },
      required: ['nodeId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const nodeId = args.nodeId as string
      const bannerStore = useBanner()
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
    description: '拖拽节点到新位置。支持before（放在目标节点前）、after（放在目标节点后）、inner（放入目标文件夹内）三种放置类型。注意：文件夹只能放在文件夹之前，非文件夹节点不能放在文件夹前面，只有文件夹可以包含子节点',
    type: 'nodeOperation',
    parameters: {
      type: 'object',
      properties: {
        sourceNodeId: {
          type: 'string',
          description: '要拖拽的源节点ID',
        },
        targetNodeId: {
          type: 'string',
          description: '目标节点ID',
        },
        dropType: {
          type: 'string',
          enum: ['before', 'after', 'inner'],
          description: '放置类型：before-放在目标前面，after-放在目标后面，inner-放入目标内部（仅限文件夹）',
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
    description: '移动节点到新的父文件夹。可以将节点移动到其他文件夹下或移动到根目录。注意：文件夹不能移动到非文件夹节点内部',
    type: 'nodeOperation',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: '要移动的节点ID',
        },
        newPid: {
          type: 'string',
          description: '新的父节点ID（必须是文件夹），移动到根目录则传空字符串',
        },
      },
      required: ['nodeId', 'newPid'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const nodeId = args.nodeId as string
      const newPid = (args.newPid as string) || ''
      const bannerStore = useBanner()
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
    description: '重命名节点',
    type: 'nodeOperation',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: '节点ID',
        },
        newName: {
          type: 'string',
          description: '新的节点名称',
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
    description: '删除节点。如果删除的是文件夹，会级联删除所有子节点',
    type: 'nodeOperation',
    parameters: {
      type: 'object',
      properties: {
        nodeIds: {
          type: 'array',
          description: '要删除的节点ID列表',
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
    description: '获取当前项目下的所有节点ID列表（包括文件夹和所有子节点）。常用于批量删除、批量操作等场景。如需删除全部节点，推荐直接使用 deleteAllNodes 工具',
    type: 'nodeOperation',
    parameters: {
      type: 'object',
      properties: {
        filterType: {
          type: 'string',
          enum: ['folder', 'http', 'httpMock', 'websocket', 'websocketMock', 'markdown'],
          description: '可选，按节点类型过滤。不传则返回所有类型的节点',
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
    description: '删除当前项目下的所有节点（清空项目）。这是一个危险操作，会删除项目中的全部文件夹和接口节点',
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
    description: '改变节点的排序值。sort值越小越靠前，越大越靠后',
    type: 'nodeOperation',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: '要改变排序的节点ID',
        },
        sort: {
          type: 'number',
          description: '新的排序值',
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
      await apiNodesCache.updateNodeById(nodeId, { sort })
      node.sort = sort
      return { code: 0, data: { nodeId, sort } }
    },
  },
  {
    name: 'changeNodesSort',
    description: '批量改变多个节点的排序值。sort值越小越靠前，越大越靠后',
    type: 'nodeOperation',
    parameters: {
      type: 'object',
      properties: {
        nodes: {
          type: 'array',
          description: '要修改排序的节点列表',
          items: {
            type: 'object',
            properties: {
              nodeId: { type: 'string', description: '节点ID' },
              sort: { type: 'number', description: '新的排序值' },
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
      for (const item of nodes) {
        const node = findNodeById(bannerStore.banner, item.nodeId, { idKey: '_id' }) as ApidocBanner | null
        if (!node) {
          results.push({ nodeId: item.nodeId, sort: item.sort, success: false })
          continue
        }
        await apiNodesCache.updateNodeById(item.nodeId, { sort: item.sort })
        node.sort = item.sort
        results.push({ nodeId: item.nodeId, sort: item.sort, success: true })
      }
      const successCount = results.filter(r => r.success).length
      const failCount = results.filter(r => !r.success).length
      return { code: 0, data: { total: nodes.length, successCount, failCount, results } }
    },
  },
  {
    name: 'searchNodes',
    description: '搜索节点。支持按名称、类型、关键词等条件搜索项目中的所有节点（包括folder、http、websocket、httpMock等类型），返回匹配的节点列表',
    type: 'nodeOperation',
    parameters: {
      type: 'object',
      properties: {
        keyword: {
          type: 'string',
          description: '通用关键词，同时搜索名称和URL（模糊匹配）',
        },
        type: {
          type: 'string',
          enum: ['folder', 'http', 'httpMock', 'websocket', 'websocketMock', 'markdown'],
          description: '节点类型（精确匹配）',
        },
        name: {
          type: 'string',
          description: '节点名称（模糊匹配）',
        },
        maintainer: {
          type: 'string',
          description: '维护人员（模糊匹配）',
        },
        limit: {
          type: 'number',
          description: '返回结果数量限制，默认50。传 -1 或 0 可获取全部节点',
        },
        includeDeleted: {
          type: 'boolean',
          description: '是否包含已删除的节点，默认false',
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
    description: '获取项目下所有文件夹（目录）列表，包括子文件夹',
    type: 'nodeOperation',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: '项目ID',
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
    description: '重命名单个文件夹（目录）',
    type: 'nodeOperation',
    parameters: {
      type: 'object',
      properties: {
        folderId: {
          type: 'string',
          description: '文件夹ID',
        },
        newName: {
          type: 'string',
          description: '新的文件夹名称',
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
    description: '批量重命名多个文件夹（目录）',
    type: 'nodeOperation',
    parameters: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          description: '重命名项列表',
          items: {
            type: 'object',
            properties: {
              folderId: {
                type: 'string',
                description: '文件夹ID',
              },
              newName: {
                type: 'string',
                description: '新的文件夹名称',
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
    description: '获取指定文件夹及其所有子节点内容，用于根据子节点内容生成有意义的文件夹命名。返回目标文件夹、所有子文件夹和所有类型的子节点信息。',
    type: 'nodeOperation',
    parameters: {
      type: 'object',
      properties: {
        folderId: {
          type: 'string',
          description: '目标文件夹ID',
        },
        projectId: {
          type: 'string',
          description: '项目ID',
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
    description: '根据文件夹下所有子节点内容，自动调用AI生成有意义的文件夹命名并执行重命名。适用于用户希望批量重命名目录但未指定具体名称的场景。',
    type: 'nodeOperation',
    parameters: {
      type: 'object',
      properties: {
        folderId: {
          type: 'string',
          description: '目标文件夹ID',
        },
        projectId: {
          type: 'string',
          description: '项目ID',
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
