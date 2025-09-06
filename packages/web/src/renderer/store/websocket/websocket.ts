import { WebSocketNode, MessageType, WebsocketResponse, WebsocketSendMessageTemplate } from "@src/types/websocket/websocket.ts";
import { defineStore, storeToRefs } from "pinia";
import { ref, watch } from "vue";
import { ApidocProperty } from "@src/types";
import { apidocGenerateProperty, generateEmptyWebsocketNode, uuid, cloneDeep, debounce } from "@/helper";
import { standaloneCache } from "@/cache/standalone.ts";
import { webSocketNodeCache } from "@/cache/websocket/websocketNodeCache.ts";
import { ElMessageBox } from "element-plus";
import { useApidocTas } from "../apidoc/tabs.ts";
import { router } from "@/router/index.ts";
import { useApidocBanner } from "../apidoc/banner.ts";
import { getWebSocketUrl } from "@/server/request/request.ts";
import { useVariable } from "../apidoc/variables.ts";
import { config } from "@src/config/config.ts";
import { useCookies } from "../apidoc/cookies.ts";
import i18next from "i18next";

export const useWebSocket = defineStore('websocket', () => {
  const apidocVariableStore = useVariable();
  const websocketCookies = useCookies();
  const websocket = ref<WebSocketNode>(generateEmptyWebsocketNode(uuid()));
  const originWebsocket = ref<WebSocketNode>(generateEmptyWebsocketNode(uuid()));
  const loading = ref(false);
  const saveLoading = ref(false);
  const responseCacheLoading = ref(false);
  const websocketFullUrl = ref('');
  const defaultHeaders = ref<ApidocProperty<"string">[]>([]);
  const connectionState = ref<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const connectionId = ref('');
  const responseMessage = ref<WebsocketResponse[]>([]);
  const sendMessageTemplateList = ref<WebsocketSendMessageTemplate[]>([]);
  /*
  |--------------------------------------------------------------------------
  | 通用方法 - Cookie自动更新
  |--------------------------------------------------------------------------
  */
  //更新cookie头
  watch([() => {
    return websocket.value.item.url;
  }, () => {
    return apidocVariableStore.objectVariable;
  }, () => {
    return websocketCookies.cookies;
  }], async () => {
    const fullUrl = await getWebSocketUrl(websocket.value);
    const matchedCookies = websocketCookies.getMachtedCookies(fullUrl);
    const property: ApidocProperty<'string'> = apidocGenerateProperty();
    property.key = "Cookie";
    let cookieValue = '';
    
    if (matchedCookies.length > 0) {
      cookieValue = matchedCookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
      property.value = cookieValue;
      property.description = i18next.t('<发送时候自动计算>');
      property._disableDelete = true;
      property._disableKey = true;
      property._disableDescription = true;
      const cookieIndex = defaultHeaders.value.findIndex(header => header.key === "Cookie");
      if (cookieIndex !== -1) {
        defaultHeaders.value[cookieIndex].value = cookieValue;
      } else {
        defaultHeaders.value.unshift(property);
      }
    }
  }, {
    deep: true,
    immediate: true,
  });

  /*
  |--------------------------------------------------------------------------
  | 基本信息操作方法
  |--------------------------------------------------------------------------
  */
  // 改变websocket名称
  const changeWebSocketName = (name: string): void => {
    websocket.value.info.name = name;
  };

  // 改变websocket描述
  const changeWebSocketDescription = (description: string): void => {
    if (websocket.value) {
      websocket.value.info.description = description;
    }
  };
  // 改变协议类型
  const changeWebSocketProtocol = (protocol: 'ws' | 'wss'): void => {
    if (websocket.value) {
      websocket.value.item.protocol = protocol;
    }
  };
  // 改变请求路径
  const changeWebSocketPath = (path: string): void => {
    if (websocket.value) {
      websocket.value.item.url.path = path;
    }
  };
  // 改变请求前缀
  const changeWebSocketPrefix = (prefix: string): void => {
    if (websocket.value) {
      websocket.value.item.url.prefix = prefix;
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Headers操作方法
  |--------------------------------------------------------------------------
  */
  // 初始化默认请求头
  const initDefaultHeaders = () => {
    defaultHeaders.value = [];
    
    //=========================================================================//
    // Host头 - WebSocket连接必需的主机信息
    const hostHeader = apidocGenerateProperty();
    hostHeader.key = 'Host';
    hostHeader.description = '<主机信息，WebSocket连接必需>';
    hostHeader._disableKey = true;
    hostHeader._disableKeyTip = '该请求头无法修改，也无法取消发送';
    hostHeader._disableDeleteTip = 'Host请求头无法删除';
    hostHeader._disableValue = true;
    hostHeader._valuePlaceholder = '<发送请求时候自动处理>';
    hostHeader._disableDescription = true;
    hostHeader._disableAdd = true;
    hostHeader._disableDelete = true;
    hostHeader.disabled = true;
    defaultHeaders.value.push(hostHeader);

    //=========================================================================//
    // Origin头 - WebSocket协议要求的来源标识
    const originHeader = apidocGenerateProperty();
    originHeader.key = 'Origin';
    originHeader.value = 'http://localhost:3000';
    originHeader.description = '<请求来源，WebSocket协议要求>';
    originHeader._disableKey = true;
    originHeader._disableDescription = true;
    originHeader._disableKeyTip = 'Origin是WebSocket协议必需的请求头';
    originHeader._disableAdd = true;
    originHeader._disableDelete = true;
    defaultHeaders.value.push(originHeader);

    //=========================================================================//
    // User-Agent头
    const userAgentHeader = apidocGenerateProperty();
    userAgentHeader.key = 'User-Agent';
    userAgentHeader._valuePlaceholder = config.requestConfig.userAgent;
    userAgentHeader.description = '<用户代理软件信息>';
    userAgentHeader._disableKey = true;
    userAgentHeader._disableKeyTip = '';
    userAgentHeader._disableDescription = true;
    userAgentHeader._disableAdd = true;
    userAgentHeader._disableDelete = true;
    defaultHeaders.value.push(userAgentHeader);

    //=========================================================================//
    // Accept-Language头
    const acceptLanguageHeader = apidocGenerateProperty();
    acceptLanguageHeader.key = 'Accept-Language';
    acceptLanguageHeader._valuePlaceholder = 'zh-CN,zh;q=0.9,en;q=0.8';
    acceptLanguageHeader.description = '<客户端可接受的语言类型>';
    acceptLanguageHeader._disableKey = true;
    acceptLanguageHeader._disableDescription = true;
    acceptLanguageHeader._disableKeyTip = '';
    acceptLanguageHeader._disableAdd = true;
    acceptLanguageHeader._disableDelete = true;
    defaultHeaders.value.push(acceptLanguageHeader);

    //=========================================================================//
    // Accept-Encoding头
    const acceptEncodingHeader = apidocGenerateProperty();
    acceptEncodingHeader.key = 'Accept-Encoding';
    acceptEncodingHeader._valuePlaceholder = 'gzip, deflate, br';
    acceptEncodingHeader.description = '<客户端理解的编码方式>';
    acceptEncodingHeader._disableKey = true;
    acceptEncodingHeader._disableDescription = true;
    acceptEncodingHeader._disableKeyTip = '';
    acceptEncodingHeader._disableValue = true;
    acceptEncodingHeader._disableAdd = true;
    acceptEncodingHeader._disableDelete = true;
    acceptEncodingHeader.disabled = true;
    defaultHeaders.value.push(acceptEncodingHeader);

    //=========================================================================//
    // Cache-Control头
    const cacheControlHeader = apidocGenerateProperty();
    cacheControlHeader.key = 'Cache-Control';
    cacheControlHeader._valuePlaceholder = 'no-cache';
    cacheControlHeader.description = '<缓存控制指令>';
    cacheControlHeader._disableKey = true;
    cacheControlHeader._disableDescription = true;
    cacheControlHeader._disableKeyTip = '';
    cacheControlHeader._disableAdd = true;
    cacheControlHeader._disableDelete = true;
    defaultHeaders.value.push(cacheControlHeader);
  };

 // 添加请求头
 const addWebSocketHeader = (header?: Partial<ApidocProperty<'string'>>): void => {
   if (websocket.value) {
     const newHeader = apidocGenerateProperty();
     Object.assign(newHeader, header);
     websocket.value.item.headers.push(newHeader);
   }
 };

 // 删除请求头
 const deleteWebSocketHeaderByIndex = (index: number): void => {
   if (websocket.value && websocket.value.item.headers[index]) {
     websocket.value.item.headers.splice(index, 1);
   }
 };

 // 根据ID删除请求头
 const deleteWebSocketHeaderById = (id: string): void => {
   if (websocket.value) {
     const index = websocket.value.item.headers.findIndex(header => header._id === id);
     if (index !== -1) {
       websocket.value.item.headers.splice(index, 1);
     }
   }
 };
 // 根据ID更新请求头
 const updateWebSocketHeaderById = (id: string, header: Partial<ApidocProperty<'string'>>): void => {
   if (websocket.value) {
     const index = websocket.value.item.headers.findIndex(h => h._id === id);
     if (index !== -1) {
       Object.assign(websocket.value.item.headers[index], header);
     }
   }
 };
  /*
  |--------------------------------------------------------------------------
  | 查询参数操作方法
  |--------------------------------------------------------------------------
  */
  // 添加查询参数
  const addWebSocketQueryParam = (): void => {
    if (websocket.value) {
      const newQueryParam = apidocGenerateProperty();
      websocket.value.item.queryParams.push(newQueryParam);
    }
  };
  // 根据索引删除查询参数
  const deleteWebSocketQueryParamByIndex = (index: number): void => {
    if (websocket.value && websocket.value.item.queryParams[index]) {
      websocket.value.item.queryParams.splice(index, 1);
    }
  };
  // 根据ID删除查询参数
  const deleteWebSocketQueryParamById = (id: string): void => {
    if (websocket.value) {
      const index = websocket.value.item.queryParams.findIndex(param => param._id === id);
      if (index !== -1) {
        websocket.value.item.queryParams.splice(index, 1);
      }
    }
  };
  // 根据ID更新查询参数
  const updateWebSocketQueryParamById = (id: string, param: Partial<ApidocProperty<'string'>>): void => {
    if (websocket.value) {
      const index = websocket.value.item.queryParams.findIndex(p => p._id === id);
      if (index !== -1) {
        Object.assign(websocket.value.item.queryParams[index], param);
      }
    }
  };
  /*
  |--------------------------------------------------------------------------
  | 脚本操作方法
  |--------------------------------------------------------------------------
  */
  // 改变前置脚本
  const changeWebSocketPreRequest = (script: string): void => {
    if (websocket.value) {
      websocket.value.preRequest.raw = script;
    }
  };
  // 改变后置脚本
  const changeWebSocketAfterRequest = (script: string): void => {
    if (websocket.value) {
      websocket.value.afterRequest.raw = script;
    }
  };

  /*
  |--------------------------------------------------------------------------
  | 消息和心跳操作方法
  |--------------------------------------------------------------------------
  */
  // 改变发送消息内容
  const changeWebSocketMessage = (message: string): void => {
    if (websocket.value) {
      websocket.value.item.sendMessage = message;
    }
  };

  // 改变消息类型
  const changeWebSocketMessageType = (messageType: MessageType): void => {
    if (websocket.value) {
      websocket.value.config.messageType = messageType;
    }
  };

  // 改变自动心跳设置
  const changeWebSocketAutoHeartbeat = (enabled: boolean): void => {
    if (websocket.value) {
      websocket.value.config.autoHeartbeat = enabled;
    }
  };

  // 改变心跳间隔
  const changeWebSocketHeartbeatInterval = (interval: number): void => {
    if (websocket.value) {
      websocket.value.config.heartbeatInterval = interval;
    }
  };

  // 改变默认心跳内容
  const changeWebSocketDefaultHeartbeatContent = (content: string): void => {
    if (websocket.value) {
      websocket.value.config.defaultHeartbeatContent = content;
    }
  };


  // 改变自动重连设置
  const changeWebSocketAutoReconnect = (enabled: boolean): void => {
    if (websocket.value) {
      websocket.value.config.autoReconnect = enabled;
    }
  };

  // 改变最大重连次数
  const changeWebSocketMaxReconnectAttempts = (attempts: number): void => {
    if (websocket.value) {
      websocket.value.config.maxReconnectAttempts = attempts;
    }
  };

  // 改变重连间隔
  const changeWebSocketReconnectInterval = (interval: number): void => {
    if (websocket.value) {
      websocket.value.config.reconnectInterval = interval;
    }
  };

  /*
  |--------------------------------------------------------------------------
  | 连接状态操作方法
  |--------------------------------------------------------------------------
  */
  // 改变连接状态
  const changeConnectionState = (state: 'disconnected' | 'connecting' | 'connected' | 'error'): void => {
    connectionState.value = state;
  };

  // 改变连接ID
  const changeConnectionId = (id: string): void => {
    connectionId.value = id;
  };

  /*
  |--------------------------------------------------------------------------
  | 消息数据操作方法
  |--------------------------------------------------------------------------
  */
  // 添加消息到数组
  const addMessage = (message: WebsocketResponse): void => {
    responseMessage.value.push(message);
  };

  // 清空所有消息
  const clearMessages = (): void => {
    responseMessage.value = [];
  };

  // 根据ID删除消息
  const deleteMessageById = (messageId: string): void => {
    const index = responseMessage.value.findIndex(msg => msg.data.id === messageId);
    if (index !== -1) {
      responseMessage.value.splice(index, 1);
    }
  };

  // 根据类型筛选消息
  const getMessagesByType = (type: WebsocketResponse['type']): WebsocketResponse[] => {
    return responseMessage.value.filter(msg => msg.type === type);
  };

  // 获取最新的N条消息
  const getLatestMessages = (count: number): WebsocketResponse[] => {
    return responseMessage.value.slice(-count);
  };

  // 根据时间范围获取消息
  const getMessagesByTimeRange = (startTime: number, endTime: number): WebsocketResponse[] => {
    return responseMessage.value.filter(msg => {
      const timestamp = msg.data.timestamp;
      return timestamp >= startTime && timestamp <= endTime;
    });
  };

  /*
  |--------------------------------------------------------------------------
  | 消息模板
  |--------------------------------------------------------------------------
  */
  // 新增消息模板
  const addMessageTemplate = (template: WebsocketSendMessageTemplate): void => {
    sendMessageTemplateList.value.push(template);
  };

  // 更新消息模板
  const updateMessageTemplate = (id: string, updates: Partial<WebsocketSendMessageTemplate>): WebsocketSendMessageTemplate | null => {
    const index = sendMessageTemplateList.value.findIndex(template => template.id === id);
    if (index === -1) {
      console.warn(`消息模板 ID ${id} 不存在`);
      return null;
    }
    const updatedTemplate = {
      ...sendMessageTemplateList.value[index],
      ...updates,
      updatedAt: Date.now(),
    };
    sendMessageTemplateList.value[index] = updatedTemplate;
    return updatedTemplate;
  };

  // 删除消息模板
  const deleteMessageTemplate = (id: string): WebsocketSendMessageTemplate[] => {
    const index = sendMessageTemplateList.value.findIndex(template => template.id === id);
    if (index === -1) {
      console.warn(`消息模板 ID ${id} 不存在`);
      return sendMessageTemplateList.value;
    }
    sendMessageTemplateList.value.splice(index, 1);
    return sendMessageTemplateList.value;
  };

  // 根据 ID 获取消息模板
  const getMessageTemplateById = (id: string): WebsocketSendMessageTemplate | null => {
    return sendMessageTemplateList.value.find(template => template.id === id) || null;
  };

  // 获取所有消息模板
  const getAllMessageTemplates = (): WebsocketSendMessageTemplate[] => {
    return sendMessageTemplateList.value;
  };

  // 清空所有消息模板
  const clearAllMessageTemplates = (): void => {
    sendMessageTemplateList.value = [];
  };

  /*
  |--------------------------------------------------------------------------
  | 时间戳操作方法
  |--------------------------------------------------------------------------
  */
  // 标记为已删除
  const markWebSocketAsDeleted = (deleted: boolean = true): void => {
    if (websocket.value) {
      websocket.value.isDeleted = deleted;
    }
  };

  /*
  |--------------------------------------------------------------------------
  | 缓存操作方法
  |--------------------------------------------------------------------------
  */
  // 缓存当前websocket配置
  const cacheWebSocket = (): void => {
    if (websocket.value) {
      webSocketNodeCache.setWebSocketNode(websocket.value);
    }
  };

  // 从缓存获取websocket配置
  const getCachedWebSocket = (id: string): WebSocketNode | null => {
    return webSocketNodeCache.getWebSocketNode(id);
  };

  // 获取websocket连接状态缓存
  const getCachedConnectionState = (connectionId: string) => {
    return webSocketNodeCache.getWebSocketConnectionState(connectionId);
  };

  // 设置websocket连接状态缓存
  const setCachedConnectionState = (connectionId: string, state: {
    status: 'connecting' | 'connected' | 'disconnected' | 'error' | 'reconnecting';
    lastConnectedTime?: number;
    lastDisconnectedTime?: number;
    reconnectAttempts?: number;
  }) => {
    webSocketNodeCache.setWebSocketConnectionState(connectionId, state);
  };



  // 获取自动重连配置
  const getAutoReconnectConfig = (projectId: string) => {
    return webSocketNodeCache.getWebSocketAutoReconnectConfig(projectId);
  };

  // 设置自动重连配置
  const setAutoReconnectConfig = (projectId: string, config: {
    enabled: boolean;
    maxAttempts: number;
    delay: number;
    backoffFactor: number;
  }) => {
    webSocketNodeCache.setWebSocketAutoReconnectConfig(projectId, config);
  };
  const setResponseCacheLoading = (state: boolean) => {
    responseCacheLoading.value = state;
  }
  /*
  |--------------------------------------------------------------------------
  | 数据操作方法
  |--------------------------------------------------------------------------
  */
  // 重新赋值websocket数据
  const changeWebsocket = (payload: WebSocketNode): void => {
    // headers如果没有数据则默认添加一条空数据
    if (payload.item.headers.length === 0) {
      payload.item.headers.push(apidocGenerateProperty());
    }
    // queryParams如果没有数据则默认添加一条空数据
    if (payload.item.queryParams.length === 0) {
      payload.item.queryParams.push(apidocGenerateProperty());
    }
    // 初始化默认请求头
    initDefaultHeaders();
    websocket.value = payload;
    // 自动缓存websocket数据
    cacheWebSocket();
  };
  // 改变websocket原始缓存值
  const changeOriginWebsocket = (): void => {
    originWebsocket.value = cloneDeep(websocket.value);
  };
  // 改变websocket数据加载状态
  const changeWebsocketLoading = (state: boolean): void => {
    loading.value = state;
  };

  /*
  |--------------------------------------------------------------------------
  | 接口调用
  |--------------------------------------------------------------------------
  */
  // 获取WebSocket详情
  const getWebsocketDetail = async (payload: { id: string, projectId: string }): Promise<void> => {
    if (__STANDALONE__) {
      const doc = await standaloneCache.getDocById(payload.id) as WebSocketNode;
      if (!doc) {
        // 如果standalone中没有找到，尝试从缓存中获取
        const cachedWebSocket = getCachedWebSocket(payload.id);
        if (cachedWebSocket) {
          changeWebsocket(cachedWebSocket);
          changeOriginWebsocket();
          return;
        }
        
        ElMessageBox.confirm('当前WebSocket不存在，可能已经被删除!', '提示', {
          confirmButtonText: '关闭接口',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() => {
          // TODO: 删除tab的逻辑需要根据实际情况实现
          console.log('删除WebSocket tab');
        }).catch((err) => {
          if (err === 'cancel' || err === 'close') {
            return;
          }
          console.error(err);
        });
        return;
      }
      changeWebsocket(doc);
      changeOriginWebsocket();
      // 缓存到本地存储
      cacheWebSocket();
      return;
    } else {
      // 非standalone模式下尝试从缓存中获取
      const cachedWebSocket = getCachedWebSocket(payload.id);
      if (cachedWebSocket) {
        changeWebsocket(cachedWebSocket);
        changeOriginWebsocket();
        return;
      }
      console.log('getWebsocketDetail called but not in standalone mode and no cache found');
    }
  };

  /*
  |--------------------------------------------------------------------------
  | 保存WebSocket
  |--------------------------------------------------------------------------
  */
  // 保存WebSocket配置
  const saveWebsocket = async (): Promise<void> => {
    const { changeTabInfoById } = useApidocTas();
    const { changeWebsocketBannerInfoById } = useApidocBanner()
    const { tabs } = storeToRefs(useApidocTas())
    const projectId = router.currentRoute.value.query.id as string;
    const currentTabs = tabs.value[projectId];
    const currentSelectTab = currentTabs?.find((tab) => tab.selected) || null;
    if (!currentSelectTab) {
      console.warn('缺少tab信息');
      return;
    }
    saveLoading.value = true;
    if (__STANDALONE__) {
      const websocketDetail = cloneDeep(websocket.value);
      websocketDetail.updatedAt = new Date().toISOString();
      await standaloneCache.updateDoc(websocketDetail);
      //改变tab请求方法
      changeTabInfoById({
        id: currentSelectTab._id,
        field: 'head',
        value: {
          icon: websocketDetail.item.protocol,
          color: '',
        },
      })
      //改变banner请求方法
      changeWebsocketBannerInfoById({
        id: currentSelectTab._id,
        field: 'protocol',
        value: websocketDetail.item.protocol,
      })
      //改变origindoc的值
      changeOriginWebsocket();
      //改变tab未保存小圆点
      changeTabInfoById({
        id: currentSelectTab._id,
        field: 'saved',
        value: true,
      })
      cacheWebSocket();
      // 添加0.5秒的saveLoading效果
      setTimeout(() => {
        saveLoading.value = false;
      }, 100);
    } else {
      console.log('todo');
      cacheWebSocket();
      saveLoading.value = false;
    }
  };
  const getWebsocketFullUrl = debounce(async () => {
    websocketFullUrl.value = await getWebSocketUrl(websocket.value);
  }, 500, {
    leading: true,
  });
  watch([() => {
    return websocket.value;
  }, () => {
    return apidocVariableStore.objectVariable;
  }], () => {
    getWebsocketFullUrl()
  }, {
    deep: true,
    immediate: true
  })
  return {
    websocket,
    originWebsocket,
    loading,
    saveLoading,
    websocketFullUrl,
    defaultHeaders,
    connectionState,
    connectionId,
    responseMessage,
    sendMessageTemplateList,
    changeWebSocketName,
    changeWebSocketDescription,
    changeWebSocketProtocol,
    changeWebSocketPath,
    changeWebSocketPrefix,
    addWebSocketHeader,
    deleteWebSocketHeaderByIndex,
    deleteWebSocketHeaderById,
    updateWebSocketHeaderById,
    addWebSocketQueryParam,
    deleteWebSocketQueryParamByIndex,
    deleteWebSocketQueryParamById,
    updateWebSocketQueryParamById,
    changeWebSocketPreRequest,
    changeWebSocketAfterRequest,
    changeWebSocketMessage,
    changeWebSocketMessageType,
    changeWebSocketAutoHeartbeat,
    changeWebSocketHeartbeatInterval,
    changeWebSocketDefaultHeartbeatContent,
    changeWebSocketAutoReconnect,
    changeWebSocketMaxReconnectAttempts,
    changeWebSocketReconnectInterval,
    changeConnectionState,
    changeConnectionId,
    markWebSocketAsDeleted,
    changeWebsocket,
    changeOriginWebsocket,
    changeWebsocketLoading,
    getWebsocketDetail,
    saveWebsocket,
    // 消息相关方法
    addMessage,
    clearMessages,
    deleteMessageById,
    getMessagesByType,
    getLatestMessages,
    getMessagesByTimeRange,
    // 消息模板 CRUD 操作方法
    addMessageTemplate,
    updateMessageTemplate,
    deleteMessageTemplate,
    getMessageTemplateById,
    getAllMessageTemplates,
    clearAllMessageTemplates,
    // 缓存相关方法
    cacheWebSocket,
    getCachedWebSocket,
    getCachedConnectionState,
    setCachedConnectionState,
    getAutoReconnectConfig,
    setAutoReconnectConfig,
    responseCacheLoading,
    setResponseCacheLoading,
  }
})