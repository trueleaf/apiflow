import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useHttpNode } from '../httpNode/httpNodeStore';
import { useHttpNodeResponse } from '../httpNode/httpNodeResponseStore';
import { useVariable } from '../projectWorkbench/variablesStore';
import { useProjectNav } from '../projectWorkbench/projectNavStore';
import { useBanner } from '../projectWorkbench/bannerStore';
import { useCookies } from '../projectWorkbench/cookiesStore';
import { useCommonHeader } from '../projectWorkbench/commonHeaderStore';
import { useWebSocket } from '../websocketNode/websocketNodeStore';
import { useHttpMockNode } from '../httpMockNode/httpMockNodeStore';
import { useWebSocketMockNode } from '../websocketMockNode/websocketMockNodeStore';
import { useSendHistory } from '@/pages/projectWorkbench/layout/banner/sendHistory/sendHistoryStore';
import { router } from '@/router';
import { sendRequest } from '@/server/request/request';
import { generateEmptyProperty, generateEmptyHttpNode, generateEmptyWebsocketNode, generateEmptyHttpMockNode, generateEmptyWebSocketMockNode, findNodeById, forEachForest } from '@/helper';
import { apiNodesCache } from '@/cache/nodes/nodesCache';
import { nanoid } from 'nanoid/non-secure';
import type { HttpNodeRequestMethod, ApidocVariable, HttpNodeBodyRawType, ApidocType, ApidocBanner } from '@src/types';
import type { AgentTool, ToolDefinition, ToolExecuteResult } from '@src/types/ai/agent.type';

// 工具定义：将工具转换为 DeepSeek function call 格式
const createToolDefinition = (tool: AgentTool): ToolDefinition => ({
  type: 'function',
  function: {
    name: tool.name,
    description: tool.description,
    parameters: tool.parameters,
  },
});

