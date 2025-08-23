import { WebSocketNode } from "@src/types/websocket/websocket.ts";
import { defineStore } from "pinia";
import { ref } from "vue";
import { ApidocProperty } from "@src/types";
import { apidocGenerateProperty, generateEmptyWebsocketNode, uuid } from "@/helper";

export const useWebSocket = defineStore('websocket', () => {
  const websocket = ref<WebSocketNode>(generateEmptyWebsocketNode(uuid()));
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

  // 更新创建时间
  const updateWebSocketCreatedAt = (timestamp?: string): void => {
    if (websocket.value) {
      websocket.value.createdAt = timestamp || new Date().toISOString();
    }
  };

  // 更新修改时间
  const updateWebSocketUpdatedAt = (timestamp?: string): void => {
    if (websocket.value) {
      websocket.value.updatedAt = timestamp || new Date().toISOString();
    }
  };

  // 标记为已删除
  const markWebSocketAsDeleted = (deleted: boolean = true): void => {
    if (websocket.value) {
      websocket.value.isDeleted = deleted;
    }
  };

  return {
    websocket,
    // 信息操作
    changeWebSocketName,
    changeWebSocketDescription,
    // 连接操作
    changeWebSocketProtocol,
    changeWebSocketPath,
    changeWebSocketPrefix,
    // Headers操作
    addWebSocketHeader,
    deleteWebSocketHeaderByIndex,
    deleteWebSocketHeaderById,
    updateWebSocketHeaderById,
    // 脚本操作
    changeWebSocketPreRequest,
    changeWebSocketAfterRequest,
    // 时间戳操作
    updateWebSocketCreatedAt,
    updateWebSocketUpdatedAt,
    markWebSocketAsDeleted,
  }
})