import type { HttpRequestTools, WebSocketTools, MockServerTools, ProjectManagementTools, AIToolRegistry, AITool, AIToolCategory, AllAITools } from '@src/types/ai';

export const HTTP_REQUEST_TOOLS: HttpRequestTools = {
  sendHttpRequest: {
    name: 'sendHttpRequest',
    description: '发送 HTTP 请求到指定 URL',
    category: 'http_request',
    parameters: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: '请求的目标 URL 地址'
        },
        method: {
          type: 'string',
          description: 'HTTP 请求方法',
          enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']
        },
        headers: {
          type: 'object',
          description: '请求头键值对对象',
          properties: {}
        },
        body: {
          type: 'string',
          description: '请求体内容(JSON字符串、FormData或其他格式)'
        },
        timeout: {
          type: 'number',
          description: '请求超时时间(毫秒)'
        }
      },
      required: ['url', 'method']
    }
  },
  cancelHttpRequest: {
    name: 'cancelHttpRequest',
    description: '取消当前正在进行的 HTTP 请求',
    category: 'http_request',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  executePreRequestScript: {
    name: 'executePreRequestScript',
    description: '执行前置脚本(在发送 HTTP 请求之前)',
    category: 'http_request',
    parameters: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: '要执行的 JavaScript 脚本代码'
        },
        requestInfo: {
          type: 'object',
          description: '请求信息对象',
          properties: {}
        },
        variables: {
          type: 'object',
          description: '变量对象',
          properties: {}
        },
        cookies: {
          type: 'object',
          description: 'Cookie 对象',
          properties: {}
        }
      },
      required: ['code', 'requestInfo', 'variables', 'cookies']
    }
  },
  getHttpHistoryList: {
    name: 'getHttpHistoryList',
    description: '获取指定节点的 HTTP 请求历史记录列表',
    category: 'http_request',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: '节点 ID'
        }
      },
      required: ['nodeId']
    }
  },
  getHttpHistoryById: {
    name: 'getHttpHistoryById',
    description: '根据历史记录 ID 获取单条历史记录详情',
    category: 'http_request',
    parameters: {
      type: 'object',
      properties: {
        historyId: {
          type: 'string',
          description: '历史记录 ID'
        }
      },
      required: ['historyId']
    }
  },
  addHttpHistory: {
    name: 'addHttpHistory',
    description: '为指定节点添加新的历史记录',
    category: 'http_request',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: '节点 ID'
        },
        node: {
          type: 'object',
          description: 'HTTP 节点完整信息对象',
          properties: {}
        },
        operatorId: {
          type: 'string',
          description: '操作者 ID'
        },
        operatorName: {
          type: 'string',
          description: '操作者名称'
        }
      },
      required: ['nodeId', 'node', 'operatorId', 'operatorName']
    }
  },
  deleteHttpHistory: {
    name: 'deleteHttpHistory',
    description: '删除指定节点的历史记录',
    category: 'http_request',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: '节点 ID'
        },
        historyIds: {
          type: 'array',
          description: '要删除的历史记录 ID 数组',
          items: {
            type: 'string',
            description: '历史记录 ID'
          }
        }
      },
      required: ['nodeId']
    }
  },
  clearAllHttpHistory: {
    name: 'clearAllHttpHistory',
    description: '清空所有 HTTP 历史记录',
    category: 'http_request',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  setHttpResponse: {
    name: 'setHttpResponse',
    description: '缓存 HTTP 响应数据',
    category: 'http_request',
    parameters: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: '文档 ID'
        },
        response: {
          type: 'object',
          description: '响应信息对象',
          properties: {}
        }
      },
      required: ['id', 'response']
    }
  },
  getHttpResponse: {
    name: 'getHttpResponse',
    description: '获取已缓存的 HTTP 响应数据',
    category: 'http_request',
    parameters: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: '文档 ID'
        }
      },
      required: ['id']
    }
  },
  deleteHttpResponse: {
    name: 'deleteHttpResponse',
    description: '删除 HTTP 响应缓存',
    category: 'http_request',
    parameters: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: '文档 ID'
        }
      },
      required: ['id']
    }
  },
  getHttpResponseCacheStats: {
    name: 'getHttpResponseCacheStats',
    description: '获取响应缓存统计信息',
    category: 'http_request',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  clearAllHttpResponseCache: {
    name: 'clearAllHttpResponseCache',
    description: '清空所有 HTTP 响应缓存',
    category: 'http_request',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  changeHttpMethod: {
    name: 'changeHttpMethod',
    description: '更改 HTTP 请求方法',
    category: 'http_request',
    parameters: {
      type: 'object',
      properties: {
        method: {
          type: 'string',
          description: 'HTTP 请求方法',
          enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']
        }
      },
      required: ['method']
    }
  },
  changeHttpUrl: {
    name: 'changeHttpUrl',
    description: '更改 HTTP 请求 URL',
    category: 'http_request',
    parameters: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: '请求 URL'
        }
      },
      required: ['url']
    }
  },
  changeHttpHeaders: {
    name: 'changeHttpHeaders',
    description: '更改 HTTP 请求头',
    category: 'http_request',
    parameters: {
      type: 'object',
      properties: {
        headers: {
          type: 'object',
          description: '请求头键值对对象',
          properties: {}
        }
      },
      required: ['headers']
    }
  },
  changeHttpBody: {
    name: 'changeHttpBody',
    description: '更改 HTTP 请求体',
    category: 'http_request',
    parameters: {
      type: 'object',
      properties: {
        body: {
          type: 'string',
          description: '请求体内容(JSON字符串或其他格式)'
        }
      },
      required: ['body']
    }
  },
  changeResponseInfo: {
    name: 'changeResponseInfo',
    description: '更改响应信息',
    category: 'http_request',
    parameters: {
      type: 'object',
      properties: {
        payload: {
          type: 'object',
          description: '响应信息部分更新对象',
          properties: {}
        }
      },
      required: ['payload']
    }
  },
  changeRequestState: {
    name: 'changeRequestState',
    description: '更改请求状态',
    category: 'http_request',
    parameters: {
      type: 'object',
      properties: {
        state: {
          type: 'string',
          description: '请求状态',
          enum: ['waiting', 'sending', 'response', 'finish']
        }
      },
      required: ['state']
    }
  }
};
export const WEBSOCKET_TOOLS: WebSocketTools = {
  connectWebSocket: {
    name: 'connectWebSocket',
    description: '连接到 WebSocket 服务器',
    category: 'websocket',
    parameters: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'WebSocket 服务器地址'
        },
        nodeId: {
          type: 'string',
          description: '节点 ID'
        },
        headers: {
          type: 'object',
          description: '请求头键值对对象',
          properties: {}
        }
      },
      required: ['url', 'nodeId']
    }
  },
  disconnectWebSocket: {
    name: 'disconnectWebSocket',
    description: '断开 WebSocket 连接',
    category: 'websocket',
    parameters: {
      type: 'object',
      properties: {
        connectionId: {
          type: 'string',
          description: '连接 ID'
        }
      },
      required: ['connectionId']
    }
  },
  sendWebSocketMessage: {
    name: 'sendWebSocketMessage',
    description: '发送 WebSocket 消息',
    category: 'websocket',
    parameters: {
      type: 'object',
      properties: {
        connectionId: {
          type: 'string',
          description: '连接 ID'
        },
        message: {
          type: 'string',
          description: '消息内容'
        }
      },
      required: ['connectionId', 'message']
    }
  },
  getWebSocketConnectionState: {
    name: 'getWebSocketConnectionState',
    description: '获取 WebSocket 连接状态',
    category: 'websocket',
    parameters: {
      type: 'object',
      properties: {
        connectionId: {
          type: 'string',
          description: '连接 ID'
        }
      },
      required: ['connectionId']
    }
  },
  getAllWebSocketConnections: {
    name: 'getAllWebSocketConnections',
    description: '获取所有 WebSocket 连接信息',
    category: 'websocket',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  getWebSocketConnectionIds: {
    name: 'getWebSocketConnectionIds',
    description: '获取所有连接 ID 列表',
    category: 'websocket',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  checkNodeConnection: {
    name: 'checkNodeConnection',
    description: '检查节点是否有活跃的 WebSocket 连接',
    category: 'websocket',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: '节点 ID'
        }
      },
      required: ['nodeId']
    }
  },
  clearAllWebSocketConnections: {
    name: 'clearAllWebSocketConnections',
    description: '清空所有 WebSocket 连接',
    category: 'websocket',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  disconnectWebSocketByNode: {
    name: 'disconnectWebSocketByNode',
    description: '根据节点 ID 断开 WebSocket 连接',
    category: 'websocket',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: '节点 ID'
        }
      },
      required: ['nodeId']
    }
  },
  changeWebSocketName: {
    name: 'changeWebSocketName',
    description: '更改 WebSocket 节点名称',
    category: 'websocket',
    parameters: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: '节点名称'
        }
      },
      required: ['name']
    }
  },
  changeWebSocketProtocol: {
    name: 'changeWebSocketProtocol',
    description: '更改 WebSocket 协议类型',
    category: 'websocket',
    parameters: {
      type: 'object',
      properties: {
        protocol: {
          type: 'string',
          description: '协议类型',
          enum: ['ws', 'wss']
        }
      },
      required: ['protocol']
    }
  },
  changeWebSocketPath: {
    name: 'changeWebSocketPath',
    description: '更改 WebSocket 请求路径',
    category: 'websocket',
    parameters: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: '请求路径'
        }
      },
      required: ['path']
    }
  },
  addWebSocketHeader: {
    name: 'addWebSocketHeader',
    description: '添加 WebSocket 请求头',
    category: 'websocket',
    parameters: {
      type: 'object',
      properties: {
        header: {
          type: 'object',
          description: '请求头对象',
          properties: {}
        }
      },
      required: []
    }
  },
  deleteWebSocketHeader: {
    name: 'deleteWebSocketHeader',
    description: '删除 WebSocket 请求头',
    category: 'websocket',
    parameters: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: '请求头 ID'
        }
      },
      required: ['id']
    }
  },
  updateWebSocketHeader: {
    name: 'updateWebSocketHeader',
    description: '更新 WebSocket 请求头',
    category: 'websocket',
    parameters: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: '请求头 ID'
        },
        header: {
          type: 'object',
          description: '更新的请求头信息',
          properties: {}
        }
      },
      required: ['id', 'header']
    }
  },
  addWebSocketQueryParam: {
    name: 'addWebSocketQueryParam',
    description: '添加 WebSocket 查询参数',
    category: 'websocket',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  deleteWebSocketQueryParam: {
    name: 'deleteWebSocketQueryParam',
    description: '删除 WebSocket 查询参数',
    category: 'websocket',
    parameters: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: '查询参数 ID'
        }
      },
      required: ['id']
    }
  },
  updateWebSocketQueryParam: {
    name: 'updateWebSocketQueryParam',
    description: '更新 WebSocket 查询参数',
    category: 'websocket',
    parameters: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: '查询参数 ID'
        },
        param: {
          type: 'object',
          description: '更新的参数信息',
          properties: {}
        }
      },
      required: ['id', 'param']
    }
  },
  changeWebSocketMessage: {
    name: 'changeWebSocketMessage',
    description: '更改 WebSocket 发送消息内容',
    category: 'websocket',
    parameters: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: '消息内容'
        }
      },
      required: ['message']
    }
  },
  changeWebSocketMessageType: {
    name: 'changeWebSocketMessageType',
    description: '更改 WebSocket 消息类型',
    category: 'websocket',
    parameters: {
      type: 'object',
      properties: {
        messageType: {
          type: 'string',
          description: '消息类型'
        }
      },
      required: ['messageType']
    }
  },
  addWebSocketMessage: {
    name: 'addWebSocketMessage',
    description: '添加消息到消息数组',
    category: 'websocket',
    parameters: {
      type: 'object',
      properties: {
        message: {
          type: 'object',
          description: '消息对象',
          properties: {}
        }
      },
      required: ['message']
    }
  },
  replaceWebSocketMessages: {
    name: 'replaceWebSocketMessages',
    description: '替换所有消息',
    category: 'websocket',
    parameters: {
      type: 'object',
      properties: {
        messages: {
          type: 'array',
          description: '消息数组',
          items: {
            type: 'object',
            description: '消息对象'
          }
        }
      },
      required: ['messages']
    }
  },
  clearWebSocketMessages: {
    name: 'clearWebSocketMessages',
    description: '清空所有消息',
    category: 'websocket',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  deleteWebSocketMessage: {
    name: 'deleteWebSocketMessage',
    description: '根据 ID 删除消息',
    category: 'websocket',
    parameters: {
      type: 'object',
      properties: {
        messageId: {
          type: 'string',
          description: '消息 ID'
        }
      },
      required: ['messageId']
    }
  },
  getWebSocketMessagesByType: {
    name: 'getWebSocketMessagesByType',
    description: '根据类型筛选消息',
    category: 'websocket',
    parameters: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          description: '消息类型'
        }
      },
      required: ['type']
    }
  },
  getLatestWebSocketMessages: {
    name: 'getLatestWebSocketMessages',
    description: '获取最新的 N 条消息',
    category: 'websocket',
    parameters: {
      type: 'object',
      properties: {
        count: {
          type: 'number',
          description: '消息数量'
        }
      },
      required: ['count']
    }
  },
  addWebSocketMessageTemplate: {
    name: 'addWebSocketMessageTemplate',
    description: '新增消息模板',
    category: 'websocket',
    parameters: {
      type: 'object',
      properties: {
        template: {
          type: 'object',
          description: '消息模板对象',
          properties: {}
        }
      },
      required: ['template']
    }
  },
  updateWebSocketMessageTemplate: {
    name: 'updateWebSocketMessageTemplate',
    description: '更新消息模板',
    category: 'websocket',
    parameters: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: '模板 ID'
        },
        updates: {
          type: 'object',
          description: '更新内容',
          properties: {}
        }
      },
      required: ['id', 'updates']
    }
  },
  deleteWebSocketMessageTemplate: {
    name: 'deleteWebSocketMessageTemplate',
    description: '删除消息模板',
    category: 'websocket',
    parameters: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: '模板 ID'
        }
      },
      required: ['id']
    }
  },
  getWebSocketMessageTemplate: {
    name: 'getWebSocketMessageTemplate',
    description: '根据 ID 获取消息模板',
    category: 'websocket',
    parameters: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: '模板 ID'
        }
      },
      required: ['id']
    }
  },
  getAllWebSocketMessageTemplates: {
    name: 'getAllWebSocketMessageTemplates',
    description: '获取所有消息模板',
    category: 'websocket',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  clearAllWebSocketMessageTemplates: {
    name: 'clearAllWebSocketMessageTemplates',
    description: '清空所有消息模板',
    category: 'websocket',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  saveWebSocket: {
    name: 'saveWebSocket',
    description: '保存 WebSocket 配置',
    category: 'websocket',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  getWebSocketDetail: {
    name: 'getWebSocketDetail',
    description: '获取 WebSocket 节点详情',
    category: 'websocket',
    parameters: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: '节点 ID'
        },
        projectId: {
          type: 'string',
          description: '项目 ID'
        }
      },
      required: ['id', 'projectId']
    }
  }
};
export const MOCK_SERVER_TOOLS: MockServerTools = {
  startHttpMockServer: {
    name: 'startHttpMockServer',
    description: '启动 HTTP Mock 服务器',
    category: 'mock_server',
    parameters: {
      type: 'object',
      properties: {
        httpMock: {
          type: 'object',
          description: 'HTTP Mock 节点配置对象',
          properties: {}
        }
      },
      required: ['httpMock']
    }
  },
  stopHttpMockServer: {
    name: 'stopHttpMockServer',
    description: '停止 HTTP Mock 服务器',
    category: 'mock_server',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: '节点 ID'
        }
      },
      required: ['nodeId']
    }
  },
  getHttpMockByNodeId: {
    name: 'getHttpMockByNodeId',
    description: '根据节点 ID 获取 HTTP Mock 配置',
    category: 'mock_server',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: '节点 ID'
        }
      },
      required: ['nodeId']
    }
  },
  replaceHttpMockById: {
    name: 'replaceHttpMockById',
    description: '根据 ID 替换 HTTP Mock 配置',
    category: 'mock_server',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: '节点 ID'
        },
        httpMock: {
          type: 'object',
          description: '新的 Mock 配置对象',
          properties: {}
        }
      },
      required: ['nodeId', 'httpMock']
    }
  },
  removeHttpMockByNodeId: {
    name: 'removeHttpMockByNodeId',
    description: '根据节点 ID 移除 HTTP Mock 配置',
    category: 'mock_server',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: '节点 ID'
        }
      },
      required: ['nodeId']
    }
  },
  removeHttpMocksByProjectId: {
    name: 'removeHttpMocksByProjectId',
    description: '根据项目 ID 移除所有 HTTP Mock 配置',
    category: 'mock_server',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: '项目 ID'
        }
      },
      required: ['projectId']
    }
  },
  removeHttpMocksAndStopServersByProjectId: {
    name: 'removeHttpMocksAndStopServersByProjectId',
    description: '根据项目 ID 移除所有 HTTP Mock 并停止服务器',
    category: 'mock_server',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: '项目 ID'
        }
      },
      required: ['projectId']
    }
  },
  getAllHttpMockStates: {
    name: 'getAllHttpMockStates',
    description: '获取所有 HTTP Mock 状态',
    category: 'mock_server',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: '项目 ID'
        }
      },
      required: ['projectId']
    }
  },
  changeHttpMockName: {
    name: 'changeHttpMockName',
    description: '更改 HTTP Mock 节点名称',
    category: 'mock_server',
    parameters: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: '节点名称'
        }
      },
      required: ['name']
    }
  },
  changeHttpMockMethod: {
    name: 'changeHttpMockMethod',
    description: '更改 HTTP Mock 请求方法',
    category: 'mock_server',
    parameters: {
      type: 'object',
      properties: {
        method: {
          type: 'string',
          description: 'HTTP 请求方法',
          enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS', 'ALL']
        }
      },
      required: ['method']
    }
  },
  changeHttpMockUrl: {
    name: 'changeHttpMockUrl',
    description: '更改 HTTP Mock 请求 URL',
    category: 'mock_server',
    parameters: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: '请求 URL'
        }
      },
      required: ['url']
    }
  },
  changeHttpMockPort: {
    name: 'changeHttpMockPort',
    description: '更改 HTTP Mock 端口',
    category: 'mock_server',
    parameters: {
      type: 'object',
      properties: {
        port: {
          type: 'number',
          description: '端口号'
        }
      },
      required: ['port']
    }
  },
  changeHttpMockDelay: {
    name: 'changeHttpMockDelay',
    description: '更改 HTTP Mock 延迟时间',
    category: 'mock_server',
    parameters: {
      type: 'object',
      properties: {
        delay: {
          type: 'number',
          description: '延迟时间(毫秒)'
        }
      },
      required: ['delay']
    }
  },
  saveHttpMock: {
    name: 'saveHttpMock',
    description: '保存 HTTP Mock 配置',
    category: 'mock_server',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  getHttpMockDetail: {
    name: 'getHttpMockDetail',
    description: '获取 HTTP Mock 节点详情',
    category: 'mock_server',
    parameters: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: '节点 ID'
        },
        projectId: {
          type: 'string',
          description: '项目 ID'
        }
      },
      required: ['id', 'projectId']
    }
  },
  checkMockNodeEnabledStatus: {
    name: 'checkMockNodeEnabledStatus',
    description: '检查 Mock 节点是否已启用',
    category: 'mock_server',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: '节点 ID'
        }
      },
      required: ['nodeId']
    }
  }
};
export const PROJECT_MANAGEMENT_TOOLS: ProjectManagementTools = {
  getProjectList: {
    name: 'getProjectList',
    description: '获取项目列表',
    category: 'project_management',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  getProjectInfo: {
    name: 'getProjectInfo',
    description: '获取单个项目信息',
    category: 'project_management',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: '项目 ID'
        }
      },
      required: ['projectId']
    }
  },
  addProject: {
    name: 'addProject',
    description: '添加新项目',
    category: 'project_management',
    parameters: {
      type: 'object',
      properties: {
        project: {
          type: 'object',
          description: '项目信息对象',
          properties: {}
        }
      },
      required: ['project']
    }
  },
  updateProject: {
    name: 'updateProject',
    description: '更新项目信息',
    category: 'project_management',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: '项目 ID'
        },
        project: {
          type: 'object',
          description: '更新的项目信息',
          properties: {}
        }
      },
      required: ['projectId', 'project']
    }
  },
  deleteProject: {
    name: 'deleteProject',
    description: '删除项目(软删除)',
    category: 'project_management',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: '项目 ID'
        }
      },
      required: ['projectId']
    }
  },
  getDeletedProjectList: {
    name: 'getDeletedProjectList',
    description: '获取已删除的项目列表',
    category: 'project_management',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  recoverProject: {
    name: 'recoverProject',
    description: '恢复已删除的项目',
    category: 'project_management',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: '项目 ID'
        }
      },
      required: ['projectId']
    }
  },
  permanentlyDeleteProject: {
    name: 'permanentlyDeleteProject',
    description: '永久删除项目',
    category: 'project_management',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: '项目 ID'
        }
      },
      required: ['projectId']
    }
  },
  clearDeletedProjects: {
    name: 'clearDeletedProjects',
    description: '清空所有已删除的项目',
    category: 'project_management',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  getAllNodes: {
    name: 'getAllNodes',
    description: '获取所有节点列表',
    category: 'project_management',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  getNodesByProjectId: {
    name: 'getNodesByProjectId',
    description: '获取项目下所有节点',
    category: 'project_management',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: '项目 ID'
        }
      },
      required: ['projectId']
    }
  },
  getNodeById: {
    name: 'getNodeById',
    description: '根据节点 ID 获取节点信息',
    category: 'project_management',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: '节点 ID'
        }
      },
      required: ['nodeId']
    }
  },
  addNode: {
    name: 'addNode',
    description: '添加一个节点',
    category: 'project_management',
    parameters: {
      type: 'object',
      properties: {
        node: {
          type: 'object',
          description: '节点对象',
          properties: {}
        }
      },
      required: ['node']
    }
  },
  updateNode: {
    name: 'updateNode',
    description: '更新节点信息',
    category: 'project_management',
    parameters: {
      type: 'object',
      properties: {
        node: {
          type: 'object',
          description: '节点对象',
          properties: {}
        }
      },
      required: ['node']
    }
  },
  updateNodeName: {
    name: 'updateNodeName',
    description: '更新节点名称',
    category: 'project_management',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: '节点 ID'
        },
        name: {
          type: 'string',
          description: '新名称'
        }
      },
      required: ['nodeId', 'name']
    }
  },
  deleteNode: {
    name: 'deleteNode',
    description: '删除一个节点(软删除)',
    category: 'project_management',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: '节点 ID'
        }
      },
      required: ['nodeId']
    }
  },
  deleteNodes: {
    name: 'deleteNodes',
    description: '批量删除节点',
    category: 'project_management',
    parameters: {
      type: 'object',
      properties: {
        nodeIds: {
          type: 'array',
          description: '节点 ID 数组',
          items: {
            type: 'string',
            description: '节点 ID'
          }
        }
      },
      required: ['nodeIds']
    }
  },
  deleteNodesByProjectId: {
    name: 'deleteNodesByProjectId',
    description: '删除整个项目的所有节点',
    category: 'project_management',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: '项目 ID'
        }
      },
      required: ['projectId']
    }
  },
  getDeletedNodesList: {
    name: 'getDeletedNodesList',
    description: '获取已删除节点列表',
    category: 'project_management',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: '项目 ID'
        }
      },
      required: ['projectId']
    }
  },
  restoreNode: {
    name: 'restoreNode',
    description: '恢复已删除的节点',
    category: 'project_management',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: '节点 ID'
        }
      },
      required: ['nodeId']
    }
  },
  exportProjectToHtml: {
    name: 'exportProjectToHtml',
    description: '导出项目为 HTML 文件',
    category: 'project_management',
    parameters: {
      type: 'object',
      properties: {
        exportHtmlParams: {
          type: 'object',
          description: '导出参数对象',
          properties: {}
        }
      },
      required: ['exportHtmlParams']
    }
  },
  exportProjectToWord: {
    name: 'exportProjectToWord',
    description: '导出项目为 Word 文档',
    category: 'project_management',
    parameters: {
      type: 'object',
      properties: {
        exportHtmlParams: {
          type: 'object',
          description: '导出参数对象',
          properties: {}
        }
      },
      required: ['exportHtmlParams']
    }
  },
  selectExportPath: {
    name: 'selectExportPath',
    description: '选择导出路径',
    category: 'project_management',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  startExport: {
    name: 'startExport',
    description: '开始导出流程',
    category: 'project_management',
    parameters: {
      type: 'object',
      properties: {
        itemNum: {
          type: 'number',
          description: '导出项目数量'
        }
      },
      required: ['itemNum']
    }
  },
  receiveRendererData: {
    name: 'receiveRendererData',
    description: '接收渲染进程的导出数据',
    category: 'project_management',
    parameters: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          description: '导出数据对象',
          properties: {}
        }
      },
      required: ['data']
    }
  },
  finishRendererData: {
    name: 'finishRendererData',
    description: '完成渲染进程数据发送',
    category: 'project_management',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  resetExport: {
    name: 'resetExport',
    description: '重置导出状态',
    category: 'project_management',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  getExportStatus: {
    name: 'getExportStatus',
    description: '获取导出状态',
    category: 'project_management',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  selectImportFile: {
    name: 'selectImportFile',
    description: '选择导入文件',
    category: 'project_management',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  analyzeImportFile: {
    name: 'analyzeImportFile',
    description: '分析导入文件',
    category: 'project_management',
    parameters: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description: '文件路径'
        }
      },
      required: ['filePath']
    }
  },
  startImport: {
    name: 'startImport',
    description: '开始导入',
    category: 'project_management',
    parameters: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description: '文件路径'
        },
        itemNum: {
          type: 'number',
          description: '导入项目数量'
        }
      },
      required: ['filePath', 'itemNum']
    }
  },
  getImportStatus: {
    name: 'getImportStatus',
    description: '获取导入状态',
    category: 'project_management',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  resetImport: {
    name: 'resetImport',
    description: '重置导入状态',
    category: 'project_management',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  replaceAllNodes: {
    name: 'replaceAllNodes',
    description: '覆盖替换所有接口节点',
    category: 'project_management',
    parameters: {
      type: 'object',
      properties: {
        nodes: {
          type: 'array',
          description: '节点数组',
          items: {
            type: 'object',
            description: '节点对象'
          }
        },
        projectId: {
          type: 'string',
          description: '项目 ID'
        }
      },
      required: ['nodes', 'projectId']
    }
  },
  appendNodes: {
    name: 'appendNodes',
    description: '批量追加接口节点',
    category: 'project_management',
    parameters: {
      type: 'object',
      properties: {
        nodes: {
          type: 'array',
          description: '节点数组',
          items: {
            type: 'object',
            description: '节点对象'
          }
        },
        projectId: {
          type: 'string',
          description: '项目 ID'
        }
      },
      required: ['nodes', 'projectId']
    }
  },
  setProjectSharePassword: {
    name: 'setProjectSharePassword',
    description: '缓存项目分享密码',
    category: 'project_management',
    parameters: {
      type: 'object',
      properties: {
        shareId: {
          type: 'string',
          description: '分享 ID'
        },
        password: {
          type: 'string',
          description: '密码'
        }
      },
      required: ['shareId', 'password']
    }
  },
  getProjectSharePassword: {
    name: 'getProjectSharePassword',
    description: '获取缓存的项目分享密码',
    category: 'project_management',
    parameters: {
      type: 'object',
      properties: {
        shareId: {
          type: 'string',
          description: '分享 ID'
        }
      },
      required: ['shareId']
    }
  },
  clearProjectSharePassword: {
    name: 'clearProjectSharePassword',
    description: '清除项目分享密码缓存',
    category: 'project_management',
    parameters: {
      type: 'object',
      properties: {
        shareId: {
          type: 'string',
          description: '分享 ID'
        }
      },
      required: ['shareId']
    }
  }
};
export const AI_TOOL_REGISTRY: AIToolRegistry = {
  httpRequest: HTTP_REQUEST_TOOLS,
  websocket: WEBSOCKET_TOOLS,
  mockServer: MOCK_SERVER_TOOLS,
  projectManagement: PROJECT_MANAGEMENT_TOOLS
};
export const getAllAITools = (): AllAITools => {
  return [
    ...Object.values(HTTP_REQUEST_TOOLS),
    ...Object.values(WEBSOCKET_TOOLS),
    ...Object.values(MOCK_SERVER_TOOLS),
    ...Object.values(PROJECT_MANAGEMENT_TOOLS)
  ];
};
export const getToolsByCategory = (category: AIToolCategory): AITool[] => {
  switch (category) {
    case 'http_request':
      return Object.values(HTTP_REQUEST_TOOLS);
    case 'websocket':
      return Object.values(WEBSOCKET_TOOLS);
    case 'mock_server':
      return Object.values(MOCK_SERVER_TOOLS);
    case 'project_management':
      return Object.values(PROJECT_MANAGEMENT_TOOLS);
    default:
      return [];
  }
};
export const getToolByName = (name: string): AITool | undefined => {
  return getAllAITools().find(tool => tool.name === name);
};