export const useAgentToolsStore = defineStore('agentTools', () => {
  const pendingToolCall = ref<{ name: string; args: Record<string, unknown> } | null>(null);
  const httpNodeStore = useHttpNode();
  const httpNodeResponseStore = useHttpNodeResponse();
  const variableStore = useVariable();
  const projectNavStore = useProjectNav();
  const bannerStore = useBanner();
  const cookiesStore = useCookies();
  const commonHeaderStore = useCommonHeader();
  const sendHistoryStore = useSendHistory();
  const websocketStore = useWebSocket();
  const httpMockNodeStore = useHttpMockNode();
  const websocketMockNodeStore = useWebSocketMockNode();
  // 获取当前项目ID
  const getProjectId = (): string => router.currentRoute.value.query.id as string;
  // 首批工具定义
  const tools: AgentTool[] = [
    {
      name: 'send_http_request',
      description: '发送当前编辑器中的 HTTP 请求，返回响应结果',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
      requireConfirmation: true,
      execute: async () => {
        try {
          await sendRequest();
          // 等待响应状态变为 finish
          await new Promise<void>((resolve) => {
            const checkState = () => {
              if (httpNodeResponseStore.requestState === 'finish') {
                resolve();
              } else {
                setTimeout(checkState, 100);
              }
            };
            checkState();
          });
          const response = httpNodeResponseStore.responseInfo;
          return {
            success: true,
            data: {
              statusCode: response.statusCode,
              contentType: response.contentType,
              rt: response.rt,
              bodyPreview: response.responseData.textData?.substring(0, 2000) || response.responseData.jsonData?.substring(0, 2000) || '',
            },
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      },
    },
    {
      name: 'set_http_url',
      description: '设置当前 HTTP 请求的 URL 路径',
      parameters: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: '请求的 URL 路径，例如 /api/users',
          },
        },
        required: ['path'],
      },
      requireConfirmation: false,
      execute: async (args) => {
        const path = args.path as string;
        httpNodeStore.changeHttpNodeUrl(path);
        return { success: true, data: { path } };
      },
    },
    {
      name: 'set_http_method',
      description: '设置当前 HTTP 请求的方法',
      parameters: {
        type: 'object',
        properties: {
          method: {
            type: 'string',
            enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
            description: '请求方法',
          },
        },
        required: ['method'],
      },
      requireConfirmation: false,
      execute: async (args) => {
        const method = args.method as HttpNodeRequestMethod;
        httpNodeStore.changeHttpNodeMethod(method);
        return { success: true, data: { method } };
      },
    },
    {
      name: 'set_http_json_body',
      description: '设置当前 HTTP 请求的 JSON 请求体',
      parameters: {
        type: 'object',
        properties: {
          jsonBody: {
            type: 'string',
            description: 'JSON 格式的请求体字符串',
          },
        },
        required: ['jsonBody'],
      },
      requireConfirmation: false,
      execute: async (args) => {
        const jsonBody = args.jsonBody as string;
        httpNodeStore.changeBodyMode('json');
        httpNodeStore.changeRawJson(jsonBody);
        return { success: true, data: { jsonBody } };
      },
    },
    {
      name: 'get_variable',
      description: '获取项目变量的值',
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: '变量名称',
          },
        },
        required: ['name'],
      },
      requireConfirmation: false,
      execute: async (args) => {
        const name = args.name as string;
        const value = variableStore.objectVariable[name];
        if (value === undefined) {
          return { success: false, error: `变量 "${name}" 不存在` };
        }
        return { success: true, data: { name, value } };
      },
    },
    {
      name: 'set_variable',
      description: '设置项目变量的值',
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: '变量名称',
          },
          value: {
            type: 'string',
            description: '变量值',
          },
        },
        required: ['name', 'value'],
      },
      requireConfirmation: true,
      execute: async (args) => {
        const name = args.name as string;
        const value = args.value as string;
        const existingVar = variableStore.variables.find((v) => v.name === name);
        if (existingVar) {
          const updatedVar: ApidocVariable = { ...existingVar, value };
          variableStore.changeVariableById(existingVar._id, updatedVar);
          return { success: true, data: { name, value, action: 'updated' } };
        }
        return { success: false, error: `变量 "${name}" 不存在，无法设置` };
      },
    },
    {
      name: 'list_variables',
      description: '列出当前项目的所有变量',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
      requireConfirmation: false,
      execute: async () => {
        const variables = variableStore.variables.map((v) => ({
          name: v.name,
          value: v.value,
          type: v.type,
        }));
        return { success: true, data: { variables } };
      },
    },
    {
      name: 'get_current_request_info',
      description: '获取当前正在编辑的 HTTP 请求的信息',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
      requireConfirmation: false,
      execute: async () => {
        const info = httpNodeStore.httpNodeInfo;
        return {
          success: true,
          data: {
            name: info.info.name,
            method: info.item.method,
            url: `${info.item.url.prefix}${info.item.url.path}`,
            contentType: info.item.contentType,
            bodyMode: info.item.requestBody.mode,
          },
        };
      },
    },
    {
      name: 'list_api_nodes',
      description: '列出当前项目的所有 API 节点',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
      requireConfirmation: false,
      execute: async () => {
        const nodes = bannerStore.banner.map((node) => ({
          id: node._id,
          name: node.name,
          type: node.type,
        }));
        return { success: true, data: { nodes: nodes.slice(0, 50) } };
      },
    },
    {
      name: 'open_api_node',
      description: '打开指定的 API 节点进行编辑',
      parameters: {
        type: 'object',
        properties: {
          nodeId: {
            type: 'string',
            description: '要打开的节点 ID',
          },
        },
        required: ['nodeId'],
      },
      requireConfirmation: false,
      execute: async (args) => {
        const nodeId = args.nodeId as string;
        const projectId = router.currentRoute.value.query.id as string;
        const node = bannerStore.banner.find((n) => n._id === nodeId);
        if (!node) {
          return { success: false, error: `节点 "${nodeId}" 不存在` };
        }
        const tabType = node.type === 'http' ? 'http' : node.type === 'websocket' ? 'websocket' : 'http';
        projectNavStore.addNav({
          _id: node._id,
          projectId,
          label: node.name,
          saved: true,
          fixed: false,
          selected: true,
          tabType,
          head: {
            icon: tabType === 'http' ? 'http' : 'websocket',
            color: '',
          },
        });
        return { success: true, data: { nodeId, nodeName: node.name } };
      },
    },
    {
      name: 'set_http_headers',
      description: '设置当前 HTTP 请求的请求头',
      parameters: {
        type: 'object',
        properties: {
          headers: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                key: { type: 'string', description: '请求头名称' },
                value: { type: 'string', description: '请求头值' },
              },
            },
            description: '请求头列表',
          },
        },
        required: ['headers'],
      },
      requireConfirmation: false,
      execute: async (args) => {
        const headers = args.headers as { key: string; value: string }[];
        headers.forEach((header) => {
          const property = generateEmptyProperty();
          property._id = nanoid();
          property.key = header.key;
          property.value = header.value;
          property.select = true;
          httpNodeStore.httpNodeInfo.item.headers.unshift(property);
        });
        return { success: true, data: { addedCount: headers.length } };
      },
    },
    {
      name: 'set_http_query_params',
      description: '设置当前 HTTP 请求的查询参数',
      parameters: {
        type: 'object',
        properties: {
          params: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                key: { type: 'string', description: '参数名称' },
                value: { type: 'string', description: '参数值' },
              },
            },
            description: '查询参数列表',
          },
        },
        required: ['params'],
      },
      requireConfirmation: false,
      execute: async (args) => {
        const params = args.params as { key: string; value: string }[];
        const properties = params.map((param) => {
          const property = generateEmptyProperty();
          property._id = nanoid();
          property.key = param.key;
          property.value = param.value;
          property.select = true;
          return property;
        });
        httpNodeStore.unshiftQueryParams(properties);
        return { success: true, data: { addedCount: params.length } };
      },
    },
    {
      name: 'set_http_formdata_body',
      description: '设置当前 HTTP 请求的 FormData 请求体',
      parameters: {
        type: 'object',
        properties: {
          formdata: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                key: { type: 'string', description: '字段名称' },
                value: { type: 'string', description: '字段值' },
              },
            },
            description: 'FormData 字段列表',
          },
        },
        required: ['formdata'],
      },
      requireConfirmation: false,
      execute: async (args) => {
        const formdata = args.formdata as { key: string; value: string }[];
        httpNodeStore.changeBodyMode('formdata');
        formdata.forEach((field) => {
          const property = generateEmptyProperty();
          property._id = nanoid();
          property.key = field.key;
          property.value = field.value;
          property.select = true;
          httpNodeStore.httpNodeInfo.item.requestBody.formdata.unshift(property);
        });
        return { success: true, data: { addedCount: formdata.length } };
      },
    },
    {
      name: 'set_http_urlencoded_body',
      description: '设置当前 HTTP 请求的 URL 编码请求体',
      parameters: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                key: { type: 'string', description: '字段名称' },
                value: { type: 'string', description: '字段值' },
              },
            },
            description: 'URL 编码字段列表',
          },
        },
        required: ['data'],
      },
      requireConfirmation: false,
      execute: async (args) => {
        const data = args.data as { key: string; value: string }[];
        httpNodeStore.changeBodyMode('urlencoded');
        data.forEach((field) => {
          const property = generateEmptyProperty();
          property._id = nanoid();
          property.key = field.key;
          property.value = field.value;
          property.select = true;
          httpNodeStore.httpNodeInfo.item.requestBody.urlencoded.unshift(property);
        });
        return { success: true, data: { addedCount: data.length } };
      },
    },
    {
      name: 'set_http_raw_body',
      description: '设置当前 HTTP 请求的原始请求体（XML、JavaScript、纯文本等）',
      parameters: {
        type: 'object',
        properties: {
          rawBody: { type: 'string', description: '原始请求体内容' },
          rawType: {
            type: 'string',
            enum: ['application/xml', 'text/javascript', 'text/plain', 'text/html'],
            description: '原始请求体类型',
          },
        },
        required: ['rawBody', 'rawType'],
      },
      requireConfirmation: false,
      execute: async (args) => {
        const rawBody = args.rawBody as string;
        const rawType = args.rawType as HttpNodeBodyRawType;
        httpNodeStore.changeBodyMode('raw');
        httpNodeStore.changeBodyRawType(rawType);
        httpNodeStore.changeBodyRawValue(rawBody);
        return { success: true, data: { rawType, bodyLength: rawBody.length } };
      },
    },
    {
      name: 'get_response_details',
      description: '获取最近一次 HTTP 请求的详细响应信息',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
      requireConfirmation: false,
      execute: async () => {
        const response = httpNodeResponseStore.responseInfo;
        return {
          success: true,
          data: {
            statusCode: response.statusCode,
            contentType: response.contentType,
            rt: response.rt,
            bodyByteLength: response.bodyByteLength,
            timings: response.timings,
            requestData: response.requestData,
            redirectList: response.redirectList,
            responseBody: response.responseData.textData?.substring(0, 5000) || response.responseData.jsonData?.substring(0, 5000) || '',
          },
        };
      },
    },
    {
      name: 'get_response_headers',
      description: '获取最近一次 HTTP 请求的响应头',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
      requireConfirmation: false,
      execute: async () => {
        const response = httpNodeResponseStore.responseInfo;
        return {
          success: true,
          data: {
            headers: response.headers,
          },
        };
      },
    },
    {
      name: 'list_cookies',
      description: '列出当前项目的所有 Cookies',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
      requireConfirmation: false,
      execute: async () => {
        const cookies = cookiesStore.cookies.map((c) => ({
          id: c.id,
          name: c.name,
          value: c.value,
          domain: c.domain,
          path: c.path,
          expires: c.expires,
        }));
        return { success: true, data: { cookies } };
      },
    },
    {
      name: 'add_cookie',
      description: '添加一个新的 Cookie',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Cookie 名称' },
          value: { type: 'string', description: 'Cookie 值' },
          domain: { type: 'string', description: 'Cookie 域名' },
          path: { type: 'string', description: 'Cookie 路径，默认为 /' },
        },
        required: ['name', 'value', 'domain'],
      },
      requireConfirmation: true,
      execute: async (args) => {
        const name = args.name as string;
        const value = args.value as string;
        const domain = args.domain as string;
        const path = (args.path as string) || '/';
        const projectId = router.currentRoute.value.query.id as string;
        const cookie = {
          id: nanoid(),
          name,
          value,
          domain,
          path,
          expires: '',
          httpOnly: false,
          secure: false,
          sameSite: '',
        };
        cookiesStore.addCookie(projectId, cookie);
        return { success: true, data: { cookie } };
      },
    },
    {
      name: 'delete_cookie',
      description: '删除指定的 Cookie',
      parameters: {
        type: 'object',
        properties: {
          cookieId: { type: 'string', description: 'Cookie ID' },
        },
        required: ['cookieId'],
      },
      requireConfirmation: true,
      execute: async (args) => {
        const cookieId = args.cookieId as string;
        const projectId = router.currentRoute.value.query.id as string;
        const cookie = cookiesStore.cookies.find((c) => c.id === cookieId);
        if (!cookie) {
          return { success: false, error: `Cookie "${cookieId}" 不存在` };
        }
        cookiesStore.deleteCookiesById(projectId, cookieId);
        return { success: true, data: { deletedCookieId: cookieId } };
      },
    },
    {
      name: 'list_send_history',
      description: '列出最近的 HTTP 请求发送历史',
      parameters: {
        type: 'object',
        properties: {
          limit: { type: 'number', description: '返回的最大数量，默认 20' },
        },
        required: [],
      },
      requireConfirmation: false,
      execute: async (args) => {
        const limit = (args.limit as number) || 20;
        await sendHistoryStore.loadSendHistory();
        const history = sendHistoryStore.sendHistoryList.slice(0, limit).map((item) => ({
          id: item._id,
          nodeId: item.nodeId,
          nodeName: item.nodeName,
          method: item.method,
          url: item.url,
          timestamp: item.timestamp,
        }));
        return { success: true, data: { history } };
      },
    },
    {
      name: 'search_send_history',
      description: '搜索 HTTP 请求发送历史',
      parameters: {
        type: 'object',
        properties: {
          keyword: { type: 'string', description: '搜索关键词' },
        },
        required: ['keyword'],
      },
      requireConfirmation: false,
      execute: async (args) => {
        const keyword = args.keyword as string;
        await sendHistoryStore.search(keyword);
        const history = sendHistoryStore.sendHistoryList.slice(0, 50).map((item) => ({
          id: item._id,
          nodeId: item.nodeId,
          nodeName: item.nodeName,
          method: item.method,
          url: item.url,
          timestamp: item.timestamp,
        }));
        return { success: true, data: { history, keyword } };
      },
    },
    {
      name: 'list_common_headers',
      description: '列出当前项目的公共请求头',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
      requireConfirmation: false,
      execute: async () => {
        await commonHeaderStore.getCommonHeaders();
        await commonHeaderStore.getGlobalCommonHeaders();
        const projectHeaders = commonHeaderStore.commonHeaders.map((h) => ({
          id: h._id,
          name: h.name,
          headers: h.commonHeaders.filter((ch) => ch.select).map((ch) => ({
            key: ch.key,
            value: ch.value,
          })),
        }));
        const globalHeaders = commonHeaderStore.globalCommonHeaders
          .filter((h) => h.select)
          .map((h) => ({
            key: h.key,
            value: h.value,
          }));
        return { success: true, data: { projectHeaders, globalHeaders } };
      },
    },
    {
      name: 'save_current_api',
      description: '保存当前正在编辑的 API 接口',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
      requireConfirmation: true,
      execute: async () => {
        try {
          await httpNodeStore.saveHttpNode();
          return { success: true, data: { message: '接口保存成功' } };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      },
    },
    {
      name: 'create_node',
      description: '创建新的 API 节点（支持 http、websocket、httpMock、websocketMock、folder 类型）',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: '节点名称' },
          type: {
            type: 'string',
            enum: ['http', 'websocket', 'httpMock', 'websocketMock', 'folder'],
            description: '节点类型',
          },
          pid: { type: 'string', description: '父节点 ID，为空则创建在根目录' },
        },
        required: ['name', 'type'],
      },
      requireConfirmation: true,
      execute: async (args) => {
        const name = args.name as string;
        const type = args.type as ApidocType;
        const pid = (args.pid as string) || '';
        const projectId = getProjectId();
        const nodeId = nanoid();
        const now = new Date().toISOString();
        let node;
        let bannerNode: ApidocBanner;
        if (type === 'http') {
          node = generateEmptyHttpNode(nodeId);
          node.info.name = name;
          node.projectId = projectId;
          node.pid = pid;
          node.sort = Date.now();
          node.createdAt = now;
          node.updatedAt = now;
          bannerNode = {
            _id: nodeId,
            pid,
            sort: node.sort,
            name,
            type: 'http',
            method: node.item.method,
            url: node.item.url.path,
            maintainer: '',
            updatedAt: now,
            readonly: false,
            children: [],
          };
        } else if (type === 'websocket') {
          node = generateEmptyWebsocketNode(nodeId);
          node.info.name = name;
          node.projectId = projectId;
          node.pid = pid;
          node.sort = Date.now();
          node.createdAt = now;
          node.updatedAt = now;
          bannerNode = {
            _id: nodeId,
            pid,
            sort: node.sort,
            name,
            type: 'websocket',
            protocol: node.item.protocol,
            url: { path: node.item.url.path, prefix: node.item.url.prefix },
            maintainer: '',
            updatedAt: now,
            readonly: false,
            children: [],
          };
        } else if (type === 'httpMock') {
          node = generateEmptyHttpMockNode(nodeId);
          node.info.name = name;
          node.projectId = projectId;
          node.pid = pid;
          node.sort = Date.now();
          node.createdAt = now;
          node.updatedAt = now;
          bannerNode = {
            _id: nodeId,
            pid,
            sort: node.sort,
            name,
            type: 'httpMock',
            method: node.requestCondition.method[0] || 'ALL',
            url: node.requestCondition.url,
            port: node.requestCondition.port,
            maintainer: '',
            updatedAt: now,
            readonly: false,
            state: 'stopped',
            children: [],
          };
        } else if (type === 'websocketMock') {
          node = generateEmptyWebSocketMockNode(nodeId);
          node.info.name = name;
          node.projectId = projectId;
          node.pid = pid;
          node.sort = Date.now();
          node.createdAt = now;
          node.updatedAt = now;
          bannerNode = {
            _id: nodeId,
            pid,
            sort: node.sort,
            name,
            type: 'websocketMock',
            port: node.requestCondition.port,
            path: node.requestCondition.path,
            maintainer: '',
            updatedAt: now,
            readonly: false,
            state: 'stopped',
            children: [],
          };
        } else if (type === 'folder') {
          node = generateEmptyHttpNode(nodeId);
          node.info.name = name;
          node.info.type = 'folder';
          node.projectId = projectId;
          node.pid = pid;
          node.sort = Date.now();
          node.createdAt = now;
          node.updatedAt = now;
          bannerNode = {
            _id: nodeId,
            pid,
            sort: node.sort,
            name,
            type: 'folder',
            maintainer: '',
            commonHeaders: [],
            updatedAt: now,
            readonly: false,
            children: [],
          };
        } else {
          return { success: false, error: `不支持的节点类型: ${type}` };
        }
        await apiNodesCache.addNode(node);
        if (pid) {
          const parentNode = findNodeById(bannerStore.banner, pid, { idKey: '_id' });
          if (parentNode && parentNode.children) {
            parentNode.children.push(bannerNode);
          } else {
            bannerStore.banner.push(bannerNode);
          }
        } else {
          bannerStore.banner.push(bannerNode);
        }
        return { success: true, data: { nodeId, name, type } };
      },
    },
    {
      name: 'delete_node',
      description: '删除指定的 API 节点（软删除，可以恢复）',
      parameters: {
        type: 'object',
        properties: {
          nodeId: { type: 'string', description: '要删除的节点 ID' },
        },
        required: ['nodeId'],
      },
      requireConfirmation: true,
      execute: async (args) => {
        const nodeId = args.nodeId as string;
        const projectId = getProjectId();
        const node = findNodeById(bannerStore.banner, nodeId, { idKey: '_id' });
        if (!node) {
          return { success: false, error: `节点 "${nodeId}" 不存在` };
        }
        const nodesToDelete: string[] = [nodeId];
        if (node.children && node.children.length > 0) {
          forEachForest(node.children, (child) => {
            nodesToDelete.push(child._id);
          });
        }
        await apiNodesCache.deleteNodes(nodesToDelete);
        projectNavStore.deleteNavByIds({
          ids: nodesToDelete,
          projectId,
          force: true,
        });
        const removeFromBanner = (nodes: ApidocBanner[], targetId: string): boolean => {
          for (let i = 0; i < nodes.length; i++) {
            if (nodes[i]._id === targetId) {
              nodes.splice(i, 1);
              return true;
            }
            if (nodes[i].children && removeFromBanner(nodes[i].children, targetId)) {
              return true;
            }
          }
          return false;
        };
        removeFromBanner(bannerStore.banner, nodeId);
        return { success: true, data: { deletedNodeIds: nodesToDelete } };
      },
    },
    {
      name: 'get_node_details',
      description: '获取指定节点的详细信息',
      parameters: {
        type: 'object',
        properties: {
          nodeId: { type: 'string', description: '节点 ID' },
        },
        required: ['nodeId'],
      },
      requireConfirmation: false,
      execute: async (args) => {
        const nodeId = args.nodeId as string;
        const node = await apiNodesCache.getNodeById(nodeId);
        if (!node) {
          return { success: false, error: `节点 "${nodeId}" 不存在` };
        }
        const baseInfo = {
          id: node._id,
          name: node.info.name,
          type: node.info.type,
          description: node.info.description,
          createdAt: node.createdAt,
          updatedAt: node.updatedAt,
        };
        if (node.info.type === 'http') {
          const httpNode = node as ReturnType<typeof generateEmptyHttpNode>;
          return {
            success: true,
            data: {
              ...baseInfo,
              method: httpNode.item.method,
              url: `${httpNode.item.url.prefix}${httpNode.item.url.path}`,
              contentType: httpNode.item.contentType,
              headers: httpNode.item.headers.filter((h) => h.select).map((h) => ({ key: h.key, value: h.value })),
              queryParams: httpNode.item.queryParams.filter((p) => p.select).map((p) => ({ key: p.key, value: p.value })),
              bodyMode: httpNode.item.requestBody.mode,
            },
          };
        } else if (node.info.type === 'websocket') {
          const wsNode = node as ReturnType<typeof generateEmptyWebsocketNode>;
          return {
            success: true,
            data: {
              ...baseInfo,
              protocol: wsNode.item.protocol,
              url: `${wsNode.item.url.prefix}${wsNode.item.url.path}`,
              headers: wsNode.item.headers.filter((h) => h.select).map((h) => ({ key: h.key, value: h.value })),
            },
          };
        } else if (node.info.type === 'httpMock') {
          const mockNode = node as ReturnType<typeof generateEmptyHttpMockNode>;
          return {
            success: true,
            data: {
              ...baseInfo,
              method: mockNode.requestCondition.method,
              url: mockNode.requestCondition.url,
              port: mockNode.requestCondition.port,
              delay: mockNode.config.delay,
            },
          };
        } else if (node.info.type === 'websocketMock') {
          const wsMockNode = node as ReturnType<typeof generateEmptyWebSocketMockNode>;
          return {
            success: true,
            data: {
              ...baseInfo,
              port: wsMockNode.requestCondition.port,
              path: wsMockNode.requestCondition.path,
              delay: wsMockNode.config.delay,
              echoMode: wsMockNode.config.echoMode,
            },
          };
        }
        return { success: true, data: baseInfo };
      },
    },
    {
      name: 'search_nodes',
      description: '搜索 API 节点（按名称、URL 或类型）',
      parameters: {
        type: 'object',
        properties: {
          keyword: { type: 'string', description: '搜索关键词（匹配名称或 URL）' },
          type: {
            type: 'string',
            enum: ['http', 'websocket', 'httpMock', 'websocketMock', 'folder'],
            description: '过滤节点类型（可选）',
          },
        },
        required: [],
      },
      requireConfirmation: false,
      execute: async (args) => {
        const keyword = (args.keyword as string) || '';
        const type = args.type as ApidocType | undefined;
        const results: { id: string; name: string; type: string; url?: string }[] = [];
        forEachForest(bannerStore.banner, (node) => {
          if (type && node.type !== type) return;
          const nameMatch = !keyword || node.name.toLowerCase().includes(keyword.toLowerCase());
          let urlMatch = false;
          if ('url' in node && typeof node.url === 'string') {
            urlMatch = !keyword || node.url.toLowerCase().includes(keyword.toLowerCase());
          }
          if ('path' in node && typeof node.path === 'string') {
            urlMatch = urlMatch || (!keyword || node.path.toLowerCase().includes(keyword.toLowerCase()));
          }
          if (nameMatch || urlMatch) {
            results.push({
              id: node._id,
              name: node.name,
              type: node.type,
              url: 'url' in node ? (node.url as string) : ('path' in node ? (node.path as string) : undefined),
            });
          }
        });
        return { success: true, data: { nodes: results.slice(0, 50), total: results.length } };
      },
    },
    {
      name: 'update_node_name',
      description: '更新节点名称',
      parameters: {
        type: 'object',
        properties: {
          nodeId: { type: 'string', description: '节点 ID' },
          name: { type: 'string', description: '新的节点名称' },
        },
        required: ['nodeId', 'name'],
      },
      requireConfirmation: false,
      execute: async (args) => {
        const nodeId = args.nodeId as string;
        const name = args.name as string;
        await apiNodesCache.updateNodeName(nodeId, name);
        bannerStore.changeBannerInfoById({ id: nodeId, field: 'name', value: name });
        projectNavStore.changeNavInfoById({ id: nodeId, field: 'label', value: name });
        return { success: true, data: { nodeId, name } };
      },
    },
    {
      name: 'set_websocket_url',
      description: '设置 WebSocket 节点的连接 URL',
      parameters: {
        type: 'object',
        properties: {
          protocol: { type: 'string', enum: ['ws', 'wss'], description: '协议类型' },
          prefix: { type: 'string', description: 'URL 前缀（如 localhost:8080）' },
          path: { type: 'string', description: 'URL 路径（如 /ws/chat）' },
        },
        required: ['path'],
      },
      requireConfirmation: false,
      execute: async (args) => {
        const protocol = args.protocol as 'ws' | 'wss' | undefined;
        const prefix = args.prefix as string | undefined;
        const path = args.path as string;
        if (protocol) websocketStore.changeWebSocketProtocol(protocol);
        if (prefix) websocketStore.changeWebSocketPrefix(prefix);
        websocketStore.changeWebSocketPath(path);
        return { success: true, data: { protocol, prefix, path } };
      },
    },
    {
      name: 'get_current_websocket_info',
      description: '获取当前正在编辑的 WebSocket 节点信息',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
      requireConfirmation: false,
      execute: async () => {
        const ws = websocketStore.websocket;
        return {
          success: true,
          data: {
            name: ws.info.name,
            protocol: ws.item.protocol,
            url: `${ws.item.url.prefix}${ws.item.url.path}`,
            headers: ws.item.headers.filter((h) => h.select).map((h) => ({ key: h.key, value: h.value })),
            queryParams: ws.item.queryParams.filter((p) => p.select).map((p) => ({ key: p.key, value: p.value })),
          },
        };
      },
    },
    {
      name: 'save_current_websocket',
      description: '保存当前正在编辑的 WebSocket 节点',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
      requireConfirmation: true,
      execute: async () => {
        try {
          await websocketStore.saveWebsocket();
          return { success: true, data: { message: 'WebSocket 节点保存成功' } };
        } catch (error) {
          return { success: false, error: error instanceof Error ? error.message : String(error) };
        }
      },
    },
    {
      name: 'set_http_mock_config',
      description: '设置 HTTP Mock 节点的配置',
      parameters: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'Mock 请求 URL 路径' },
          method: {
            type: 'array',
            items: { type: 'string', enum: ['ALL', 'GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
            description: '允许的 HTTP 方法列表',
          },
          port: { type: 'number', description: 'Mock 服务端口' },
          delay: { type: 'number', description: '响应延迟时间（毫秒）' },
        },
        required: [],
      },
      requireConfirmation: false,
      execute: async (args) => {
        if (args.url) httpMockNodeStore.changeHttpMockNodeRequestUrl(args.url as string);
        if (args.method) httpMockNodeStore.changeHttpMockNodeMethod(args.method as ('ALL' | 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH')[]);
        if (args.port) httpMockNodeStore.changeHttpMockNodePort(args.port as number);
        if (args.delay !== undefined) httpMockNodeStore.changeHttpMockNodeDelay(args.delay as number);
        return { success: true, data: { url: args.url, method: args.method, port: args.port, delay: args.delay } };
      },
    },
    {
      name: 'get_current_http_mock_info',
      description: '获取当前正在编辑的 HTTP Mock 节点信息',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
      requireConfirmation: false,
      execute: async () => {
        const mock = httpMockNodeStore.httpMock;
        return {
          success: true,
          data: {
            name: mock.info.name,
            url: mock.requestCondition.url,
            method: mock.requestCondition.method,
            port: mock.requestCondition.port,
            delay: mock.config.delay,
            responseCount: mock.response.length,
          },
        };
      },
    },
    {
      name: 'save_current_http_mock',
      description: '保存当前正在编辑的 HTTP Mock 节点',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
      requireConfirmation: true,
      execute: async () => {
        try {
          await httpMockNodeStore.saveHttpMockNode();
          return { success: true, data: { message: 'HTTP Mock 节点保存成功' } };
        } catch (error) {
          return { success: false, error: error instanceof Error ? error.message : String(error) };
        }
      },
    },
    {
      name: 'set_websocket_mock_config',
      description: '设置 WebSocket Mock 节点的配置',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'WebSocket Mock 路径' },
          port: { type: 'number', description: 'Mock 服务端口' },
          delay: { type: 'number', description: '响应延迟时间（毫秒）' },
          echoMode: { type: 'boolean', description: '是否启用回显模式' },
          responseContent: { type: 'string', description: '默认响应内容' },
        },
        required: [],
      },
      requireConfirmation: false,
      execute: async (args) => {
        if (args.path) websocketMockNodeStore.changeWebSocketMockPath(args.path as string);
        if (args.port) websocketMockNodeStore.changeWebSocketMockPort(args.port as number);
        if (args.delay !== undefined) websocketMockNodeStore.changeWebSocketMockDelay(args.delay as number);
        if (args.echoMode !== undefined) websocketMockNodeStore.changeWebSocketMockEchoMode(args.echoMode as boolean);
        if (args.responseContent) websocketMockNodeStore.changeWebSocketMockResponseContent(args.responseContent as string);
        return { success: true, data: { path: args.path, port: args.port, delay: args.delay, echoMode: args.echoMode } };
      },
    },
    {
      name: 'get_current_websocket_mock_info',
      description: '获取当前正在编辑的 WebSocket Mock 节点信息',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
      requireConfirmation: false,
      execute: async () => {
        const mock = websocketMockNodeStore.websocketMock;
        return {
          success: true,
          data: {
            name: mock.info.name,
            path: mock.requestCondition.path,
            port: mock.requestCondition.port,
            delay: mock.config.delay,
            echoMode: mock.config.echoMode,
            responseContent: mock.response.content,
          },
        };
      },
    },
    {
      name: 'save_current_websocket_mock',
      description: '保存当前正在编辑的 WebSocket Mock 节点',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
      requireConfirmation: true,
      execute: async () => {
        try {
          await websocketMockNodeStore.saveWebSocketMockNode();
          return { success: true, data: { message: 'WebSocket Mock 节点保存成功' } };
        } catch (error) {
          return { success: false, error: error instanceof Error ? error.message : String(error) };
        }
      },
    },
  ];
  // 获取所有工具定义（DeepSeek function call 格式）
  const getToolDefinitions = (): ToolDefinition[] => tools.map(createToolDefinition);
  // 根据名称获取工具
  const getToolByName = (name: string): AgentTool | undefined => tools.find((t) => t.name === name);
  // 执行工具
  const executeTool = async (
    name: string,
    args: Record<string, unknown>,
    confirmed = false
  ): Promise<ToolExecuteResult> => {
    const tool = getToolByName(name);
    if (!tool) {
      return { success: false, error: `工具 "${name}" 不存在` };
    }
    if (tool.requireConfirmation && !confirmed) {
      pendingToolCall.value = { name, args };
      return { success: false, error: 'NEED_CONFIRMATION', needConfirmation: true };
    }
    try {
      const result = await tool.execute(args);
      pendingToolCall.value = null;
      return result;
    } catch (error) {
      pendingToolCall.value = null;
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  };
  // 确认执行待确认的工具
  const confirmPendingTool = async (): Promise<ToolExecuteResult> => {
    if (!pendingToolCall.value) {
      return { success: false, error: '没有待确认的工具调用' };
    }
    const { name, args } = pendingToolCall.value;
    return executeTool(name, args, true);
  };
  // 拒绝执行待确认的工具
  const rejectPendingTool = (): void => {
    pendingToolCall.value = null;
  };
  // 检查工具是否需要确认
  const isToolRequireConfirmation = (name: string): boolean => {
    const tool = getToolByName(name);
    return tool?.requireConfirmation ?? false;
  };
  return {
    pendingToolCall,
    tools,
    getToolDefinitions,
    getToolByName,
    executeTool,
    confirmPendingTool,
    rejectPendingTool,
    isToolRequireConfirmation,
  };
});
