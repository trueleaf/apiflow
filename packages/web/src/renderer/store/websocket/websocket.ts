import { WebSocketNode, WebsocketMessageType, WebsocketResponse, WebsocketSendMessageTemplate, WebsocketActiveTabType } from "@src/types/websocketNode";
import { defineStore, storeToRefs } from "pinia";
import { ref, watch } from "vue";
import { ApidocProperty } from "@src/types";
import { apidocGenerateProperty, generateEmptyWebsocketNode, uuid, cloneDeep, debounce } from "@/helper";
import { apiNodesCache } from "@/cache/index";
import { webSocketNodeCache } from "@/cache/websocketNode/websocketNodeCache.ts";
import { websocketTemplateCache } from "@/cache/websocketNode/websocketTemplateCache.ts";
import { ElMessageBox } from "element-plus";
import { useApidocTas } from "../apidoc/tabs.ts";
import { router } from "@/router/index.ts";
import { useApidocBanner } from "../apidoc/banner.ts";
import { getWebSocketUrl } from "@/server/request/request.ts";
import { useVariable } from "../apidoc/variables.ts";
import { useCookies } from "../apidoc/cookies.ts";
import { i18n } from "@/i18n";
import { webSocketHistoryCache } from "@/cache/websocketNode/websocketHistoryCache";
import { useRuntime } from '@/store/runtime/runtime';

