import { defineStore } from "pinia";
import { ref } from "vue";
import type {
  WsRedoUnDoOperation
} from "@src/types/redoUndo/wsRedoUndo";
import type { ApidocProperty } from "@src/types";
import type { WebSocketNode } from "@src/types/websocketNode";
import { useWebSocket } from "@/store/websocketNode/websocketNodeStore";
import { cloneDeep } from "lodash-es";
import { wsRedoUndoCache } from "@/cache/redoUndo/wsRedoUndoCache";
import { logger } from '@/helper/logger';

// 自定义响应类型用于撤销重做操作
type RedoUndoResponse = {
  code: number;
  msg: string;
  operation?: WsRedoUnDoOperation;
};

export const useWsRedoUndo = defineStore('wsRedoUndo', () => {
  const wsRedoList = ref<Record<string, WsRedoUnDoOperation[]>>({});
  const wsUndoList = ref<Record<string, WsRedoUnDoOperation[]>>({});
  const websocketStore = useWebSocket();
  /*
  |--------------------------------------------------------------------------
  | 操作记录方法
  |--------------------------------------------------------------------------
  */
  
  /**
   * 记录操作
   */
  const recordOperation = (operation: WsRedoUnDoOperation): void => {
    const nodeId = operation.nodeId;
    if (!wsUndoList.value[nodeId]) {
      wsUndoList.value[nodeId] = [];
    }
    wsUndoList.value[nodeId].push(operation);
    wsRedoList.value[nodeId] = []; // 清空redo列表
    
    const maxHistoryLength = 100; // 默认最大历史记录长度
    if (wsUndoList.value[nodeId].length > maxHistoryLength) {
      wsUndoList.value[nodeId] = wsUndoList.value[nodeId].slice(-maxHistoryLength);
    }
    
    // 同步到cache
    wsRedoUndoCache.setRedoUndoListByNodeId(nodeId, wsRedoList.value[nodeId], wsUndoList.value[nodeId]);
  };

  /**
   * 撤销操作
   */
  const wsUndo = (nodeId: string): RedoUndoResponse => {
    const undoList = wsUndoList.value[nodeId];
    if (!undoList || undoList.length === 0) {
      return { code: 1, msg: '没有可撤销的操作' };
    }
    const operation = undoList.pop()!;
    try {
      applyOperation(operation, "undo");
      if (!wsRedoList.value[nodeId]) {
        wsRedoList.value[nodeId] = [];
      }
      wsRedoList.value[nodeId].push(operation);

      // 同步到cache
      wsRedoUndoCache.setRedoUndoListByNodeId(nodeId, wsRedoList.value[nodeId], wsUndoList.value[nodeId]);
      return { code: 0, msg: '撤销成功', operation };
    } catch (error) {
      logger.error('撤销操作失败', { error });
      undoList.push(operation); // 回滚
      return { code: 1, msg: '撤销操作失败' };
    }
  };

  /**
   * 重做操作
   */
  const wsRedo = (nodeId: string): RedoUndoResponse => {
    const redoList = wsRedoList.value[nodeId];
    if (!redoList || redoList.length === 0) {
      return { code: 1, msg: '没有可重做的操作' };
    }
    const operation = redoList.pop()!;
    try {
      applyOperation(operation, "redo");
      if (!wsUndoList.value[nodeId]) {
        wsUndoList.value[nodeId] = [];
      }
      wsUndoList.value[nodeId].push(operation);

      // 同步到cache
      wsRedoUndoCache.setRedoUndoListByNodeId(nodeId, wsRedoList.value[nodeId], wsUndoList.value[nodeId]);
      return { code: 0, msg: '重做成功', operation };
    } catch (error) {
      logger.error('重做操作失败', { error });
      redoList.push(operation); // 回滚
      return { code: 1, msg: '重做操作失败' };
    }
  };

  /*
  |--------------------------------------------------------------------------
  | 辅助方法
  |--------------------------------------------------------------------------
  */
  
  /**
   * 应用操作到WebSocket store
   */
  const applyOperation = (operation: WsRedoUnDoOperation, operationType: "redo" | "undo"): void => {
    const targetValue = operationType === "undo" ? operation.oldValue : operation.newValue;
    
    switch (operation.type) {
      case 'protocolOperation':
        websocketStore.changeWebSocketProtocol(targetValue as 'ws' | 'wss');
        break;
        
      case 'urlOperation':
        // URL操作仅改变path字段
        websocketStore.changeWebSocketPath(targetValue as string);
        break;
        
      case 'headersOperation':
        websocketStore.websocket.item.headers = cloneDeep(targetValue as ApidocProperty<'string'>[]);
        break;
        
      case 'queryParamsOperation':
        websocketStore.changeQueryParams(cloneDeep(targetValue as ApidocProperty<'string'>[]));
        break;
        
      case 'sendMessageOperation':
        // 消息块的 undo/redo 暂不支持，跳过
        break;
        
      case 'configOperation':
        websocketStore.websocket.config = cloneDeep(targetValue as WebSocketNode['config']);
        break;
        
      case 'preRequestOperation':
        websocketStore.websocket.preRequest = cloneDeep(targetValue as WebSocketNode['preRequest']);
        break;
        
      case 'afterRequestOperation':
        websocketStore.websocket.afterRequest = cloneDeep(targetValue as WebSocketNode['afterRequest']);
        break;
        
      case 'basicInfoOperation':
        const info = targetValue as { name?: string; description?: string };
        if (info.name !== undefined) {
          websocketStore.changeWebSocketName(info.name);
        }
        if (info.description !== undefined) {
          websocketStore.changeWebSocketDescription(info.description);
        }
        break;
        
      default:
        logger.warn('未知的操作类型', { type: (operation as any).type });
    }
  };



  /**
   * 从缓存初始化指定节点的数据
   */
  const initFromCache = (nodeId: string): void => {
    const cacheData = wsRedoUndoCache.getRedoUndoListByNodeId(nodeId);
    wsUndoList.value[nodeId] = cacheData.undoList;
    wsRedoList.value[nodeId] = cacheData.redoList;
  };

  /**
   * 清除指定节点的redoList和undoList
   */
  const clearRedoUndoListByNodeId = (nodeId: string): void => {
    wsRedoList.value[nodeId] = [];
    wsUndoList.value[nodeId] = [];
    wsRedoUndoCache.setRedoUndoListByNodeId(nodeId, [], []);
  };


  return {
    wsRedoList,
    wsUndoList,
    recordOperation,
    wsUndo,
    wsRedo,
    initFromCache,
    clearRedoUndoListByNodeId
  };
});
