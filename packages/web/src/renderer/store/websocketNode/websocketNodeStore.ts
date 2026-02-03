import { WebSocketNode, WebsocketMessageType, WebsocketResponse, WebsocketActiveTabType, WebsocketMessageBlock } from "@src/types/websocketNode";
import { defineStore, storeToRefs } from "pinia";
import { ref, watch } from "vue";
import { ApidocProperty } from "@src/types";
import { generateEmptyProperty, generateEmptyWebsocketNode } from '@/helper';
import { nanoid } from 'nanoid/non-secure';
import { cloneDeep, debounce } from "lodash-es";
import { apiNodesCache } from "@/cache/nodes/nodesCache";
import { webSocketNodeCache } from "@/cache/websocketNode/websocketNodeCache.ts";
import { ClConfirm } from '@/components/ui/cleanDesign/clConfirm/ClConfirm2.ts';
import { useProjectNav } from "../projectWorkbench/projectNavStore.ts";
import { router } from "@/router/index.ts";
import { useBanner } from "../projectWorkbench/bannerStore.ts";
import { getWebSocketUrl } from "@/server/request/request.ts";
import { useVariable } from "../projectWorkbench/variablesStore.ts";
import { useCookies } from "../projectWorkbench/cookiesStore.ts";
import { i18n } from "@/i18n";
import { webSocketHistoryCache } from "@/cache/websocketNode/websocketHistoryCache";
import { useRuntime } from '@/store/runtime/runtimeStore';
import { logger } from '@/helper/logger';
import axios, { Canceler } from 'axios';
import { request as axiosInstance } from '@/api/api';
import { CommonResponse } from '@src/types';


