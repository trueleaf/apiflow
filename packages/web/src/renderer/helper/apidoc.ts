import { nanoid } from 'nanoid/non-secure';
import type {
  HttpNodeRequestMethod,
  ApidocProperty,
  HttpNodePropertyType,
  HttpNode,
  ApidocBanner,
  HttpNodeRequestParamTypes,
  ApiNode,
  MockHttpNode,
  ApidocProjectInfo,
  ResponseInfo,
  WebSocketNode,
  FolderNode,
} from '@src/types';
import { cloneDeep } from 'lodash-es';
import { arrayToTree } from './tree';
import type { HttpNodeResponseData, UrlInfo } from '@src/types/helper';
import { useVariable } from '@/store/share/variablesStore';
import { getCompiledTemplate } from './template';

/**
 * 获取请求方法
 */
export const getRequestMethodEnum = (): HttpNodeRequestMethod[] => {
  return ['GET', 'POST', 'PUT', 'DELETE', 'TRACE', 'OPTIONS', 'PATCH', 'HEAD'];
}

/**
 * 生成一条接口参数
 */
export const apidocGenerateProperty = <T extends HttpNodePropertyType = 'string'>(type?: T): ApidocProperty<T> => {
  const result = {
    _id: nanoid(),
    key: '',
    type: type || 'string',
    description: '',
    value: '',
    required: true,
    select: true,
  };
  return result as ApidocProperty<T>;
}

/**
 * 检查每个ApidocProperty是否一致
 */
export const checkIsSameProperty = (p: ApidocProperty, p2: ApidocProperty): boolean => {
  let isSame = true;
  const checkProperty = (prop: ApidocProperty, prop2: ApidocProperty) => {
    if (prop.key !== prop2.key) {
      isSame = false;
      return;
    }
    if (prop.value !== prop2.value) {
      isSame = false;
      return;
    }
    if (prop.type !== prop2.type) {
      isSame = false;
      return;
    }
    if (prop.required !== prop2.required) {
      isSame = false;
      return;
    }
    if (prop.description !== prop2.description) {
      isSame = false;
      return;
    }
    if (prop.select !== prop2.select) {
      isSame = false;
    }
  }
  checkProperty(p, p2);
  return isSame;
}

/**
 * 检查ApidocProperty[]类型数据是否相同
 */
export const checkPropertyIsEqual = (value: ApidocProperty[], originValue: ApidocProperty[]): boolean => {
  if (value.length !== originValue.length) return false;
  for (let i = 0; i < value.length; i += 1) {
    const item = value[i];
    const { _id } = item;
    const matchedOriginItem = originValue.find(v => v._id === _id);
    if (!matchedOriginItem) {
      return false;
    }
    if (!checkIsSameProperty(item, matchedOriginItem)) {
      return false;
    }
  }
  return true;
}

/**
 * 生成一份空的项目默认值
 */
export const generateEmptyProject = (_id: string): ApidocProjectInfo => {
  return {
    _id,
    docNum: 0,
    owner: {
      id: '',
      name: 'me'
    },
    members: [],
    projectName: '',
    remark: '',
    updatedAt: new Date().toISOString(),
    isStared: false,
    isDeleted: false,
  }
}

/**
 * 生成一份空的HTTP节点默认值
 */
export const generateEmptyHttpNode = (_id: string): HttpNode => {
  return {
    _id,
    pid: '',
    projectId: '',
    sort: 0,
    info: {
      name: '',
      description: '',
      version: '1.0.0',
      type: 'http',
      creator: '',
      maintainer: '',
      deletePerson: '',
    },
    item: {
      method: 'GET',
      url: {
        prefix: '',
        path: ''
      },
      paths: [],
      queryParams: [],
      requestBody: {
        mode: 'json',
        rawJson: '',
        formdata: [],
        urlencoded: [],
        raw: {
          data: '',
          dataType: 'text/plain'
        },
        binary: {
          mode: 'var',
          varValue: '',
          binaryValue: {
            path: '',
            raw: '',
            id: ''
          }
        }
      },
      responseParams: [],
      headers: [],
      contentType: ''
    },
    preRequest: {
      raw: ''
    },
    afterRequest: {
      raw: ''
    },
    isDeleted: false,
    createdAt: '',
    updatedAt: '',
  }
}

/**
 * 生成一份空的WebSocket节点默认值
 */
export const generateEmptyWebsocketNode = (_id: string): WebSocketNode => {
  return {
    _id,
    pid: '',
    projectId: '',
    sort: 0,
    info: {
      name: '',
      description: '',
      version: '1.0.0',
      type: 'websocket',
      creator: '',
      maintainer: '',
      deletePerson: '',
    },
    item: {
      protocol: 'ws',
      url: {
        path: "",
        prefix: "",
      },
      queryParams: [],
      headers: [],
      sendMessage: '',
    },
    config: {
      messageType: 'json',
      autoSend: false,
      autoSendInterval: 30000,
      defaultAutoSendContent: 'ping',
      autoReconnect: false,
    },
    preRequest: {
      raw: ''
    },
    afterRequest: {
      raw: ''
    },
    createdAt: '',
    updatedAt: '',
    isDeleted: false,
  }
}

