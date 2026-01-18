import { cloneDeep, assign, merge } from "lodash-es"
import { HttpNode, ApidocProperty, ApidocProjectInfo, HttpNodeRequestMethod, HttpNodeContentType, HttpNodeBodyMode, FolderNode, ApidocBannerOfHttpNode, ApidocBannerOfFolderNode, ApidocBanner, ApidocVariable, HttpMockNode, ApidocBannerOfHttpMockNode, WebSocketNode, ApidocBannerOfWebsocketNode, WebSocketMockNode, ApidocBannerOfWebSocketMockNode } from '@src/types'
import { CreateHttpNodeOptions, CreateHttpMockNodeOptions, CreateWebsocketNodeOptions, CreateWebsocketMockNodeOptions } from '@src/types/ai/tools.type'
import { defineStore } from "pinia"
import { DeepPartial } from "@src/types/index.ts"
import { apiNodesCache } from "@/cache/nodes/nodesCache";
import { nodeVariableCache } from "@/cache/variable/nodeVariableCache";
import { logger } from '@/helper/logger';
import { generateEmptyHttpNode, generateHttpNode, inferContentTypeFromBody, findNodeById, findParentById, generateEmptyProperty, generateEmptyHttpMockNode, generateEmptyWebsocketNode, generateEmptyWebSocketMockNode } from '@/helper';
import { useHttpNode } from "../httpNode/httpNodeStore";
import { useProjectManagerStore } from "../projectManager/projectManagerStore";
import { useBanner } from "../projectWorkbench/bannerStore";
import { useProjectNav } from "../projectWorkbench/projectNavStore";
import { useProjectWorkbench } from "../projectWorkbench/projectWorkbenchStore";
import { useCommonHeader } from "../projectWorkbench/commonHeaderStore";
import { useRuntime } from "../runtime/runtimeStore";
import { router } from "@/router";
import { IPC_EVENTS } from "@src/types/ipc";
import { nanoid } from "nanoid";