export const useWebSocket = defineStore('websocket', () => {
  const runtimeStore = useRuntime();
  const apidocVariableStore = useVariable();
  const websocketCookies = useCookies();
  const isOffline = () => runtimeStore.networkMode === 'offline';
  const websocket = ref<WebSocketNode>(generateEmptyWebsocketNode(nanoid()));
  const originWebsocket = ref<WebSocketNode>(generateEmptyWebsocketNode(nanoid()));
  const loading = ref(false);
  const saveLoading = ref(false);
  const refreshLoading = ref(false);
  const responseCacheLoading = ref(false);
  const websocketFullUrl = ref('');
  const defaultHeaders = ref<ApidocProperty<"string">[]>([]);
  const connectionState = ref<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const connectionId = ref('');
  const responseMessage = ref<WebsocketResponse[]>([]);
  const currentActiveTab = ref<WebsocketActiveTabType>('messageContent'); // 当前激活的模块
  const messageEditorRef = ref<{changeSilent: (value: boolean) => void} | null>(null); // 消息编辑器引用
  const cancel: Canceler[] = []; // 请求取消函数数组
  
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
    const property: ApidocProperty<'string'> = generateEmptyProperty();
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
    const hostHeader = generateEmptyProperty();
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
    const upgradeHeader = generateEmptyProperty();
    upgradeHeader.key = "Upgrade";
    upgradeHeader.value = "websocket";
    upgradeHeader.description = i18n.global.t("<升级协议，WebSocket必需，值可覆盖>");
    upgradeHeader._disableKey = true;
    upgradeHeader._disableDelete = true;
    defaultHeaders.value.push(upgradeHeader);
  
    //=========================================================================//
    // Connection - 必需请求头，值可以覆盖
    const connectionHeader = generateEmptyProperty();
    connectionHeader.key = "Connection";
    connectionHeader.value = "Upgrade";
    connectionHeader.description = i18n.global.t("<保持连接升级，WebSocket必需，值可覆盖>");
    connectionHeader._disableKey = true;
    connectionHeader._disableDelete = true;
    defaultHeaders.value.push(connectionHeader);
  
    //=========================================================================//
    // Sec-WebSocket-Key - 必需请求头，值不可覆盖
    const secKeyHeader = generateEmptyProperty();
    secKeyHeader.key = "Sec-WebSocket-Key";
    secKeyHeader._valuePlaceholder = i18n.global.t("<客户端自动生成随机Key>");
    secKeyHeader.description = i18n.global.t("<握手校验Key，客户端每次随机生成，值不可覆盖>");
    secKeyHeader._disableKey = true;
    secKeyHeader._disableValue = true;
    secKeyHeader._disableDelete = true;
    defaultHeaders.value.push(secKeyHeader);
  
    //=========================================================================//
    // Sec-WebSocket-Version - 必需请求头，值不可覆盖
    const secVersionHeader = generateEmptyProperty();
    secVersionHeader.key = "Sec-WebSocket-Version";
    secVersionHeader.value = "13";
    secVersionHeader.description = i18n.global.t("<WebSocket协议版本，固定为13，值不可覆盖>");
    secVersionHeader._disableKey = true;
    secVersionHeader._disableValue = true;
    secVersionHeader._disableDelete = true;
    defaultHeaders.value.push(secVersionHeader);
  
    //=========================================================================//
    // Origin - 可选请求头，用于CORS验证
    // const originHeader = generateEmptyProperty();
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
    
    const newHeader = generateEmptyProperty();
    Object.assign(newHeader, header);
    websocket.value.item.headers.push(newHeader);
  };
  /*
  |--------------------------------------------------------------------------
  | 查询参数操作方法
  |--------------------------------------------------------------------------
  */
  // 添加查询参数
  const addWebSocketQueryParam = (): void => {
    if (websocket.value) {
      const newQueryParam = generateEmptyProperty();
      websocket.value.item.queryParams.push(newQueryParam);
    }
  };
  // 批量更新查询参数
  const changeQueryParams = (params: ApidocProperty<'string'>[]): void => {
    if (!websocket.value) return;
    websocket.value.item.queryParams = cloneDeep(params);
    // 如果没有数据则默认添加一条空数据
    if (websocket.value.item.queryParams.length === 0) {
      websocket.value.item.queryParams.push(generateEmptyProperty());
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
  | 消息块操作方法
  |--------------------------------------------------------------------------
  */
  // 添加消息块
  const addMessageBlock = (block?: Partial<WebsocketMessageBlock>): string => {
    if (!websocket.value) return '';
    const newBlock: WebsocketMessageBlock = {
      id: nanoid(),
      name: block?.name || '',
      content: block?.content || '',
      messageType: block?.messageType || 'json',
      order: block?.order ?? websocket.value.item.messageBlocks.length,
    };
    websocket.value.item.messageBlocks.push(newBlock);
    return newBlock.id;
  };
  // 删除消息块
  const deleteMessageBlockById = (id: string): void => {
    if (!websocket.value) return;
    const index = websocket.value.item.messageBlocks.findIndex(block => block.id === id);
    if (index !== -1) {
      websocket.value.item.messageBlocks.splice(index, 1);
      // 重新排序
      websocket.value.item.messageBlocks.forEach((block, i) => {
        block.order = i;
      });
    }
  };
  // 更新消息块
  const updateMessageBlockById = (id: string, updates: Partial<WebsocketMessageBlock>): void => {
    if (!websocket.value) return;
    const block = websocket.value.item.messageBlocks.find(b => b.id === id);
    if (block) {
      Object.assign(block, updates);
    }
  };
  // 获取消息块
  const getMessageBlockById = (id: string): WebsocketMessageBlock | undefined => {
    return websocket.value?.item.messageBlocks.find(block => block.id === id);
  };
  // 更新消息块排序
  const updateMessageBlocksOrder = (blocks: WebsocketMessageBlock[]): void => {
    if (!websocket.value) return;
    websocket.value.item.messageBlocks = blocks.map((block, index) => ({
      ...block,
      order: index,
    }));
  };
  // 设置消息块列表（用于撤销/还原）
  const setMessageBlocks = (blocks: WebsocketMessageBlock[]): void => {
    if (!websocket.value) return;
    websocket.value.item.messageBlocks = cloneDeep(blocks);
  };

  /*
  |--------------------------------------------------------------------------
  | 自动发送操作方法
  |--------------------------------------------------------------------------
  */
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
  // 改变自动发送内容
  const changeWebSocketAutoSendContent = (content: string): void => {
    if (websocket.value) {
      websocket.value.config.autoSendContent = content;
    }
  };
  // 改变自动发送消息类型
  const changeWebSocketAutoSendMessageType = (messageType: WebsocketMessageType): void => {
    if (websocket.value) {
      websocket.value.config.autoSendMessageType = messageType;
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

  /*
  |--------------------------------------------------------------------------
  | 时间戳操作方法
  |--------------------------------------------------------------------------
  */

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
  // 设置当前激活的模块
  const setActiveTab = (moduleName: WebsocketActiveTabType): void => {
    currentActiveTab.value = moduleName;
  };
  // 改变消息编辑器引用
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
      payload.item.headers.push(generateEmptyProperty());
    }
    // queryParams如果没有数据则默认添加一条空数据
    if (payload.item.queryParams.length === 0) {
      payload.item.queryParams.push(generateEmptyProperty());
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
    const { deleteNavByIds } = useProjectNav();
    
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
        
        ClConfirm({
          content: i18n.global.t('当前 WebSocket 不存在，可能已经被删除'),
          title: i18n.global.t('提示'),
          confirmButtonText: i18n.global.t('关闭接口'),
          cancelButtonText: i18n.global.t('取消'),
          type: 'warning',
        }).then(() => {
          deleteNavByIds({
            projectId: payload.projectId,
            ids: [payload.id]
          });
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
    }

    // 在线模式：从服务器获取数据
    if (cancel.length > 0) {
      cancel.forEach((c) => {
        c('取消请求');
      });
    }
    return new Promise((resolve, reject) => {
      loading.value = true;
      const params = {
        projectId: payload.projectId,
        _id: payload.id,
      };
      axiosInstance.get<CommonResponse<WebSocketNode>, CommonResponse<WebSocketNode>>('/api/project/doc_detail', {
        params,
        cancelToken: new axios.CancelToken((c) => {
          cancel.push(c);
        }),
      }).then((res) => {
        if (res.data === null) {
          ClConfirm({
            content: i18n.global.t('当前 WebSocket 不存在，可能已经被删除'),
            title: i18n.global.t('提示'),
            confirmButtonText: i18n.global.t('关闭接口'),
            cancelButtonText: i18n.global.t('取消'),
            type: 'warning',
          }).then(() => {
            deleteNavByIds({
              projectId: payload.projectId,
              ids: [payload.id]
            });
          }).catch((err) => {
            if (err === 'cancel' || err === 'close') {
              return;
            }
            console.error(err);
          });
          return;
        }
        changeWebsocket(res.data);
        changeOriginWebsocket();
        cacheWebSocket();
        resolve();
      }).catch((err) => {
        console.error(err);
        reject(err);
      }).finally(() => {
        loading.value = false;
      });
    });
  };

  /*
  |--------------------------------------------------------------------------
  | 保存WebSocket
  |--------------------------------------------------------------------------
  */
  // 保存WebSocket配置
  const saveWebsocket = async (): Promise<void> => {
    const { changeNavInfoById } = useProjectNav();
    const { changeWebsocketBannerInfoById } = useBanner()
    const { navs } = storeToRefs(useProjectNav())
    const projectId = router.currentRoute.value.query.id as string;
    const currentNavs = navs.value[projectId];
    const currentSelectNav = currentNavs?.find((nav) => nav.selected) || null;
    let isSaved = currentSelectNav?.saved
    if (!currentSelectNav) {
      logger.warn('缺少nav信息');
      return;
    }
    saveLoading.value = true;
    if (isOffline()) {
      const websocketDetail = cloneDeep(websocket.value);
      websocketDetail.updatedAt = new Date().toISOString();
      await apiNodesCache.replaceNode(websocketDetail);
      //改变nav请求方法
      changeNavInfoById({
        id: currentSelectNav._id,
        field: 'head',
        value: {
          icon: websocketDetail.item.protocol,
          color: '',
        },
      })
      //改变banner请求方法
      changeWebsocketBannerInfoById({
        id: currentSelectNav._id,
        field: 'protocol',
        value: websocketDetail.item.protocol,
      })
      //改变origindoc的值
      changeOriginWebsocket();
      //改变nav未保存小圆点
      changeNavInfoById({
        id: currentSelectNav._id,
        field: 'saved',
        value: true,
      })
      cacheWebSocket();
      if (!isSaved) {
        webSocketHistoryCache.addWsHistoryByNodeId(
          currentSelectNav._id,
          websocket.value
        );
      }
      // 添加0.5秒的saveLoading效果
      setTimeout(() => {
        saveLoading.value = false;
      }, 100);
    } else {
      // 在线模式保存
      const websocketDetail = cloneDeep(websocket.value);
      const params = {
        _id: currentSelectNav._id,
        projectId,
        info: {
          type: 'websocket' as const,
          name: websocketDetail.info.name,
          description: websocketDetail.info.description,
        },
        websocketItem: {
          item: websocketDetail.item,
          config: websocketDetail.config,
          preRequest: websocketDetail.preRequest,
          afterRequest: websocketDetail.afterRequest,
        },
      };

      axiosInstance.post('/api/project/fill_doc', params).then(() => {
        // 改变nav请求方法
        changeNavInfoById({
          id: currentSelectNav._id,
          field: 'head',
          value: {
            icon: websocketDetail.item.protocol,
            color: '',
          },
        });
        // 改变banner请求方法
        changeWebsocketBannerInfoById({
          id: currentSelectNav._id,
          field: 'protocol',
          value: websocketDetail.item.protocol,
        });
        // 改变origindoc的值
        changeOriginWebsocket();
        // 改变nav未保存小圆点
        changeNavInfoById({
          id: currentSelectNav._id,
          field: 'saved',
          value: true,
        });
        cacheWebSocket();
        // 只有当数据发生改变时才添加WebSocket历史记录
        if (!isSaved) {
          webSocketHistoryCache.addWsHistoryByNodeId(
            currentSelectNav._id,
            websocket.value
          );
        }
      }).catch((err) => {
        // 改变nav未保存小圆点
        changeNavInfoById({
          id: currentSelectNav._id,
          field: 'saved',
          value: false,
        });
        console.error(err);
      }).finally(() => {
        saveLoading.value = false;
      });
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
    changeWebSocketName,
    changeWebSocketDescription,
    changeWebSocketProtocol,
    changeWebSocketPath,
    changeWebSocketPrefix,
    addWebSocketHeader,
    addWebSocketQueryParam,
    changeQueryParams,
    changeWebSocketPreRequest,
    changeWebSocketAfterRequest,
    // 消息块操作方法
    addMessageBlock,
    deleteMessageBlockById,
    updateMessageBlockById,
    getMessageBlockById,
    updateMessageBlocksOrder,
    setMessageBlocks,
    // 自动发送方法
    changeWebSocketAutoSend,
    changeWebSocketAutoSendInterval,
    changeWebSocketAutoSendContent,
    changeWebSocketAutoSendMessageType,
    changeConnectionState,
    changeConnectionId,
    changeWebsocket,
    changeOriginWebsocket,
    changeWebsocketLoading,
    getWebsocketDetail,
    saveWebsocket,
    // 响应消息相关方法
    addMessage,
    replaceMessages,
    clearMessages,
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