/**
 * 生成一份空的HTTP mock节点
 */
export const generateEmptyHttpMockNode = (_id: string): MockHttpNode => {
  return {
    _id,
    pid: '',
    projectId: '',
    sort: 0,
    info: {
      name: '',
      description: '',
      version: '1.0.0',
      type: 'httpMock',
      creator: '',
      maintainer: '',
      deletePerson: '',
    },
    requestCondition: {
      method: ['ALL'],
      url: '/mock/v1',
      port: 4000,
    },
    config: {
      delay: 0,
    },
    response: [
      {
        name: '默认返回',
        isDefault: true,
        conditions: {
          name: '',
          scriptCode: '',
          enabled: false,
        },
        statusCode: 200,
        headers: {
          enabled: false,
          defaultHeaders: [
            { ...apidocGenerateProperty(), key: 'Content-Type', value: 'application/json; charset=utf-8', select: true, description: '响应内容类型' },
            { ...apidocGenerateProperty(), key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate', select: false, description: '禁用缓存' },
            { ...apidocGenerateProperty(), key: 'Access-Control-Allow-Origin', value: '*', select: false, description: '允许所有域名跨域访问' },
            { ...apidocGenerateProperty(), key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, PATCH, OPTIONS', select: false, description: '允许的HTTP方法' },
            { ...apidocGenerateProperty(), key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, X-Requested-With', select: false, description: '允许的请求头字段' },
            { ...apidocGenerateProperty(), key: 'X-Content-Type-Options', value: 'nosniff', select: false, description: '防止浏览器MIME类型嗅探' },
            { ...apidocGenerateProperty(), key: 'X-Frame-Options', value: 'DENY', select: false, description: '禁止在iframe中加载' },
          ],
          customHeaders: [apidocGenerateProperty()],
        },
        dataType: 'json',
        sseConfig: {
          event: {
            id: {
              enable: false,
              valueMode: 'increment',
            },
            event: {
              enable: true,
              value: 'message',
            },
            data: {
              mode: 'json',
              value: '',
            },
            retry: {
              enable: false,
              value: 3000,
            },
          },
          interval: 1000,
          maxNum: 10,
        },
        jsonConfig: {
          mode: 'fixed',
          fixedData: '',
          randomSize: 0,
          prompt: '',
        },
        textConfig: {
          mode: 'fixed',
          textType: 'text/plain',
          fixedData: '',
          randomSize: 0,
          prompt: '',
        },
        imageConfig: {
          mode: 'fixed',
          imageConfig: 'png',
          randomSize: 10,
          randomWidth: 100,
          randomHeight: 100,
          fixedFilePath: '',
        },
        fileConfig: {
          fileType: 'doc',
        },
        binaryConfig: {
          filePath: '',
        },
      },
    ],
    createdAt: '',
    updatedAt: '',
    isDeleted: false,
  }
}

/**
 * 生成一份apidoc默认值(保持向后兼容)
 */
export const generateHttpNode = (id?: string): HttpNode => {
  const result = generateEmptyHttpNode(id || nanoid());
  // 添加默认的response参数以保持向后兼容
  result.item.responseParams = [{
    _id: nanoid(),
    title: '成功返回',
    statusCode: 200,
    value: {
      file: {
        url: '',
        raw: ''
      },
      strJson: '',
      dataType: 'application/json',
      text: ''
    },
  }];
  // 调整一些默认值以保持向后兼容
  result.item.requestBody.raw.dataType = 'text/plain';
  result.item.requestBody.binary.mode = 'file';
  return result;
}

/**
 * 生成一份参数类型数组
 */
export const apidocGenerateRequestParamTypes = (): HttpNodeRequestParamTypes => {
  return ['path', 'params', 'json', 'x-www-form-urlencoded', 'formData', 'text/javascript', 'text/plain', 'text/html', 'application/xml'];
}

/**
 * 将API节点转换为Banner节点
 */
export const convertNodesToBannerNodes = (docs: ApiNode[] = []): ApidocBanner[] => {
  const treeData = arrayToTree(docs);
  const copyTreeData = cloneDeep(treeData)
  const banner: ApidocBanner[] = []
  const foo = (nodes: (ApiNode & { children: ApiNode[] })[], banner: ApidocBanner[]): void => {
    // 对节点进行排序：目录在前，文档在后
    const sortedNodes = [...nodes].sort((a, b) => {
      // 如果一个是目录一个是文档，目录排在前面
      if (a.info.type === 'folder' && b.info.type !== 'folder') return -1;
      if (a.info.type !== 'folder' && b.info.type === 'folder') return 1;
      // 如果都是目录或都是文档，按sort字段排序
      return (a.sort || 0) - (b.sort || 0);
    });

    for (let i = 0; i < sortedNodes.length; i += 1) {
      const node = sortedNodes[i];
      let bannerNode: ApidocBanner;

      if (node.info.type === 'http') {
        bannerNode = {
          _id: node._id,
          updatedAt: node.updatedAt || '',
          type: 'http',
          sort: node.sort,
          pid: node.pid,
          name: node.info.name,
          maintainer: node.info.maintainer,
          method: (node as HttpNode).item.method,
          url: (node as HttpNode).item.url.path,
          readonly: false,
          children: [],
        };
      } else if (node.info.type === 'httpMock') {
        const mockNode = node as MockHttpNode;
        bannerNode = {
          _id: mockNode._id,
          updatedAt: mockNode.updatedAt || '',
          type: 'httpMock',
          sort: mockNode.sort,
          pid: mockNode.pid,
          name: mockNode.info.name,
          maintainer: mockNode.info.maintainer,
          method: mockNode.requestCondition.method[0] || 'ALL',
          url: mockNode.requestCondition.url,
          port: mockNode.requestCondition.port,
          state: 'stopped',
          readonly: false,
          children: [],
        };
      } else if (node.info.type === 'websocket') {
        bannerNode = {
          _id: node._id,
          updatedAt: node.updatedAt || '',
          type: 'websocket',
          sort: node.sort,
          pid: node.pid,
          name: node.info.name,
          maintainer: node.info.maintainer,
          protocol: (node as WebSocketNode).item.protocol,
          url: (node as WebSocketNode).item.url,
          readonly: false,
          children: [],
        };
      } else if (node.info.type === 'folder') {
        bannerNode = {
          _id: node._id,
          updatedAt: node.updatedAt || '',
          type: 'folder',
          sort: node.sort,
          pid: node.pid,
          name: node.info.name,
          maintainer: node.info.maintainer,
          commonHeaders: (node as FolderNode).commonHeaders || [],
          readonly: false,
          children: [],
        };
      } else if (node.info.type === 'markdown') {
        bannerNode = {
          _id: node._id,
          updatedAt: node.updatedAt || '',
          type: 'markdown',
          sort: node.sort,
          pid: node.pid,
          name: node.info.name,
          maintainer: node.info.maintainer,
          readonly: false,
          children: [],
        };
      } else {
        continue;
      }

      banner.push(bannerNode);
      if (node.children.length > 0) {
        foo(node.children as (ApiNode & { children: ApiNode[] })[], bannerNode.children)
      }
    }
  }
  foo(copyTreeData, banner)
  return banner
}

/**
 * 生成空响应信息
 */
export const generateEmptyResponse = (): ResponseInfo => {
  return {
    id: '',
    apiId: '',
    requestId: '',
    headers: {},
    contentLength: 0,
    finalRequestUrl: '',
    redirectList: [],
    ip: '',
    isFromCache: false,
    statusCode: 0,
    timings: {
      start: 0,
      socket: 0,
      lookup: 0,
      connect: 0,
      secureConnect: 0,
      upload: 0,
      response: 0,
      end: 0,
      error: 0,
      abort: 0,
      phases: {
          wait: 0,
          dns: 0,
          tcp: 0,
          tls: 0,
          request: 0,
          firstByte: 0,
          download: 0,
          total: 0,
      }
    },
    contentType: '',
    retryCount: 0,
    body: null,
    bodyByteLength: 0,
    rt: 0,
    requestData: {
      url: "",
      method: "get",
      body: "",
      headers: {},
      host: "",
    },
    responseData: {
      canApiflowParseType: 'none',
      jsonData: '',
      textData: '',
      errorData: '',
      streamData: [],
      fileData: {
        url: '',
        name: '',
        ext: '',
      }
    },
  }
}

/**
 * 转换URL信息
 */
export const getUrlInfo = async (apidoc: HttpNode): Promise<UrlInfo> => {
  const { queryParams } = apidoc.item;
  const { path, prefix } = apidoc.item.url;
  const variableStore = useVariable();
  const variables = variableStore.variables;
  // query参数解析
  const queryPairs = await Promise.all(
    queryParams
      .filter(param => param.key.trim() !== '')
      .map(async (param) => {
        const key = param.key.trim();
        const value = param.value.trim();
        const compiledValue = await getCompiledTemplate(value, variables);
        return `${key}=${String(compiledValue)}`;
      })
  );
  const queryString = queryPairs.length > 0 ? `?${queryPairs.join('&')}` : '';
  return {
    host: prefix,
    path,
    url: `${prefix}${path}${queryString}`,
  };
};

/**
 * Response转换
 */
export const getResponseParamsByHttpNode = (apidoc: HttpNode): HttpNodeResponseData[] => {
  const { responseParams } = apidoc.item;
  const result: HttpNodeResponseData[] = [];
  responseParams.forEach(res => {
    const data: HttpNodeResponseData = {
      title: res.title,
      statusCode: res.statusCode,
      dataType: res.value.dataType,
    };
    switch (res.value.dataType) {
    case 'application/json':
      data.json = res.value.strJson
      break;
    default:
      break;
    }
    result.push(data)
  })
  return result;
}