export const useSkill = defineStore('skill', () => {
  /*
  |--------------------------------------------------------------------------
  | httpNode相关逻辑
  |--------------------------------------------------------------------------
  */
  //创建httpNode
  const createHttpNode = async (options: CreateHttpNodeOptions): Promise<HttpNode | null> => {
    const node = generateEmptyHttpNode(nanoid());
    node.projectId = options.projectId;
    node.pid = options.pid || '';
    node.info.name = options.name;
    node.info.description = options.description || '';
    if (options.version !== undefined) {
      node.info.version = options.version;
    }
    if (options.creator !== undefined) {
      node.info.creator = options.creator;
    }
    if (options.maintainer !== undefined) {
      node.info.maintainer = options.maintainer;
    }
    if (options.item) {
      const { item } = options;
      if (item.method !== undefined) {
        node.item.method = item.method;
      }
      if (item.url) {
        if (item.url.path !== undefined) {
          node.item.url.path = item.url.path;
        }
        if (item.url.prefix !== undefined) {
          node.item.url.prefix = item.url.prefix;
        }
      }
      if (item.paths !== undefined) {
        node.item.paths = item.paths;
        const lastPath = node.item.paths[node.item.paths.length - 1];
        if (!lastPath || lastPath.key !== '' || lastPath.value !== '') {
          node.item.paths.push(generateEmptyProperty());
        }
      }
      if (item.queryParams !== undefined) {
        node.item.queryParams = item.queryParams;
        const lastQueryParam = node.item.queryParams[node.item.queryParams.length - 1];
        if (!lastQueryParam || lastQueryParam.key !== '' || lastQueryParam.value !== '') {
          node.item.queryParams.push(generateEmptyProperty());
        }
      }
      if (item.headers !== undefined) {
        node.item.headers = item.headers;
        const lastHeader = node.item.headers[node.item.headers.length - 1];
        if (!lastHeader || lastHeader.key !== '' || lastHeader.value !== '') {
          node.item.headers.push(generateEmptyProperty());
        }
      }
      if (item.responseParams !== undefined) {
        node.item.responseParams = item.responseParams;
      }
      if (item.requestBody) {
        const { requestBody } = item;
        if (requestBody.mode !== undefined) {
          node.item.requestBody.mode = requestBody.mode;
        }
        if (requestBody.rawJson !== undefined) {
          node.item.requestBody.rawJson = requestBody.rawJson;
        }
        if (requestBody.formdata !== undefined) {
          node.item.requestBody.formdata = requestBody.formdata;
          const lastFormdata = node.item.requestBody.formdata[node.item.requestBody.formdata.length - 1];
          if (!lastFormdata || lastFormdata.key !== '' || lastFormdata.value !== '') {
            node.item.requestBody.formdata.push(generateEmptyProperty());
          }
        }
        if (requestBody.urlencoded !== undefined) {
          node.item.requestBody.urlencoded = requestBody.urlencoded;
          const lastUrlencoded = node.item.requestBody.urlencoded[node.item.requestBody.urlencoded.length - 1];
          if (!lastUrlencoded || lastUrlencoded.key !== '' || lastUrlencoded.value !== '') {
            node.item.requestBody.urlencoded.push(generateEmptyProperty());
          }
        }
        if (requestBody.raw !== undefined) {
          node.item.requestBody.raw = { ...node.item.requestBody.raw, ...requestBody.raw };
        }
        if (requestBody.binary !== undefined) {
          node.item.requestBody.binary = { ...node.item.requestBody.binary, ...requestBody.binary };
        }
      }
      if (item.contentType !== undefined) {
        node.item.contentType = item.contentType;
      } else {
        node.item.contentType = inferContentTypeFromBody(node.item.requestBody);
      }
    }
    if (options.preRequest !== undefined) {
      node.preRequest = options.preRequest;
    }
    if (options.afterRequest !== undefined) {
      node.afterRequest = options.afterRequest;
    }
    node.sort = Date.now();
    const now = new Date().toISOString();
    node.createdAt = now;
    node.updatedAt = now;
    node.isDeleted = false;
    const success = await apiNodesCache.addNode(node);
    if (!success) {
      logger.error('新增http节点失败', { projectId: options.projectId });
      return null;
    }
    // 同步更新banner和nav
    const currentProjectId = router.currentRoute.value.query.id as string;
    if (currentProjectId === options.projectId) {
      const bannerStore = useBanner();
      const projectNavStore = useProjectNav();
      const bannerNode: ApidocBannerOfHttpNode = {
        _id: node._id,
        updatedAt: node.updatedAt,
        type: 'http',
        sort: node.sort,
        pid: node.pid,
        name: node.info.name,
        maintainer: node.info.maintainer,
        method: node.item.method,
        url: node.item.url.path,
        readonly: false,
        children: [],
      };
      if (!node.pid) {
        bannerStore.splice({ start: bannerStore.banner.length, deleteCount: 0, item: bannerNode });
      } else {
        const parentNode = findNodeById(bannerStore.banner, node.pid, { idKey: '_id' }) as ApidocBanner | null;
        if (parentNode && parentNode.children) {
          bannerStore.splice({ start: parentNode.children.length, deleteCount: 0, item: bannerNode, opData: parentNode.children });
        }
      }
      projectNavStore.addNav({
        _id: node._id,
        projectId: options.projectId,
        tabType: 'http',
        label: node.info.name,
        saved: true,
        fixed: true,
        selected: true,
        head: { icon: node.item.method, color: '' },
      });
    }
    return node;
  }
  //创建httpMockNode
  const createHttpMockNode = async (options: CreateHttpMockNodeOptions): Promise<HttpMockNode | null> => {
    const node = generateEmptyHttpMockNode(nanoid());
    node.projectId = options.projectId;
    node.pid = options.pid || '';
    node.info.name = options.name;
    node.info.description = options.description || '';
    if (options.method !== undefined) {
      node.requestCondition.method = options.method;
    }
    if (options.url !== undefined) {
      node.requestCondition.url = options.url;
    }
    if (options.port !== undefined) {
      node.requestCondition.port = options.port;
    }
    if (options.delay !== undefined) {
      node.config.delay = options.delay;
    }
    node.sort = Date.now();
    const now = new Date().toISOString();
    node.createdAt = now;
    node.updatedAt = now;
    node.isDeleted = false;
    const success = await apiNodesCache.addNode(node);
    if (!success) {
      logger.error('新增httpMock节点失败', { projectId: options.projectId });
      return null;
    }
    const currentProjectId = router.currentRoute.value.query.id as string;
    if (currentProjectId === options.projectId) {
      const bannerStore = useBanner();
      const projectNavStore = useProjectNav();
      const bannerNode: ApidocBannerOfHttpMockNode = {
        _id: node._id,
        updatedAt: node.updatedAt,
        type: 'httpMock',
        sort: node.sort,
        pid: node.pid,
        name: node.info.name,
        maintainer: node.info.maintainer,
        method: node.requestCondition.method[0] || 'ALL',
        url: node.requestCondition.url,
        port: node.requestCondition.port,
        readonly: false,
        state: 'stopped',
        children: [],
      };
      if (!node.pid) {
        bannerStore.splice({ start: bannerStore.banner.length, deleteCount: 0, item: bannerNode });
      } else {
        const parentNode = findNodeById(bannerStore.banner, node.pid, { idKey: '_id' }) as ApidocBanner | null;
        if (parentNode && parentNode.children) {
          bannerStore.splice({ start: parentNode.children.length, deleteCount: 0, item: bannerNode, opData: parentNode.children });
        }
      }
      projectNavStore.addNav({
        _id: node._id,
        projectId: options.projectId,
        tabType: 'httpMock',
        label: node.info.name,
        saved: true,
        fixed: true,
        selected: true,
        head: { icon: 'httpMock', color: '' },
      });
    }
    return node;
  }
  //创建websocketNode
  const createWebsocketNode = async (options: CreateWebsocketNodeOptions): Promise<WebSocketNode | null> => {
    const node = generateEmptyWebsocketNode(nanoid());
    node.projectId = options.projectId;
    node.pid = options.pid || '';
    node.info.name = options.name;
    node.info.description = options.description || '';
    if (options.protocol !== undefined) {
      node.item.protocol = options.protocol;
    }
    if (options.url) {
      if (options.url.path !== undefined) {
        node.item.url.path = options.url.path;
      }
      if (options.url.prefix !== undefined) {
        node.item.url.prefix = options.url.prefix;
      }
    }
    if (options.queryParams !== undefined) {
      node.item.queryParams = options.queryParams;
      const lastQueryParam = node.item.queryParams[node.item.queryParams.length - 1];
      if (!lastQueryParam || lastQueryParam.key !== '' || lastQueryParam.value !== '') {
        node.item.queryParams.push(generateEmptyProperty());
      }
    }
    if (options.headers !== undefined) {
      node.item.headers = options.headers;
      const lastHeader = node.item.headers[node.item.headers.length - 1];
      if (!lastHeader || lastHeader.key !== '' || lastHeader.value !== '') {
        node.item.headers.push(generateEmptyProperty());
      }
    }
    node.sort = Date.now();
    const now = new Date().toISOString();
    node.createdAt = now;
    node.updatedAt = now;
    node.isDeleted = false;
    const success = await apiNodesCache.addNode(node);
    if (!success) {
      logger.error('新增websocket节点失败', { projectId: options.projectId });
      return null;
    }
    const currentProjectId = router.currentRoute.value.query.id as string;
    if (currentProjectId === options.projectId) {
      const bannerStore = useBanner();
      const projectNavStore = useProjectNav();
      const bannerNode: ApidocBannerOfWebsocketNode = {
        _id: node._id,
        updatedAt: node.updatedAt,
        type: 'websocket',
        sort: node.sort,
        pid: node.pid,
        name: node.info.name,
        maintainer: node.info.maintainer,
        protocol: node.item.protocol,
        url: node.item.url,
        readonly: false,
        children: [],
      };
      if (!node.pid) {
        bannerStore.splice({ start: bannerStore.banner.length, deleteCount: 0, item: bannerNode });
      } else {
        const parentNode = findNodeById(bannerStore.banner, node.pid, { idKey: '_id' }) as ApidocBanner | null;
        if (parentNode && parentNode.children) {
          bannerStore.splice({ start: parentNode.children.length, deleteCount: 0, item: bannerNode, opData: parentNode.children });
        }
      }
      projectNavStore.addNav({
        _id: node._id,
        projectId: options.projectId,
        tabType: 'websocket',
        label: node.info.name,
        saved: true,
        fixed: true,
        selected: true,
        head: { icon: 'websocket', color: '' },
      });
    }
    return node;
  }
  //创建websocketMockNode
  const createWebsocketMockNode = async (options: CreateWebsocketMockNodeOptions): Promise<WebSocketMockNode | null> => {
    const node = generateEmptyWebSocketMockNode(nanoid());
    node.projectId = options.projectId;
    node.pid = options.pid || '';
    node.info.name = options.name;
    node.info.description = options.description || '';
    if (options.path !== undefined) {
      node.requestCondition.path = options.path;
    }
    if (options.port !== undefined) {
      node.requestCondition.port = options.port;
    }
    if (options.delay !== undefined) {
      node.config.delay = options.delay;
    }
    if (options.echoMode !== undefined) {
      node.config.echoMode = options.echoMode;
    }
    if (options.responseContent !== undefined) {
      node.response.content = options.responseContent;
    }
    node.sort = Date.now();
    const now = new Date().toISOString();
    node.createdAt = now;
    node.updatedAt = now;
    node.isDeleted = false;
    const success = await apiNodesCache.addNode(node);
    if (!success) {
      logger.error('新增websocketMock节点失败', { projectId: options.projectId });
      return null;
    }
    const currentProjectId = router.currentRoute.value.query.id as string;
    if (currentProjectId === options.projectId) {
      const bannerStore = useBanner();
      const projectNavStore = useProjectNav();
      const bannerNode: ApidocBannerOfWebSocketMockNode = {
        _id: node._id,
        updatedAt: node.updatedAt,
        type: 'websocketMock',
        sort: node.sort,
        pid: node.pid,
        name: node.info.name,
        maintainer: node.info.maintainer,
        path: node.requestCondition.path,
        port: node.requestCondition.port,
        readonly: false,
        state: 'stopped',
        children: [],
      };
      if (!node.pid) {
        bannerStore.splice({ start: bannerStore.banner.length, deleteCount: 0, item: bannerNode });
      } else {
        const parentNode = findNodeById(bannerStore.banner, node.pid, { idKey: '_id' }) as ApidocBanner | null;
        if (parentNode && parentNode.children) {
          bannerStore.splice({ start: parentNode.children.length, deleteCount: 0, item: bannerNode, opData: parentNode.children });
        }
      }
      projectNavStore.addNav({
        _id: node._id,
        projectId: options.projectId,
        tabType: 'websocketMock',
        label: node.info.name,
        saved: true,
        fixed: true,
        selected: true,
        head: { icon: 'websocketMock', color: '' },
      });
    }
    return node;
  }
  //删除httpNode
  const deleteHttpNodes = async (nodeIds: string[]): Promise<boolean> => {
    if (nodeIds.length === 0) {
      logger.warn('删除节点失败，参数为空');
      return false;
    }
    const success = await apiNodesCache.deleteNodes(nodeIds);
    if (!success) {
      logger.error('删除节点失败', { nodeIds });
      return false;
    }
    const httpNodeStore = useHttpNode();
    if (nodeIds.includes(httpNodeStore.httpNodeInfo._id)) {
      httpNodeStore.changeHttpNodeInfo(generateHttpNode());
      httpNodeStore.changeOriginHttpNodeInfo();
    }
    // 同步更新banner和nav
    const currentProjectId = router.currentRoute.value.query.id as string;
    if (currentProjectId) {
      const bannerStore = useBanner();
      const projectNavStore = useProjectNav();
      nodeIds.forEach(nodeId => {
        const parentNode = findParentById(bannerStore.banner, nodeId, { idKey: '_id' }) as ApidocBanner | null;
        if (!parentNode) {
          const index = bannerStore.banner.findIndex(n => n._id === nodeId);
          if (index !== -1) {
            bannerStore.splice({ start: index, deleteCount: 1 });
          }
        } else if (parentNode.children) {
          const index = parentNode.children.findIndex(n => n._id === nodeId);
          if (index !== -1) {
            bannerStore.splice({ start: index, deleteCount: 1, opData: parentNode.children });
          }
        }
      });
      projectNavStore.deleteNavByIds({ projectId: currentProjectId, ids: nodeIds, force: true });
    }
    return true;
  }
  //根据名称或URL搜索httpNode节点
  const batchCreateHttpNodes = async (options: { projectId: string; nodes: CreateHttpNodeOptions[] }): Promise<{ success: HttpNode[]; failed: CreateHttpNodeOptions[] }> => {
    const success: HttpNode[] = [];
    const failed: CreateHttpNodeOptions[] = [];
    for (const nodeOptions of options.nodes) {
      const fullOptions = { ...nodeOptions, projectId: options.projectId };
      const result = await createHttpNode(fullOptions);
      if (result) {
        success.push(result);
      } else {
        failed.push(nodeOptions);
      }
    }
    return { success, failed };
  }
  const searchHttpNodes = async (options: {
    projectId: string;
    keyword?: string;
    name?: string;
    description?: string;
    urlPath?: string;
    urlPrefix?: string;
    method?: HttpNodeRequestMethod;
    contentType?: HttpNodeContentType;
    bodyMode?: HttpNodeBodyMode;
    creator?: string;
    maintainer?: string;
    version?: string;
    includeDeleted?: boolean;
  }): Promise<HttpNode[]> => {
    const allNodes = await apiNodesCache.getNodesByProjectId(options.projectId);
    return allNodes.filter(node => {
      if (node.info.type !== 'http') return false;
      const httpNode = node as HttpNode;
      if (!options.includeDeleted && httpNode.isDeleted) return false;
      if (options.keyword) {
        const kw = options.keyword.toLowerCase();
        const matchName = httpNode.info.name.toLowerCase().includes(kw);
        const matchDesc = httpNode.info.description.toLowerCase().includes(kw);
        const matchPath = httpNode.item.url.path.toLowerCase().includes(kw);
        if (!matchName && !matchDesc && !matchPath) return false;
      }
      if (options.name && !httpNode.info.name.toLowerCase().includes(options.name.toLowerCase())) {
        return false;
      }
      if (options.description && !httpNode.info.description.toLowerCase().includes(options.description.toLowerCase())) {
        return false;
      }
      if (options.urlPath && !httpNode.item.url.path.toLowerCase().includes(options.urlPath.toLowerCase())) {
        return false;
      }
      if (options.urlPrefix && !httpNode.item.url.prefix.toLowerCase().includes(options.urlPrefix.toLowerCase())) {
        return false;
      }
      if (options.method && httpNode.item.method !== options.method) {
        return false;
      }
      if (options.contentType && httpNode.item.contentType !== options.contentType) {
        return false;
      }
      if (options.bodyMode && httpNode.item.requestBody.mode !== options.bodyMode) {
        return false;
      }
      if (options.creator && !httpNode.info.creator.toLowerCase().includes(options.creator.toLowerCase())) {
        return false;
      }
      if (options.maintainer && !httpNode.info.maintainer.toLowerCase().includes(options.maintainer.toLowerCase())) {
        return false;
      }
      if (options.version && httpNode.info.version !== options.version) {
        return false;
      }
      return true;
    }) as HttpNode[];
  }
  //根据节点ID获取HttpNode信息
  const getHttpNodeById = async (nodeId: string): Promise<HttpNode | null> => {
    return await apiNodesCache.getNodeById(nodeId) as HttpNode | null;
  }
  //根据节点ID部分更新HttpNode
  const patchHttpNodeInfoById = async (nodeId: string, updates: DeepPartial<HttpNode>): Promise<HttpNode | null> => {
    const existingNode = await apiNodesCache.getNodeById(nodeId) as HttpNode | null;
    if (!existingNode) {
      logger.warn('节点不存在', { nodeId });
      return null;
    }
    const updatedNode = merge(cloneDeep(existingNode), updates) as HttpNode;
    updatedNode.updatedAt = new Date().toISOString();
    const success = await apiNodesCache.replaceNode(updatedNode);
    if (!success) {
      logger.error('更新节点缓存失败', { nodeId });
      return null;
    }
    const httpNodeStore = useHttpNode();
    if (httpNodeStore.httpNodeInfo._id === nodeId) {
      merge(httpNodeStore.httpNodeInfo, updates);
      httpNodeStore.httpNodeInfo.updatedAt = updatedNode.updatedAt;
      httpNodeStore.changeOriginHttpNodeInfo();
    }
    // 如果更新了名称，同步banner和nav
    if (updates.info?.name) {
      const bannerStore = useBanner();
      const projectNavStore = useProjectNav();
      bannerStore.changeBannerInfoById({ id: nodeId, field: 'name', value: updates.info.name });
      projectNavStore.changeNavInfoById({ id: nodeId, field: 'label', value: updates.info.name });
    }
    return updatedNode;
  }
  //根据节点ID添加query参数
  const addQueryParamByNodeId = async (nodeId: string, param: ApidocProperty<'string'>): Promise<HttpNode | null> => {
    const existingNode = await apiNodesCache.getNodeById(nodeId) as HttpNode | null;
    if (!existingNode) {
      logger.warn('节点不存在', { nodeId });
      return null;
    }
    existingNode.item.queryParams.push(param);
    existingNode.updatedAt = new Date().toISOString();
    const success = await apiNodesCache.replaceNode(existingNode);
    if (!success) {
      logger.error('更新节点缓存失败', { nodeId });
      return null;
    }
    const httpNodeStore = useHttpNode();
    if (httpNodeStore.httpNodeInfo._id === nodeId) {
      httpNodeStore.httpNodeInfo.item.queryParams.push(param);
      httpNodeStore.httpNodeInfo.updatedAt = existingNode.updatedAt;
      httpNodeStore.changeOriginHttpNodeInfo();
    }
    return existingNode;
  }
  //根据节点ID和参数ID更新query参数
  const updateQueryParamByNodeId = async (nodeId: string, paramId: string, updates: Partial<ApidocProperty<'string'>>): Promise<HttpNode | null> => {
    const existingNode = await apiNodesCache.getNodeById(nodeId) as HttpNode | null;
    if (!existingNode) {
      logger.warn('节点不存在', { nodeId });
      return null;
    }
    const paramIndex = existingNode.item.queryParams.findIndex(p => p._id === paramId);
    if (paramIndex === -1) {
      logger.warn('参数不存在', { nodeId, paramId });
      return null;
    }
    assign(existingNode.item.queryParams[paramIndex], updates);
    existingNode.updatedAt = new Date().toISOString();
    const success = await apiNodesCache.replaceNode(existingNode);
    if (!success) {
      logger.error('更新节点缓存失败', { nodeId });
      return null;
    }
    const httpNodeStore = useHttpNode();
    if (httpNodeStore.httpNodeInfo._id === nodeId) {
      const localIndex = httpNodeStore.httpNodeInfo.item.queryParams.findIndex(p => p._id === paramId);
      if (localIndex !== -1) {
        assign(httpNodeStore.httpNodeInfo.item.queryParams[localIndex], updates);
      }
      httpNodeStore.httpNodeInfo.updatedAt = existingNode.updatedAt;
      httpNodeStore.changeOriginHttpNodeInfo();
    }
    return existingNode;
  }
  //根据节点ID和参数ID删除query参数
  const deleteQueryParamByNodeId = async (nodeId: string, paramId: string): Promise<HttpNode | null> => {
    const existingNode = await apiNodesCache.getNodeById(nodeId) as HttpNode | null;
    if (!existingNode) {
      logger.warn('节点不存在', { nodeId });
      return null;
    }
    const paramIndex = existingNode.item.queryParams.findIndex(p => p._id === paramId);
    if (paramIndex === -1) {
      logger.warn('参数不存在', { nodeId, paramId });
      return null;
    }
    existingNode.item.queryParams.splice(paramIndex, 1);
    existingNode.updatedAt = new Date().toISOString();
    const success = await apiNodesCache.replaceNode(existingNode);
    if (!success) {
      logger.error('更新节点缓存失败', { nodeId });
      return null;
    }
    const httpNodeStore = useHttpNode();
    if (httpNodeStore.httpNodeInfo._id === nodeId) {
      const localIndex = httpNodeStore.httpNodeInfo.item.queryParams.findIndex(p => p._id === paramId);
      if (localIndex !== -1) {
        httpNodeStore.httpNodeInfo.item.queryParams.splice(localIndex, 1);
      }
      httpNodeStore.httpNodeInfo.updatedAt = existingNode.updatedAt;
      httpNodeStore.changeOriginHttpNodeInfo();
    }
    return existingNode;
  }
  //根据节点ID批量设置query参数（替换所有）
  const setQueryParamsByNodeId = async (nodeId: string, params: ApidocProperty<'string'>[]): Promise<HttpNode | null> => {
    const existingNode = await apiNodesCache.getNodeById(nodeId) as HttpNode | null;
    if (!existingNode) {
      logger.warn('节点不存在', { nodeId });
      return null;
    }
    existingNode.item.queryParams = params;
    existingNode.updatedAt = new Date().toISOString();
    const success = await apiNodesCache.replaceNode(existingNode);
    if (!success) {
      logger.error('更新节点缓存失败', { nodeId });
      return null;
    }
    const httpNodeStore = useHttpNode();
    if (httpNodeStore.httpNodeInfo._id === nodeId) {
      httpNodeStore.httpNodeInfo.item.queryParams = params;
      httpNodeStore.httpNodeInfo.updatedAt = existingNode.updatedAt;
      httpNodeStore.changeOriginHttpNodeInfo();
    }
    return existingNode;
  }
  //根据节点ID添加path参数
  const addPathParamByNodeId = async (nodeId: string, param: ApidocProperty<'string'>): Promise<HttpNode | null> => {
    const existingNode = await apiNodesCache.getNodeById(nodeId) as HttpNode | null;
    if (!existingNode) {
      logger.warn('节点不存在', { nodeId });
      return null;
    }
    existingNode.item.paths.push(param);
    existingNode.updatedAt = new Date().toISOString();
    const success = await apiNodesCache.replaceNode(existingNode);
    if (!success) {
      logger.error('更新节点缓存失败', { nodeId });
      return null;
    }
    const httpNodeStore = useHttpNode();
    if (httpNodeStore.httpNodeInfo._id === nodeId) {
      httpNodeStore.httpNodeInfo.item.paths.push(param);
      httpNodeStore.httpNodeInfo.updatedAt = existingNode.updatedAt;
      httpNodeStore.changeOriginHttpNodeInfo();
    }
    return existingNode;
  }
  //根据节点ID和参数ID更新path参数
  const updatePathParamByNodeId = async (nodeId: string, paramId: string, updates: Partial<ApidocProperty<'string'>>): Promise<HttpNode | null> => {
    const existingNode = await apiNodesCache.getNodeById(nodeId) as HttpNode | null;
    if (!existingNode) {
      logger.warn('节点不存在', { nodeId });
      return null;
    }
    const paramIndex = existingNode.item.paths.findIndex(p => p._id === paramId);
    if (paramIndex === -1) {
      logger.warn('参数不存在', { nodeId, paramId });
      return null;
    }
    assign(existingNode.item.paths[paramIndex], updates);
    existingNode.updatedAt = new Date().toISOString();
    const success = await apiNodesCache.replaceNode(existingNode);
    if (!success) {
      logger.error('更新节点缓存失败', { nodeId });
      return null;
    }
    const httpNodeStore = useHttpNode();
    if (httpNodeStore.httpNodeInfo._id === nodeId) {
      const localIndex = httpNodeStore.httpNodeInfo.item.paths.findIndex(p => p._id === paramId);
      if (localIndex !== -1) {
        assign(httpNodeStore.httpNodeInfo.item.paths[localIndex], updates);
      }
      httpNodeStore.httpNodeInfo.updatedAt = existingNode.updatedAt;
      httpNodeStore.changeOriginHttpNodeInfo();
    }
    return existingNode;
  }
  //根据节点ID和参数ID删除path参数
  const deletePathParamByNodeId = async (nodeId: string, paramId: string): Promise<HttpNode | null> => {
    const existingNode = await apiNodesCache.getNodeById(nodeId) as HttpNode | null;
    if (!existingNode) {
      logger.warn('节点不存在', { nodeId });
      return null;
    }
    const paramIndex = existingNode.item.paths.findIndex(p => p._id === paramId);
    if (paramIndex === -1) {
      logger.warn('参数不存在', { nodeId, paramId });
      return null;
    }
    existingNode.item.paths.splice(paramIndex, 1);
    existingNode.updatedAt = new Date().toISOString();
    const success = await apiNodesCache.replaceNode(existingNode);
    if (!success) {
      logger.error('更新节点缓存失败', { nodeId });
      return null;
    }
    const httpNodeStore = useHttpNode();
    if (httpNodeStore.httpNodeInfo._id === nodeId) {
      const localIndex = httpNodeStore.httpNodeInfo.item.paths.findIndex(p => p._id === paramId);
      if (localIndex !== -1) {
        httpNodeStore.httpNodeInfo.item.paths.splice(localIndex, 1);
      }
      httpNodeStore.httpNodeInfo.updatedAt = existingNode.updatedAt;
      httpNodeStore.changeOriginHttpNodeInfo();
    }
    return existingNode;
  }
  //根据节点ID批量设置path参数（替换所有）
  const setPathParamsByNodeId = async (nodeId: string, params: ApidocProperty<'string'>[]): Promise<HttpNode | null> => {
    const existingNode = await apiNodesCache.getNodeById(nodeId) as HttpNode | null;
    if (!existingNode) {
      logger.warn('节点不存在', { nodeId });
      return null;
    }
    existingNode.item.paths = params;
    existingNode.updatedAt = new Date().toISOString();
    const success = await apiNodesCache.replaceNode(existingNode);
    if (!success) {
      logger.error('更新节点缓存失败', { nodeId });
      return null;
    }
    const httpNodeStore = useHttpNode();
    if (httpNodeStore.httpNodeInfo._id === nodeId) {
      httpNodeStore.httpNodeInfo.item.paths = params;
      httpNodeStore.httpNodeInfo.updatedAt = existingNode.updatedAt;
      httpNodeStore.changeOriginHttpNodeInfo();
    }
    return existingNode;
  }
  //根据节点ID添加header
  const addHeaderByNodeId = async (nodeId: string, header: ApidocProperty<'string'>): Promise<HttpNode | null> => {
    const existingNode = await apiNodesCache.getNodeById(nodeId) as HttpNode | null;
    if (!existingNode) {
      logger.warn('节点不存在', { nodeId });
      return null;
    }
    existingNode.item.headers.push(header);
    existingNode.updatedAt = new Date().toISOString();
    const success = await apiNodesCache.replaceNode(existingNode);
    if (!success) {
      logger.error('更新节点缓存失败', { nodeId });
      return null;
    }
    const httpNodeStore = useHttpNode();
    if (httpNodeStore.httpNodeInfo._id === nodeId) {
      httpNodeStore.httpNodeInfo.item.headers.push(header);
      httpNodeStore.httpNodeInfo.updatedAt = existingNode.updatedAt;
      httpNodeStore.changeOriginHttpNodeInfo();
    }
    return existingNode;
  }
  //根据节点ID和headerID更新header
  const updateHeaderByNodeId = async (nodeId: string, headerId: string, updates: Partial<ApidocProperty<'string'>>): Promise<HttpNode | null> => {
    const existingNode = await apiNodesCache.getNodeById(nodeId) as HttpNode | null;
    if (!existingNode) {
      logger.warn('节点不存在', { nodeId });
      return null;
    }
    const headerIndex = existingNode.item.headers.findIndex(h => h._id === headerId);
    if (headerIndex === -1) {
      logger.warn('header不存在', { nodeId, headerId });
      return null;
    }
    assign(existingNode.item.headers[headerIndex], updates);
    existingNode.updatedAt = new Date().toISOString();
    const success = await apiNodesCache.replaceNode(existingNode);
    if (!success) {
      logger.error('更新节点缓存失败', { nodeId });
      return null;
    }
    const httpNodeStore = useHttpNode();
    if (httpNodeStore.httpNodeInfo._id === nodeId) {
      const localIndex = httpNodeStore.httpNodeInfo.item.headers.findIndex(h => h._id === headerId);
      if (localIndex !== -1) {
        assign(httpNodeStore.httpNodeInfo.item.headers[localIndex], updates);
      }
      httpNodeStore.httpNodeInfo.updatedAt = existingNode.updatedAt;
      httpNodeStore.changeOriginHttpNodeInfo();
    }
    return existingNode;
  }
  //根据节点ID和headerID删除header
  const deleteHeaderByNodeId = async (nodeId: string, headerId: string): Promise<HttpNode | null> => {
    const existingNode = await apiNodesCache.getNodeById(nodeId) as HttpNode | null;
    if (!existingNode) {
      logger.warn('节点不存在', { nodeId });
      return null;
    }
    const headerIndex = existingNode.item.headers.findIndex(h => h._id === headerId);
    if (headerIndex === -1) {
      logger.warn('header不存在', { nodeId, headerId });
      return null;
    }
    existingNode.item.headers.splice(headerIndex, 1);
    existingNode.updatedAt = new Date().toISOString();
    const success = await apiNodesCache.replaceNode(existingNode);
    if (!success) {
      logger.error('更新节点缓存失败', { nodeId });
      return null;
    }
    const httpNodeStore = useHttpNode();
    if (httpNodeStore.httpNodeInfo._id === nodeId) {
      const localIndex = httpNodeStore.httpNodeInfo.item.headers.findIndex(h => h._id === headerId);
      if (localIndex !== -1) {
        httpNodeStore.httpNodeInfo.item.headers.splice(localIndex, 1);
      }
      httpNodeStore.httpNodeInfo.updatedAt = existingNode.updatedAt;
      httpNodeStore.changeOriginHttpNodeInfo();
    }
    return existingNode;
  }
  //根据节点ID批量设置header（替换所有）
  const setHeadersByNodeId = async (nodeId: string, headers: ApidocProperty<'string'>[]): Promise<HttpNode | null> => {
    const existingNode = await apiNodesCache.getNodeById(nodeId) as HttpNode | null;
    if (!existingNode) {
      logger.warn('节点不存在', { nodeId });
      return null;
    }
    existingNode.item.headers = headers;
    existingNode.updatedAt = new Date().toISOString();
    const success = await apiNodesCache.replaceNode(existingNode);
    if (!success) {
      logger.error('更新节点缓存失败', { nodeId });
      return null;
    }
    const httpNodeStore = useHttpNode();
    if (httpNodeStore.httpNodeInfo._id === nodeId) {
      httpNodeStore.httpNodeInfo.item.headers = headers;
      httpNodeStore.httpNodeInfo.updatedAt = existingNode.updatedAt;
      httpNodeStore.changeOriginHttpNodeInfo();
    }
    return existingNode;
  }
  //根据节点ID添加formdata参数
  const addFormdataByNodeId = async (nodeId: string, param: ApidocProperty<'string' | 'file'>): Promise<HttpNode | null> => {
    const existingNode = await apiNodesCache.getNodeById(nodeId) as HttpNode | null;
    if (!existingNode) {
      logger.warn('节点不存在', { nodeId });
      return null;
    }
    existingNode.item.requestBody.formdata.push(param);
    existingNode.updatedAt = new Date().toISOString();
    const success = await apiNodesCache.replaceNode(existingNode);
    if (!success) {
      logger.error('更新节点缓存失败', { nodeId });
      return null;
    }
    const httpNodeStore = useHttpNode();
    if (httpNodeStore.httpNodeInfo._id === nodeId) {
      httpNodeStore.httpNodeInfo.item.requestBody.formdata.push(param);
      httpNodeStore.httpNodeInfo.updatedAt = existingNode.updatedAt;
      httpNodeStore.changeOriginHttpNodeInfo();
    }
    return existingNode;
  }
  //根据节点ID和参数ID更新formdata参数
  const updateFormdataByNodeId = async (nodeId: string, paramId: string, updates: Partial<ApidocProperty<'string' | 'file'>>): Promise<HttpNode | null> => {
    const existingNode = await apiNodesCache.getNodeById(nodeId) as HttpNode | null;
    if (!existingNode) {
      logger.warn('节点不存在', { nodeId });
      return null;
    }
    const paramIndex = existingNode.item.requestBody.formdata.findIndex(p => p._id === paramId);
    if (paramIndex === -1) {
      logger.warn('参数不存在', { nodeId, paramId });
      return null;
    }
    assign(existingNode.item.requestBody.formdata[paramIndex], updates);
    existingNode.updatedAt = new Date().toISOString();
    const success = await apiNodesCache.replaceNode(existingNode);
    if (!success) {
      logger.error('更新节点缓存失败', { nodeId });
      return null;
    }
    const httpNodeStore = useHttpNode();
    if (httpNodeStore.httpNodeInfo._id === nodeId) {
      const localIndex = httpNodeStore.httpNodeInfo.item.requestBody.formdata.findIndex(p => p._id === paramId);
      if (localIndex !== -1) {
        assign(httpNodeStore.httpNodeInfo.item.requestBody.formdata[localIndex], updates);
      }
      httpNodeStore.httpNodeInfo.updatedAt = existingNode.updatedAt;
      httpNodeStore.changeOriginHttpNodeInfo();
    }
    return existingNode;
  }
  //根据节点ID和参数ID删除formdata参数
  const deleteFormdataByNodeId = async (nodeId: string, paramId: string): Promise<HttpNode | null> => {
    const existingNode = await apiNodesCache.getNodeById(nodeId) as HttpNode | null;
    if (!existingNode) {
      logger.warn('节点不存在', { nodeId });
      return null;
    }
    const paramIndex = existingNode.item.requestBody.formdata.findIndex(p => p._id === paramId);
    if (paramIndex === -1) {
      logger.warn('参数不存在', { nodeId, paramId });
      return null;
    }
    existingNode.item.requestBody.formdata.splice(paramIndex, 1);
    existingNode.updatedAt = new Date().toISOString();
    const success = await apiNodesCache.replaceNode(existingNode);
    if (!success) {
      logger.error('更新节点缓存失败', { nodeId });
      return null;
    }
    const httpNodeStore = useHttpNode();
    if (httpNodeStore.httpNodeInfo._id === nodeId) {
      const localIndex = httpNodeStore.httpNodeInfo.item.requestBody.formdata.findIndex(p => p._id === paramId);
      if (localIndex !== -1) {
        httpNodeStore.httpNodeInfo.item.requestBody.formdata.splice(localIndex, 1);
      }
      httpNodeStore.httpNodeInfo.updatedAt = existingNode.updatedAt;
      httpNodeStore.changeOriginHttpNodeInfo();
    }
    return existingNode;
  }
  //根据节点ID批量设置formdata参数（替换所有）
  const setFormdataByNodeId = async (nodeId: string, params: ApidocProperty<'string' | 'file'>[]): Promise<HttpNode | null> => {
    const existingNode = await apiNodesCache.getNodeById(nodeId) as HttpNode | null;
    if (!existingNode) {
      logger.warn('节点不存在', { nodeId });
      return null;
    }
    existingNode.item.requestBody.formdata = params;
    existingNode.updatedAt = new Date().toISOString();
    const success = await apiNodesCache.replaceNode(existingNode);
    if (!success) {
      logger.error('更新节点缓存失败', { nodeId });
      return null;
    }
    const httpNodeStore = useHttpNode();
    if (httpNodeStore.httpNodeInfo._id === nodeId) {
      httpNodeStore.httpNodeInfo.item.requestBody.formdata = params;
      httpNodeStore.httpNodeInfo.updatedAt = existingNode.updatedAt;
      httpNodeStore.changeOriginHttpNodeInfo();
    }
    return existingNode;
  }
  //根据节点ID添加urlencoded参数
  const addUrlencodedByNodeId = async (nodeId: string, param: ApidocProperty<'string'>): Promise<HttpNode | null> => {
    const existingNode = await apiNodesCache.getNodeById(nodeId) as HttpNode | null;
    if (!existingNode) {
      logger.warn('节点不存在', { nodeId });
      return null;
    }
    existingNode.item.requestBody.urlencoded.push(param);
    existingNode.updatedAt = new Date().toISOString();
    const success = await apiNodesCache.replaceNode(existingNode);
    if (!success) {
      logger.error('更新节点缓存失败', { nodeId });
      return null;
    }
    const httpNodeStore = useHttpNode();
    if (httpNodeStore.httpNodeInfo._id === nodeId) {
      httpNodeStore.httpNodeInfo.item.requestBody.urlencoded.push(param);
      httpNodeStore.httpNodeInfo.updatedAt = existingNode.updatedAt;
      httpNodeStore.changeOriginHttpNodeInfo();
    }
    return existingNode;
  }
  //根据节点ID和参数ID更新urlencoded参数
  const updateUrlencodedByNodeId = async (nodeId: string, paramId: string, updates: Partial<ApidocProperty<'string'>>): Promise<HttpNode | null> => {
    const existingNode = await apiNodesCache.getNodeById(nodeId) as HttpNode | null;
    if (!existingNode) {
      logger.warn('节点不存在', { nodeId });
      return null;
    }
    const paramIndex = existingNode.item.requestBody.urlencoded.findIndex(p => p._id === paramId);
    if (paramIndex === -1) {
      logger.warn('参数不存在', { nodeId, paramId });
      return null;
    }
    assign(existingNode.item.requestBody.urlencoded[paramIndex], updates);
    existingNode.updatedAt = new Date().toISOString();
    const success = await apiNodesCache.replaceNode(existingNode);
    if (!success) {
      logger.error('更新节点缓存失败', { nodeId });
      return null;
    }
    const httpNodeStore = useHttpNode();
    if (httpNodeStore.httpNodeInfo._id === nodeId) {
      const localIndex = httpNodeStore.httpNodeInfo.item.requestBody.urlencoded.findIndex(p => p._id === paramId);
      if (localIndex !== -1) {
        assign(httpNodeStore.httpNodeInfo.item.requestBody.urlencoded[localIndex], updates);
      }
      httpNodeStore.httpNodeInfo.updatedAt = existingNode.updatedAt;
      httpNodeStore.changeOriginHttpNodeInfo();
    }
    return existingNode;
  }
  //根据节点ID和参数ID删除urlencoded参数
  const deleteUrlencodedByNodeId = async (nodeId: string, paramId: string): Promise<HttpNode | null> => {
    const existingNode = await apiNodesCache.getNodeById(nodeId) as HttpNode | null;
    if (!existingNode) {
      logger.warn('节点不存在', { nodeId });
      return null;
    }
    const paramIndex = existingNode.item.requestBody.urlencoded.findIndex(p => p._id === paramId);
    if (paramIndex === -1) {
      logger.warn('参数不存在', { nodeId, paramId });
      return null;
    }
    existingNode.item.requestBody.urlencoded.splice(paramIndex, 1);
    existingNode.updatedAt = new Date().toISOString();
    const success = await apiNodesCache.replaceNode(existingNode);
    if (!success) {
      logger.error('更新节点缓存失败', { nodeId });
      return null;
    }
    const httpNodeStore = useHttpNode();
    if (httpNodeStore.httpNodeInfo._id === nodeId) {
      const localIndex = httpNodeStore.httpNodeInfo.item.requestBody.urlencoded.findIndex(p => p._id === paramId);
      if (localIndex !== -1) {
        httpNodeStore.httpNodeInfo.item.requestBody.urlencoded.splice(localIndex, 1);
      }
      httpNodeStore.httpNodeInfo.updatedAt = existingNode.updatedAt;
      httpNodeStore.changeOriginHttpNodeInfo();
    }
    return existingNode;
  }
  //根据节点ID批量设置urlencoded参数（替换所有）
  const setUrlencodedByNodeId = async (nodeId: string, params: ApidocProperty<'string'>[]): Promise<HttpNode | null> => {
    const existingNode = await apiNodesCache.getNodeById(nodeId) as HttpNode | null;
    if (!existingNode) {
      logger.warn('节点不存在', { nodeId });
      return null;
    }
    existingNode.item.requestBody.urlencoded = params;
    existingNode.updatedAt = new Date().toISOString();
    const success = await apiNodesCache.replaceNode(existingNode);
    if (!success) {
      logger.error('更新节点缓存失败', { nodeId });
      return null;
    }
    const httpNodeStore = useHttpNode();
    if (httpNodeStore.httpNodeInfo._id === nodeId) {
      httpNodeStore.httpNodeInfo.item.requestBody.urlencoded = params;
      httpNodeStore.httpNodeInfo.updatedAt = existingNode.updatedAt;
      httpNodeStore.changeOriginHttpNodeInfo();
    }
    return existingNode;
  }
  //移动httpNode到新的父节点
  const moveHttpNode = async (nodeId: string, newPid: string): Promise<HttpNode | null> => {
    const existingNode = await apiNodesCache.getNodeById(nodeId) as HttpNode | null;
    if (!existingNode) {
      logger.warn('节点不存在', { nodeId });
      return null;
    }
    const oldPid = existingNode.pid;
    existingNode.pid = newPid;
    existingNode.sort = Date.now();
    existingNode.updatedAt = new Date().toISOString();
    const success = await apiNodesCache.replaceNode(existingNode);
    if (!success) {
      logger.error('更新节点缓存失败', { nodeId });
      return null;
    }
    // 同步更新banner
    const bannerStore = useBanner();
    const node = findNodeById(bannerStore.banner, nodeId, { idKey: '_id' }) as ApidocBanner | null;
    if (node) {
      // 从原位置删除
      const oldParent = oldPid ? findNodeById(bannerStore.banner, oldPid, { idKey: '_id' }) as ApidocBanner | null : null;
      if (!oldParent) {
        const index = bannerStore.banner.findIndex(n => n._id === nodeId);
        if (index !== -1) bannerStore.splice({ start: index, deleteCount: 1 });
      } else if (oldParent.children) {
        const index = oldParent.children.findIndex(n => n._id === nodeId);
        if (index !== -1) bannerStore.splice({ start: index, deleteCount: 1, opData: oldParent.children });
      }
      // 添加到新位置
      node.pid = newPid;
      node.sort = existingNode.sort;
      const newParent = newPid ? findNodeById(bannerStore.banner, newPid, { idKey: '_id' }) as ApidocBanner | null : null;
      if (!newParent) {
        bannerStore.splice({ start: bannerStore.banner.length, deleteCount: 0, item: node });
      } else if (newParent.children) {
        bannerStore.splice({ start: newParent.children.length, deleteCount: 0, item: node, opData: newParent.children });
      }
    }
    // 同步httpNodeStore（如果是当前编辑的节点）
    const httpNodeStore = useHttpNode();
    if (httpNodeStore.httpNodeInfo._id === nodeId) {
      httpNodeStore.httpNodeInfo.pid = newPid;
      httpNodeStore.httpNodeInfo.updatedAt = existingNode.updatedAt;
      httpNodeStore.changeOriginHttpNodeInfo();
    }
    return existingNode;
  }
  /*
  |--------------------------------------------------------------------------
  | project相关逻辑
  |--------------------------------------------------------------------------
  */
  //获取项目列表
  const getProjectList = async (): Promise<ApidocProjectInfo[]> => {
    const projectManagerStore = useProjectManagerStore();
    return await projectManagerStore.getProjectList();
  }
  //根据项目ID获取项目信息
  const getProjectById = async (projectId: string): Promise<ApidocProjectInfo | null> => {
    const projectManagerStore = useProjectManagerStore();
    await projectManagerStore.getProjectList();
    const project = projectManagerStore.projectList.find(p => p._id === projectId);
    return project || null;
  }
  //创建项目
  const createProject = async (projectName: string): Promise<{ projectId: string; projectName: string } | null> => {
    const projectManagerStore = useProjectManagerStore();
    return await projectManagerStore.addProject(projectName);
  }
  const batchCreateProjects = async (projectNames: string[]): Promise<{ success: { projectId: string; projectName: string }[]; failed: string[] }> => {
    const success: { projectId: string; projectName: string }[] = [];
    const failed: string[] = [];
    for (const projectName of projectNames) {
      const result = await createProject(projectName);
      if (result) {
        success.push(result);
      } else {
        failed.push(projectName);
      }
    }
    return { success, failed };
  }
  const searchProject = async (options: {
    keyword?: string;
    projectName?: string;
    creator?: string;
    isStared?: boolean;
  }): Promise<ApidocProjectInfo[]> => {
    const projectManagerStore = useProjectManagerStore();
    const allProjects = await projectManagerStore.getProjectList();
    return allProjects.filter(project => {
      if (options.keyword) {
        const kw = options.keyword.toLowerCase();
        const matchName = project.projectName.toLowerCase().includes(kw);
        const matchRemark = (project.remark || '').toLowerCase().includes(kw);
        if (!matchName && !matchRemark) return false;
      }
      if (options.projectName && !project.projectName.toLowerCase().includes(options.projectName.toLowerCase())) {
        return false;
      }
      if (options.creator && !project.owner?.name?.toLowerCase().includes(options.creator.toLowerCase())) {
        return false;
      }
      if (options.isStared !== undefined && project.isStared !== options.isStared) {
        return false;
      }
      return true;
    });
  }
  //更新项目名称
  const updateProjectName = async (projectId: string, projectName: string): Promise<boolean> => {
    const projectManagerStore = useProjectManagerStore();
    const result = await projectManagerStore.updateProject(projectId, projectName);
    if (result) {
      window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.contentToTopBar.projectRenamed, { projectId, projectName });
    }
    return result;
  }
  //删除项目
  const deleteProject = async (projectId: string): Promise<boolean> => {
    const projectManagerStore = useProjectManagerStore();
    const result = await projectManagerStore.deleteProject(projectId);
    if (result !== null) {
      window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.contentToTopBar.projectDeleted, projectId);
    }
    return result !== null;
  }
  //批量删除项目
  const batchDeleteProjects = async (projectIds: string[]): Promise<{ success: string[]; failed: string[] }> => {
    const success: string[] = [];
    const failed: string[] = [];
    for (const projectId of projectIds) {
      const result = await deleteProject(projectId);
      if (result) {
        success.push(projectId);
      } else {
        failed.push(projectId);
      }
    }
    return { success, failed };
  }
  //删除所有项目
  const deleteAllProjects = async (): Promise<{ deletedCount: number; projectIds: string[] }> => {
    const projectManagerStore = useProjectManagerStore();
    const allProjects = await projectManagerStore.getProjectList();
    const projectIds = allProjects.map(p => p._id);
    const deletedIds: string[] = [];
    for (const projectId of projectIds) {
      const result = await deleteProject(projectId);
      if (result) {
        deletedIds.push(projectId);
      }
    }
    return { deletedCount: deletedIds.length, projectIds: deletedIds };
  }
  //收藏项目
  const starProject = async (projectId: string): Promise<boolean> => {
    const projectManagerStore = useProjectManagerStore();
    return await projectManagerStore.starProject(projectId);
  }
  //取消收藏项目
  const unstarProject = async (projectId: string): Promise<boolean> => {
    const projectManagerStore = useProjectManagerStore();
    return await projectManagerStore.unstarProject(projectId);
  }
  //跳转到项目
  const navigateToProject = async (projectId: string): Promise<boolean> => {
    const projectManagerStore = useProjectManagerStore();
    const projectWorkbenchStore = useProjectWorkbench();
    await projectManagerStore.getProjectList();
    const project = projectManagerStore.projectList.find(p => p._id === projectId);
    if (!project) {
      logger.error('项目不存在', { projectId });
      return false;
    }
    projectManagerStore.recordVisited(projectId);
    router.push({
      path: '/workbench',
      query: {
        id: projectId,
        name: project.projectName,
        mode: 'edit',
      },
    });
    projectWorkbenchStore.changeProjectId(projectId);
    return true;
  }
  //创建文件夹节点
  const createFolderNode = async (options: { projectId: string; name: string; pid?: string }): Promise<FolderNode | null> => {
    const now = new Date().toISOString();
    const folderNode: FolderNode = {
      _id: nanoid(),
      pid: options.pid || '',
      projectId: options.projectId,
      sort: Date.now(),
      info: {
        name: options.name,
        type: 'folder',
        description: '',
        version: '',
        creator: '',
        deletePerson: '',
        maintainer: '',
      },
      commonHeaders: [],
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
    };
    const success = await apiNodesCache.addNode(folderNode);
    if (!success) {
      logger.error('新增文件夹节点失败', { projectId: options.projectId });
      return null;
    }
    const currentProjectId = router.currentRoute.value.query.id as string;
    if (currentProjectId === options.projectId) {
      const bannerStore = useBanner();
      const bannerNode: ApidocBannerOfFolderNode = {
        _id: folderNode._id,
        updatedAt: folderNode.updatedAt,
        type: 'folder',
        sort: folderNode.sort,
        pid: folderNode.pid,
        name: folderNode.info.name,
        maintainer: folderNode.info.maintainer,
        commonHeaders: [],
        readonly: false,
        children: [],
      };
      if (!folderNode.pid) {
        bannerStore.splice({ start: bannerStore.banner.length, deleteCount: 0, item: bannerNode });
      } else {
        const parentNode = findNodeById(bannerStore.banner, folderNode.pid, { idKey: '_id' }) as ApidocBanner | null;
        if (parentNode && parentNode.children) {
          bannerStore.splice({ start: parentNode.children.length, deleteCount: 0, item: bannerNode, opData: parentNode.children });
        }
      }
    }
    return folderNode;
  }
  //批量创建文件夹节点
  const batchCreateFolderNodes = async (options: { projectId: string; folders: { name: string; pid?: string }[] }): Promise<{ success: FolderNode[]; failed: { name: string; pid?: string }[] }> => {
    const success: FolderNode[] = [];
    const failed: { name: string; pid?: string }[] = [];
    for (const folder of options.folders) {
      const result = await createFolderNode({ projectId: options.projectId, name: folder.name, pid: folder.pid });
      if (result) {
        success.push(result);
      } else {
        failed.push(folder);
      }
    }
    return { success, failed };
  }
  //获取项目下所有文件夹列表
  const getFolderList = async (projectId: string): Promise<FolderNode[]> => {
    const allNodes = await apiNodesCache.getNodesByProjectId(projectId);
    return allNodes.filter(node => node.info.type === 'folder') as FolderNode[];
  }
  //重命名文件夹
  const renameFolder = async (folderId: string, newName: string): Promise<boolean> => {
    const node = await apiNodesCache.getNodeById(folderId);
    if (!node || node.info.type !== 'folder') {
      logger.warn('文件夹不存在或类型不匹配', { folderId });
      return false;
    }
    const result = await apiNodesCache.updateNodeName(folderId, newName);
    if (result) {
      const bannerStore = useBanner();
      const projectNavStore = useProjectNav();
      bannerStore.changeBannerInfoById({ id: folderId, field: 'name', value: newName });
      projectNavStore.changeNavInfoById({ id: folderId, field: 'label', value: newName });
    }
    return result;
  }
  //批量重命名文件夹
  const batchRenameFolders = async (items: { folderId: string; newName: string }[]): Promise<{ success: string[]; failed: string[] }> => {
    const success: string[] = [];
    const failed: string[] = [];
    for (const item of items) {
      const result = await renameFolder(item.folderId, item.newName);
      if (result) {
        success.push(item.folderId);
      } else {
        failed.push(item.folderId);
      }
    }
    return { success, failed };
  }
  //获取文件夹及其所有子节点内容，用于生成命名建议
  const getFolderChildrenForRename = async (folderId: string, projectId: string) => {
    const allNodes = await apiNodesCache.getNodesByProjectId(projectId);
    const targetFolder = allNodes.find(n => n._id === folderId && n.info.type === 'folder') as FolderNode | undefined;
    if (!targetFolder) {
      return null;
    }
    const collectDescendants = (parentId: string): typeof allNodes => {
      const children = allNodes.filter(n => n.pid === parentId);
      const descendants = [...children];
      for (const child of children) {
        if (child.info.type === 'folder') {
          descendants.push(...collectDescendants(child._id));
        }
      }
      return descendants;
    };
    const descendants = collectDescendants(folderId);
    const childFolders = descendants.filter(n => n.info.type === 'folder');
    const otherNodes = descendants.filter(n => n.info.type !== 'folder');
    return {
      folder: {
        _id: targetFolder._id,
        name: targetFolder.info.name,
        description: targetFolder.info.description,
      },
      childFolders: childFolders.map(f => ({
        _id: f._id,
        pid: f.pid,
        name: f.info.name,
        type: f.info.type,
        description: f.info.description,
      })),
      childNodes: otherNodes.map(n => {
        const base = {
          _id: n._id,
          pid: n.pid,
          name: n.info.name,
          type: n.info.type,
          description: n.info.description,
        };
        if (n.info.type === 'http') {
          const httpNode = n as HttpNode;
          return { ...base, method: httpNode.item.method, url: httpNode.item.url.path };
        }
        return base;
      }),
    };
  }

  /*
  |--------------------------------------------------------------------------
  | 变量相关逻辑
  |--------------------------------------------------------------------------
  */
  // 获取项目的所有变量
  const getVariablesByProjectId = async (projectId: string): Promise<ApidocVariable[]> => {
    const result = await nodeVariableCache.getVariableByProjectId(projectId);
    if (result.code === 0) {
      return result.data;
    }
    return [];
  }
  // 根据ID获取单个变量
  const getVariableById = async (variableId: string): Promise<ApidocVariable | null> => {
    const result = await nodeVariableCache.getVariableById(variableId);
    if (result.code === 0) {
      return result.data;
    }
    return null;
  }
  // 创建变量
  const createVariable = async (variable: Omit<ApidocVariable, '_id'>): Promise<ApidocVariable | null> => {
    const result = await nodeVariableCache.addVariable(variable);
    if (result.code === 0) {
      return result.data;
    }
    return null;
  }
  // 更新变量
  const updateVariableById = async (variableId: string, updates: Partial<ApidocVariable>): Promise<ApidocVariable | null> => {
    const result = await nodeVariableCache.updateVariableById(variableId, updates);
    if (result.code === 0) {
      return result.data;
    }
    return null;
  }
  // 删除变量
  const deleteVariableByIds = async (ids: string[]): Promise<boolean> => {
    const result = await nodeVariableCache.deleteVariableByIds(ids);
    return result.code === 0;
  }
  // 按名称搜索变量
  const searchVariablesByName = async (projectId: string, keyword: string): Promise<ApidocVariable[]> => {
    const result = await nodeVariableCache.getVariableByProjectId(projectId);
    if (result.code === 0) {
      const lowerKeyword = keyword.toLowerCase();
      return result.data.filter(v => v.name.toLowerCase().includes(lowerKeyword));
    }
    return [];
  }

  // 删除当前项目下的所有公共请求头
  const deleteAllCommonHeaders = async (): Promise<{
    ok: boolean;
    data: {
      global: { ok: boolean };
      folder: { total: number; cleared: number; failedFolderIds: string[] };
    };
  }> => {
    const runtimeStore = useRuntime();
    const isOffline = runtimeStore.networkMode === 'offline';
    const projectId = router.currentRoute.value.query.id as string;
    const folderNodes = (await apiNodesCache.getNodesByProjectId(projectId)).filter((node) => node.info.type === 'folder');
    const failedFolderIds: string[] = [];
    let clearedFolderCount = 0;

    let globalOk = false;
    try {
      if (isOffline) {
        const { commonHeaderCache } = await import('@/cache/project/commonHeadersCache');
        globalOk = await commonHeaderCache.setCommonHeaders([]);
      } else {
        const { request } = await import('@/api/api');
        await request.put('/api/project/replace_global_common_headers', { projectId, commonHeaders: [] });
        globalOk = true;
      }
    } catch (error) {
      logger.error('删除全局公共请求头失败', { error });
      globalOk = false;
    }

    for (let i = 0; i < folderNodes.length; i += 1) {
      const folderId = folderNodes[i]._id;
      try {
        if (isOffline) {
          const success = await apiNodesCache.updateNodeById(folderId, { commonHeaders: [] });
          if (!success) {
            failedFolderIds.push(folderId);
          } else {
            clearedFolderCount += 1;
          }
        } else {
          const { request } = await import('@/api/api');
          await request.put('/api/project/common_header', { projectId, id: folderId, commonHeaders: [] });
          clearedFolderCount += 1;
        }
      } catch (error) {
        logger.error('删除文件夹公共请求头失败', { error, folderId });
        failedFolderIds.push(folderId);
      }
    }

    const commonHeaderStore = useCommonHeader();
    try {
      await Promise.all([commonHeaderStore.getGlobalCommonHeaders(), commonHeaderStore.getCommonHeaders()]);
    } catch (error) {
      logger.error('刷新公共请求头失败', { error });
    }

    const folderOk = failedFolderIds.length === 0;
    const ok = globalOk && folderOk;
    return {
      ok,
      data: {
        global: { ok: globalOk },
        folder: { total: folderNodes.length, cleared: clearedFolderCount, failedFolderIds },
      },
    };
  }
  /*
  |--------------------------------------------------------------------------
  | 公共请求头相关逻辑
  |--------------------------------------------------------------------------
  */
  // 获取全局公共请求头列表
  const getGlobalCommonHeaders = async (): Promise<ApidocProperty<'string'>[]> => {
    const { commonHeaderCache } = await import('@/cache/project/commonHeadersCache');
    return await commonHeaderCache.getCommonHeaders();
  }
  // 根据ID获取单个全局公共请求头
  const getGlobalCommonHeaderById = async (headerId: string): Promise<ApidocProperty<'string'> | null> => {
    const { commonHeaderCache } = await import('@/cache/project/commonHeadersCache');
    return await commonHeaderCache.getCommonHeaderById(headerId);
  }
  // 创建全局公共请求头
  const createGlobalCommonHeader = async (header: { key: string; value: string; description?: string }): Promise<ApidocProperty<'string'> | null> => {
    const { commonHeaderCache } = await import('@/cache/project/commonHeadersCache');
    const newHeader: ApidocProperty<'string'> = {
      _id: nanoid(),
      key: header.key,
      value: header.value,
      type: 'string',
      required: false,
      description: header.description || '',
      select: true,
    };
    const success = await commonHeaderCache.addCommonHeader(newHeader);
    return success ? newHeader : null;
  }
  // 更新全局公共请求头
  const updateGlobalCommonHeader = async (headerId: string, updates: Partial<{ key: string; value: string; description: string; select: boolean }>): Promise<boolean> => {
    const { commonHeaderCache } = await import('@/cache/project/commonHeadersCache');
    return await commonHeaderCache.updateCommonHeader(headerId, updates);
  }
  // 删除全局公共请求头
  const deleteGlobalCommonHeaders = async (headerIds: string[]): Promise<boolean> => {
    const { commonHeaderCache } = await import('@/cache/project/commonHeadersCache');
    return await commonHeaderCache.deleteCommonHeaders(headerIds);
  }
  // 按 key 搜索全局公共请求头
  const searchGlobalCommonHeaders = async (keyword: string): Promise<ApidocProperty<'string'>[]> => {
    const { commonHeaderCache } = await import('@/cache/project/commonHeadersCache');
    const headers = await commonHeaderCache.getCommonHeaders();
    const lowerKeyword = keyword.toLowerCase();
    return headers.filter(h => h.key.toLowerCase().includes(lowerKeyword));
  }
  // 获取文件夹的公共请求头列表
  const getFolderCommonHeaders = async (folderId: string): Promise<ApidocProperty<'string'>[] | null> => {
    const node = await apiNodesCache.getNodeById(folderId);
    if (!node || node.info.type !== 'folder') {
      return null;
    }
    const folderNode = node as FolderNode;
    return folderNode.commonHeaders || [];
  }
  // 为文件夹添加公共请求头
  const addFolderCommonHeader = async (folderId: string, header: { key: string; value: string; description?: string }): Promise<ApidocProperty<'string'> | null> => {
    const node = await apiNodesCache.getNodeById(folderId);
    if (!node || node.info.type !== 'folder') {
      return null;
    }
    const folderNode = node as FolderNode;
    const newHeader: ApidocProperty<'string'> = {
      _id: nanoid(),
      key: header.key,
      value: header.value,
      type: 'string',
      required: false,
      description: header.description || '',
      select: true,
    };
    const existingHeaders = folderNode.commonHeaders || [];
    const updatedHeaders = [...existingHeaders, newHeader];
    const success = await apiNodesCache.updateNodeById(folderId, { commonHeaders: updatedHeaders });
    return success ? newHeader : null;
  }
  // 更新文件夹的公共请求头
  const updateFolderCommonHeader = async (folderId: string, headerId: string, updates: Partial<{ key: string; value: string; description: string; select: boolean }>): Promise<boolean> => {
    const node = await apiNodesCache.getNodeById(folderId);
    if (!node || node.info.type !== 'folder') {
      return false;
    }
    const folderNode = node as FolderNode;
    const existingHeaders = folderNode.commonHeaders || [];
    const headerIndex = existingHeaders.findIndex(h => h._id === headerId);
    if (headerIndex === -1) {
      return false;
    }
    existingHeaders[headerIndex] = { ...existingHeaders[headerIndex], ...updates };
    return await apiNodesCache.updateNodeById(folderId, { commonHeaders: existingHeaders });
  }
  // 删除文件夹的公共请求头
  const deleteFolderCommonHeaders = async (folderId: string, headerIds: string[]): Promise<boolean> => {
    const node = await apiNodesCache.getNodeById(folderId);
    if (!node || node.info.type !== 'folder') {
      return false;
    }
    const folderNode = node as FolderNode;
    const existingHeaders = folderNode.commonHeaders || [];
    const headerIdsSet = new Set(headerIds);
    const updatedHeaders = existingHeaders.filter(h => !headerIdsSet.has(h._id));
    return await apiNodesCache.updateNodeById(folderId, { commonHeaders: updatedHeaders });
  }
  // 设置文件夹的全部公共请求头（覆盖式更新）
  const setFolderCommonHeaders = async (folderId: string, headers: ApidocProperty<'string'>[]): Promise<boolean> => {
    const node = await apiNodesCache.getNodeById(folderId);
    if (!node || node.info.type !== 'folder') {
      return false;
    }
    return await apiNodesCache.updateNodeById(folderId, { commonHeaders: headers });
  }

  return {
    getHttpNodeById,
    patchHttpNodeInfoById,
    addQueryParamByNodeId,
    updateQueryParamByNodeId,
    deleteQueryParamByNodeId,
    setQueryParamsByNodeId,
    addPathParamByNodeId,
    updatePathParamByNodeId,
    deletePathParamByNodeId,
    setPathParamsByNodeId,
    addHeaderByNodeId,
    updateHeaderByNodeId,
    deleteHeaderByNodeId,
    setHeadersByNodeId,
    addFormdataByNodeId,
    updateFormdataByNodeId,
    deleteFormdataByNodeId,
    setFormdataByNodeId,
    addUrlencodedByNodeId,
    updateUrlencodedByNodeId,
    deleteUrlencodedByNodeId,
    setUrlencodedByNodeId,
    createHttpNode,
    createHttpMockNode,
    createWebsocketNode,
    createWebsocketMockNode,
    batchCreateHttpNodes,
    deleteHttpNodes,
    moveHttpNode,
    searchHttpNodes,
    getProjectList,
    getProjectById,
    createProject,
    batchCreateProjects,
    searchProject,
    updateProjectName,
    deleteProject,
    batchDeleteProjects,
    deleteAllProjects,
    starProject,
    unstarProject,
    navigateToProject,
    createFolderNode,
    batchCreateFolderNodes,
    getFolderList,
    renameFolder,
    batchRenameFolders,
    getFolderChildrenForRename,
    getVariablesByProjectId,
    getVariableById,
    createVariable,
    updateVariableById,
    deleteVariableByIds,
    searchVariablesByName,
    getGlobalCommonHeaders,
    getGlobalCommonHeaderById,
    createGlobalCommonHeader,
    updateGlobalCommonHeader,
    deleteGlobalCommonHeaders,
    searchGlobalCommonHeaders,
    getFolderCommonHeaders,
    addFolderCommonHeader,
    updateFolderCommonHeader,
    deleteFolderCommonHeaders,
    setFolderCommonHeaders,
    deleteAllCommonHeaders,
  }
})
