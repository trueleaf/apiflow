import { cloneDeep, assign, merge } from "lodash-es"
import { HttpNode, ApidocProperty, ApidocProjectInfo, HttpNodeRequestMethod, HttpNodeContentType, HttpNodeBodyMode, FolderNode, ApidocBannerOfHttpNode, ApidocBanner } from '@src/types'
import { CreateHttpNodeOptions } from '@src/types/ai/tools.type'
import { defineStore } from "pinia"
import { DeepPartial } from "@src/types/index.ts"
import { apiNodesCache } from "@/cache/nodes/nodesCache";
import { logger, generateEmptyHttpNode, generateHttpNode, inferContentTypeFromBody, findNodeById, findParentById } from '@/helper';
import { useHttpNode } from "../httpNode/httpNodeStore";
import { useProjectManagerStore } from "../projectManager/projectManagerStore";
import { useBanner } from "../projectWorkbench/bannerStore";
import { useProjectNav } from "../projectWorkbench/projectNavStore";
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
      }
      if (item.queryParams !== undefined) {
        node.item.queryParams = item.queryParams;
      }
      if (item.headers !== undefined) {
        node.item.headers = item.headers;
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
        }
        if (requestBody.urlencoded !== undefined) {
          node.item.requestBody.urlencoded = requestBody.urlencoded;
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

  return {
    searchHttpNodes,
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
    deleteHttpNodes,
    moveHttpNode,
    getProjectList,
    getProjectById,
    createProject,
    updateProjectName,
    deleteProject,
    starProject,
    unstarProject,
    getFolderList,
    renameFolder,
    batchRenameFolders,
    getFolderChildrenForRename,
  }
})
