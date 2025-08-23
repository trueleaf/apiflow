import { WebSocketNode } from "@src/types/websocket/websocket.ts";
import { defineStore } from "pinia";
import { ref } from "vue";
import { ApidocProperty } from "@src/types";
import { apidocGenerateProperty, generateEmptyWebsocketNode, uuid, cloneDeep } from "@/helper";
import { standaloneCache } from "@/cache/standalone.ts";
import { ElMessageBox } from "element-plus";

export const useWebSocket = defineStore('websocket', () => {
  const websocket = ref<WebSocketNode>(generateEmptyWebsocketNode(uuid()));
  const originWebsocket = ref<WebSocketNode>(generateEmptyWebsocketNode(uuid()));
  const loading = ref(false);
  const saveLoading = ref(false);
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
  | 数据操作方法
  |--------------------------------------------------------------------------
  */
  // 重新赋值websocket数据
  const changeWebsocket = (payload: WebSocketNode): void => {
    // headers如果没有数据则默认添加一条空数据
    if (payload.item.headers.length === 0) {
      payload.item.headers.push(apidocGenerateProperty());
    }
    websocket.value = payload;
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
      console.log(123, doc)
      changeWebsocket(doc);
      changeOriginWebsocket();
      return;
    } else {
      // 非standalone模式下暂时只打印日志
      console.log('getWebsocketDetail called but not in standalone mode');
    }
  };

  /*
  |--------------------------------------------------------------------------
  | 保存WebSocket
  |--------------------------------------------------------------------------
  */
  // 保存WebSocket配置
  const saveWebsocket = async (): Promise<void> => {
    saveLoading.value = true;
    if (__STANDALONE__) {
      const websocketDetail = cloneDeep(websocket.value);
      websocketDetail.updatedAt = new Date().toISOString();
      await standaloneCache.updateDoc(websocketDetail);
    } else {
      console.log('todo');
    }
    saveLoading.value = false;
  };

  return {
    websocket,
    originWebsocket,
    loading,
    saveLoading,
    changeWebSocketName,
    changeWebSocketDescription,
    changeWebSocketProtocol,
    changeWebSocketPath,
    changeWebSocketPrefix,
    addWebSocketHeader,
    deleteWebSocketHeaderByIndex,
    deleteWebSocketHeaderById,
    updateWebSocketHeaderById,
    changeWebSocketPreRequest,
    changeWebSocketAfterRequest,
    markWebSocketAsDeleted,
    changeWebsocket,
    changeOriginWebsocket,
    changeWebsocketLoading,
    getWebsocketDetail,
    saveWebsocket,
  }
})