export const useWebSocket = defineStore('websocket', () => {
  const runtimeStore = useRuntime();
  const apidocVariableStore = useVariable();
  const websocketCookies = useCookies();
  const isOffline = () => runtimeStore.networkMode === 'offline';
  const websocket = ref<WebSocketNode>(generateEmptyWebsocketNode(uuid()));
  const originWebsocket = ref<WebSocketNode>(generateEmptyWebsocketNode(uuid()));
  const loading = ref(false);
  const saveLoading = ref(false);
  const refreshLoading = ref(false);
  const responseCacheLoading = ref(false);
  const websocketFullUrl = ref('');
  const defaultHeaders = ref<ApidocProperty<"string">[]>([]);
  const connectionState = ref<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const connectionId = ref('');
  const responseMessage = ref<WebsocketResponse[]>([]);
  const sendMessageTemplateList = ref<WebsocketSendMessageTemplate[]>([]);
  const currentActiveTab = ref<WebsocketActiveTabType>('messageContent'); // 当前激活的模块
  const messageEditorRef = ref<{changeSilent: (value: boolean) => void} | null>(null); // 消息编辑器引用
  
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
      property.description = i18n.global.t('<发送时候自动计算>');
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
    if (!websocket.value) return;
    websocket.value.info.name = name;
  };

  // 改变websocket描述
  const changeWebSocketDescription = (description: string): void => {
    if (!websocket.value) return;
    websocket.value.info.description = description;
  };
  
  // 改变协议类型
  const changeWebSocketProtocol = (protocol: 'ws' | 'wss'): void => {
    if (!websocket.value) return;
    websocket.value.item.protocol = protocol;
  };
  
  // 改变请求路径
  const changeWebSocketPath = (path: string): void => {
    if (!websocket.value) return;
    websocket.value.item.url.path = path;
  };
  
  // 改变请求前缀
  const changeWebSocketPrefix = (prefix: string): void => {
    if (!websocket.value) return;
    websocket.value.item.url.prefix = prefix;
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
    // Host - 必需请求头，值可以覆盖
    const hostHeader = apidocGenerateProperty();
    hostHeader.key = "Host";
    hostHeader.description = i18n.global.t("<主机信息，WebSocket连接必需，值可覆盖>");
    hostHeader._disableKey = true;
    hostHeader._disableDelete = true;
    hostHeader._disableValue = true;
    hostHeader._valuePlaceholder = i18n.global.t("<自动生成>");
    hostHeader._disableDescription = true;
    defaultHeaders.value.push(hostHeader);
  
    //=========================================================================//
    // Upgrade - 必需请求头，值可以覆盖
    const upgradeHeader = apidocGenerateProperty();
    upgradeHeader.key = "Upgrade";
    upgradeHeader.value = "websocket";
    upgradeHeader.description = i18n.global.t("<升级协议，WebSocket必需，值可覆盖>");
    upgradeHeader._disableKey = true;
    upgradeHeader._disableDelete = true;
    defaultHeaders.value.push(upgradeHeader);
  
    //=========================================================================//
    // Connection - 必需请求头，值可以覆盖
    const connectionHeader = apidocGenerateProperty();
    connectionHeader.key = "Connection";
    connectionHeader.value = "Upgrade";
    connectionHeader.description = i18n.global.t("<保持连接升级，WebSocket必需，值可覆盖>");
    connectionHeader._disableKey = true;
    connectionHeader._disableDelete = true;
    defaultHeaders.value.push(connectionHeader);
  
    //=========================================================================//
    // Sec-WebSocket-Key - 必需请求头，值不可覆盖
    const secKeyHeader = apidocGenerateProperty();
    secKeyHeader.key = "Sec-WebSocket-Key";
    secKeyHeader._valuePlaceholder = i18n.global.t("<客户端自动生成随机Key>");
    secKeyHeader.description = i18n.global.t("<握手校验Key，客户端每次随机生成，值不可覆盖>");
    secKeyHeader._disableKey = true;
    secKeyHeader._disableValue = true;
    secKeyHeader._disableDelete = true;
    defaultHeaders.value.push(secKeyHeader);
  
    //=========================================================================//
    // Sec-WebSocket-Version - 必需请求头，值不可覆盖
    const secVersionHeader = apidocGenerateProperty();
    secVersionHeader.key = "Sec-WebSocket-Version";
    secVersionHeader.value = "13";
    secVersionHeader.description = i18n.global.t("<WebSocket协议版本，固定为13，值不可覆盖>");
    secVersionHeader._disableKey = true;
    secVersionHeader._disableValue = true;
    secVersionHeader._disableDelete = true;
    defaultHeaders.value.push(secVersionHeader);
  
    //=========================================================================//
    // Origin - 可选请求头，用于CORS验证
    // const originHeader = apidocGenerateProperty();
    // originHeader.key = "Origin";
    // originHeader.value = "";
    // originHeader.description = i18n.global.t("<源验证，用于CORS安全检查，可选>");
    // originHeader._disableKey = true;
    // originHeader.select = false; // 默认不选中
    // defaultHeaders.value.push(originHeader);
  
   
  };
  

// 添加请求头
const addWebSocketHeader = (header?: Partial<ApidocProperty<'string'>>): void => {
  if (!websocket.value) return;
  
  const newHeader = apidocGenerateProperty();
  Object.assign(newHeader, header);
  websocket.value.item.headers.push(newHeader);
};

// 删除请求头
const deleteWebSocketHeaderByIndex = (index: number): void => {
  if (!websocket.value || !websocket.value.item.headers[index]) return;
  websocket.value.item.headers.splice(index, 1);
};

// 根据ID删除请求头
const deleteWebSocketHeaderById = (id: string): void => {
  if (!websocket.value) return;
  
  const index = websocket.value.item.headers.findIndex(header => header._id === id);
  if (index === -1) return;
  
  websocket.value.item.headers.splice(index, 1);
};

// 根据ID更新请求头
const updateWebSocketHeaderById = (id: string, header: Partial<ApidocProperty<'string'>>): void => {
  if (!websocket.value) return;
  
  const index = websocket.value.item.headers.findIndex(h => h._id === id);
  if (index === -1) return;
  
  Object.assign(websocket.value.item.headers[index], header);
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
  // 批量更新查询参数
  const changeQueryParams = (params: ApidocProperty<'string'>[]): void => {
    if (!websocket.value) return;
    websocket.value.item.queryParams = params;
    // 如果没有数据则默认添加一条空数据
    if (websocket.value.item.queryParams.length === 0) {
      websocket.value.item.queryParams.push(apidocGenerateProperty());
    }
  };
  /*
  |--------------------------------------------------------------------------
  | 脚本操作方法
  |--------------------------------------------------------------------------
  */
  // 改变前置脚本
  const changeWebSocketPreRequest = (script: string): void => {
    if (!websocket.value) return;
    websocket.value.preRequest.raw = script;
  };
  
  // 改变后置脚本
  const changeWebSocketAfterRequest = (script: string): void => {
    if (!websocket.value) return;
    websocket.value.afterRequest.raw = script;
  };

  /*
  |--------------------------------------------------------------------------
  | 消息和自动发送操作方法
  |--------------------------------------------------------------------------
  */
  // 改变发送消息内容
  const changeWebSocketMessage = (message: string): void => {
    if (!websocket.value) return;
    websocket.value.item.sendMessage = message;
  };

  // 改变消息类型
  const changeWebSocketMessageType = (messageType: WebsocketMessageType): void => {
    if (websocket.value) {
      websocket.value.config.messageType = messageType;
    }
  };

  // 改变自动发送设置
  const changeWebSocketAutoSend = (enabled: boolean): void => {
    if (websocket.value) {
      websocket.value.config.autoSend = enabled;
    }
  };

  // 改变自动发送间隔
  const changeWebSocketAutoSendInterval = (interval: number): void => {
    if (websocket.value) {
      websocket.value.config.autoSendInterval = interval;
    }
  };

  // 改变默认自动发送内容
  const changeWebSocketDefaultAutoSendContent = (content: string): void => {
    if (websocket.value) {
      websocket.value.config.defaultAutoSendContent = content;
    }
  };


  // 改变自动重连设置
  const changeWebSocketAutoReconnect = (enabled: boolean): void => {
    if (websocket.value) {
      websocket.value.config.autoReconnect = enabled;
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

  // 替换所有消息
  const replaceMessages = (messages: WebsocketResponse[]): void => {
    responseMessage.value = messages;
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
    try {
      websocketTemplateCache.saveTemplate(template);
      sendMessageTemplateList.value.push(template);
    } catch (error) {
      console.error('添加消息模板失败:', error);
      throw error;
    }
  };

  // 更新消息模板
  const updateMessageTemplate = (id: string, updates: Partial<WebsocketSendMessageTemplate>): WebsocketSendMessageTemplate | null => {
    try {
      const success = websocketTemplateCache.updateTemplate(id, updates);
      if (!success) {
        console.warn(`消息模板 ID ${id} 不存在`);
        return null;
      }
      const index = sendMessageTemplateList.value.findIndex(template => template.id === id);
      if (index !== -1) {
        const updatedTemplate = {
          ...sendMessageTemplateList.value[index],
          ...updates,
          updatedAt: Date.now(),
        };
        sendMessageTemplateList.value[index] = updatedTemplate;
        return updatedTemplate;
      }
      return null;
    } catch (error) {
      console.error('更新消息模板失败:', error);
      return null;
    }
  };

  // 删除消息模板
  const deleteMessageTemplate = (id: string): boolean => {
    try {
      const success = websocketTemplateCache.deleteTemplate(id);
      if (success) {
        const index = sendMessageTemplateList.value.findIndex(template => template.id === id);
        if (index !== -1) {
          sendMessageTemplateList.value.splice(index, 1);
        }
      }
      return success;
    } catch (error) {
      console.error('删除消息模板失败:', error);
      return false;
    }
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
    try {
      websocketTemplateCache.clearAllTemplates();
      sendMessageTemplateList.value = [];
    } catch (error) {
      console.error('清空消息模板失败:', error);
    }
  };

  // 设置消息模板列表
  const setSendMessageTemplateList = (templates: WebsocketSendMessageTemplate[]): void => {
    sendMessageTemplateList.value = templates;
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

  const setResponseCacheLoading = (state: boolean) => {
    responseCacheLoading.value = state;
  };
  
  /**
   * 设置当前激活的模块
   */
  const setActiveTab = (moduleName: WebsocketActiveTabType): void => {
    currentActiveTab.value = moduleName;
  };

  /**
   * 改变消息编辑器引用
   */
  const changeMessageEditorRef = (ref: {changeSilent: (value: boolean) => void} | null): void => {
    messageEditorRef.value = ref;
  };
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
    if (isOffline()) {
      const doc = await apiNodesCache.getNodeById(payload.id) as WebSocketNode;
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
    let isSaved = currentSelectTab?.saved
    if (!currentSelectTab) {
      console.warn('缺少tab信息');
      return;
    }
    saveLoading.value = true;
    if (isOffline()) {
      const websocketDetail = cloneDeep(websocket.value);
      websocketDetail.updatedAt = new Date().toISOString();
      await apiNodesCache.updateNode(websocketDetail);
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
      if (!isSaved) {
        webSocketHistoryCache.addWsHistoryByNodeId(
          currentSelectTab._id,
          websocket.value
        );
      }
      // 添加0.5秒的saveLoading效果
      setTimeout(() => {
        saveLoading.value = false;
      }, 100);
    } else {
      console.log('todo');
      cacheWebSocket();
      // 只有当数据发生改变时才添加WebSocket历史记录
      if (!isSaved) {
        webSocketHistoryCache.addWsHistoryByNodeId(
          currentSelectTab._id,
          websocket.value
        );
      }
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
    changeQueryParams,
    changeWebSocketPreRequest,
    changeWebSocketAfterRequest,
    changeWebSocketMessage,
    changeWebSocketMessageType,
    changeWebSocketAutoSend,
    changeWebSocketAutoSendInterval,
    changeWebSocketDefaultAutoSendContent,
    changeWebSocketAutoReconnect,
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
    replaceMessages,
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
    setSendMessageTemplateList,
    // 缓存相关方法
    cacheWebSocket,
    getCachedWebSocket,
    responseCacheLoading,
    setResponseCacheLoading,
    refreshLoading,
    // 模块状态管理
    currentActiveTab,
    setActiveTab,
    // 消息编辑器引用
    messageEditorRef,
    changeMessageEditorRef,
  }
})