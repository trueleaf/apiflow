import { debounce } from "lodash";
import type { WsRedoUnDoOperation } from "@src/types/redoUndo";
import { useRedoUndo } from "@/store/redoUndo/redoUndo";
import i18next from "i18next";

/**
 * 操作记录装饰器
 * 用于自动记录WebSocket相关操作
 */
export function withOperationRecord<T extends (...args: any[]) => any>(
  originalFn: T,
  createOperation: (...args: Parameters<T>) => WsRedoUnDoOperation | null
): T {
  return ((...args: Parameters<T>) => {
    const redoUndoStore = useRedoUndo();
    
    // 执行原始函数
    const result = originalFn(...args);
    
    // 创建操作记录
    const operation = createOperation(...args);
    if (operation) {
      redoUndoStore.recordOperation(operation);
    }
    
    return result;
  }) as T;
}

/**
 * 防抖操作记录装饰器
 * 用于合并连续的相同类型操作
 */
export function withDebouncedOperationRecord<T extends (...args: any[]) => any>(
  originalFn: T,
  createOperation: (...args: Parameters<T>) => WsRedoUnDoOperation | null,
  delay: number = 300
): T {
  const redoUndoStore = useRedoUndo();
  let lastOperation: WsRedoUnDoOperation | null = null;
  
  const debouncedRecord = debounce((operation: WsRedoUnDoOperation) => {
    redoUndoStore.recordOperation(operation);
    lastOperation = null;
  }, delay);
  
  return ((...args: Parameters<T>) => {
    // 执行原始函数
    const result = originalFn(...args);
    
    // 创建操作记录
    const operation = createOperation(...args);
    if (operation) {
      // 如果是相同类型的操作，更新现有操作的newValue
      if (lastOperation && 
          lastOperation.type === operation.type && 
          lastOperation.nodeId === operation.nodeId) {
        lastOperation.newValue = operation.newValue;
        lastOperation.timestamp = operation.timestamp;
      } else {
        lastOperation = operation;
      }
      
      debouncedRecord(lastOperation);
    }
    
    return result;
  }) as T;
}

/**
 * 深度比较两个值是否相等
 */
export function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  
  if (a == null || b == null) return a === b;
  
  if (typeof a !== typeof b) return false;
  
  if (typeof a !== 'object') return a === b;
  
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  
  if (keysA.length !== keysB.length) return false;
  
  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }
  
  return true;
}

/**
 * 检查两个值是否不同（用于确定是否需要记录操作）
 */
export function hasChanged(oldValue: any, newValue: any): boolean {
  return !deepEqual(oldValue, newValue);
}

/**
 * 创建操作记录的工厂函数
 */
export class OperationFactory {
  /**
   * 创建协议操作记录
   */
  static createProtocolOperation(
    nodeId: string,
    oldValue: 'ws' | 'wss',
    newValue: 'ws' | 'wss'
  ): WsRedoUnDoOperation | null {
    if (!hasChanged(oldValue, newValue)) return null;
    
    return {
      nodeId,
      type: 'protocolOperation',
      operationName: i18next.t('修改协议'),
      affectedModuleName: 'operation',
      oldValue,
      newValue,
      timestamp: Date.now()
    };
  }

  /**
   * 创建URL操作记录
   */
  static createUrlOperation(
    nodeId: string,
    oldValue: string,
    newValue: string,
    isPath: boolean = true
  ): WsRedoUnDoOperation | null {
    if (!hasChanged(oldValue, newValue)) return null;
    
    return {
      nodeId,
      type: 'urlOperation',
      operationName: isPath ? i18next.t('修改请求路径') : i18next.t('修改请求前缀'),
      affectedModuleName: 'operation',
      oldValue,
      newValue,
      timestamp: Date.now()
    };
  }

  /**
   * 创建请求头操作记录
   */
  static createHeadersOperation(
    nodeId: string,
    oldValue: any[],
    newValue: any[],
    actionType: 'add' | 'update' | 'delete' | 'reorder' = 'update'
  ): WsRedoUnDoOperation | null {
    if (!hasChanged(oldValue, newValue)) return null;
    
    const operationNames = {
      add: i18next.t('添加请求头'),
      update: i18next.t('修改请求头'),
      delete: i18next.t('删除请求头'),
      reorder: i18next.t('调整请求头顺序')
    };
    
    return {
      nodeId,
      type: 'headersOperation',
      operationName: operationNames[actionType],
      affectedModuleName: 'headers',
      oldValue,
      newValue,
      timestamp: Date.now()
    };
  }

  /**
   * 创建查询参数操作记录
   */
  static createQueryParamsOperation(
    nodeId: string,
    oldValue: any[],
    newValue: any[],
    actionType: 'add' | 'update' | 'delete' | 'reorder' = 'update'
  ): WsRedoUnDoOperation | null {
    if (!hasChanged(oldValue, newValue)) return null;
    
    const operationNames = {
      add: i18next.t('添加查询参数'),
      update: i18next.t('修改查询参数'),
      delete: i18next.t('删除查询参数'),
      reorder: i18next.t('调整查询参数顺序')
    };
    
    return {
      nodeId,
      type: 'queryParamsOperation',
      operationName: operationNames[actionType],
      affectedModuleName: 'params',
      oldValue,
      newValue,
      timestamp: Date.now()
    };
  }

  /**
   * 创建发送消息操作记录
   */
  static createSendMessageOperation(
    nodeId: string,
    oldValue: string,
    newValue: string
  ): WsRedoUnDoOperation | null {
    if (!hasChanged(oldValue, newValue)) return null;
    
    return {
      nodeId,
      type: 'sendMessageOperation',
      operationName: i18next.t('修改发送消息'),
      affectedModuleName: 'messageContent',
      oldValue,
      newValue,
      timestamp: Date.now()
    };
  }

  /**
   * 创建配置操作记录
   */
  static createConfigOperation(
    nodeId: string,
    oldValue: any,
    newValue: any
  ): WsRedoUnDoOperation | null {
    if (!hasChanged(oldValue, newValue)) return null;
    
    return {
      nodeId,
      type: 'configOperation',
      operationName: i18next.t('修改连接配置'),
      affectedModuleName: 'config',
      oldValue,
      newValue,
      timestamp: Date.now()
    };
  }

  /**
   * 创建前置脚本操作记录
   */
  static createPreRequestOperation(
    nodeId: string,
    oldValue: any,
    newValue: any
  ): WsRedoUnDoOperation | null {
    if (!hasChanged(oldValue, newValue)) return null;
    
    return {
      nodeId,
      type: 'preRequestOperation',
      operationName: i18next.t('修改前置脚本'),
      affectedModuleName: 'preScript',
      oldValue,
      newValue,
      timestamp: Date.now()
    };
  }

  /**
   * 创建后置脚本操作记录
   */
  static createAfterRequestOperation(
    nodeId: string,
    oldValue: any,
    newValue: any
  ): WsRedoUnDoOperation | null {
    if (!hasChanged(oldValue, newValue)) return null;
    
    return {
      nodeId,
      type: 'afterRequestOperation',
      operationName: i18next.t('修改后置脚本'),
      affectedModuleName: 'afterScript',
      oldValue,
      newValue,
      timestamp: Date.now()
    };
  }

  /**
   * 创建基本信息操作记录
   */
  static createBasicInfoOperation(
    nodeId: string,
    oldValue: { name?: string; description?: string },
    newValue: { name?: string; description?: string },
    fieldType: 'name' | 'description' | 'both' = 'both'
  ): WsRedoUnDoOperation | null {
    if (!hasChanged(oldValue, newValue)) return null;
    
    const operationNames = {
      name: i18next.t('修改接口名称'),
      description: i18next.t('修改接口描述'),
      both: i18next.t('修改基本信息')
    };
    
    return {
      nodeId,
      type: 'basicInfoOperation',
      operationName: operationNames[fieldType],
      affectedModuleName: 'remarks',
      oldValue: {
        name: oldValue.name || '',
        description: oldValue.description || ''
      },
      newValue: {
        name: newValue.name || '',
        description: newValue.description || ''
      },
      timestamp: Date.now()
    };
  }
}

/**
 * 操作历史管理器
 */
export class OperationHistoryManager {
  private static maxHistoryLength = 50;
  
  /**
   * 限制历史记录长度
   */
  static limitHistoryLength<T>(list: T[], maxLength: number = this.maxHistoryLength): T[] {
    if (list.length <= maxLength) return list;
    return list.slice(-maxLength);
  }
  
  /**
   * 清理过期操作记录
   */
  static cleanupExpiredOperations(
    operations: WsRedoUnDoOperation[], 
    maxAgeMs: number = 24 * 60 * 60 * 1000 // 默认24小时
  ): WsRedoUnDoOperation[] {
    const cutoffTime = Date.now() - maxAgeMs;
    return operations.filter(op => op.timestamp > cutoffTime);
  }
  
  /**
   * 合并相似操作
   * 暂时简化实现，直接返回原数组
   */
  static mergeSimilarOperations(operations: WsRedoUnDoOperation[]): WsRedoUnDoOperation[] {
    // TODO: 实现更复杂的合并逻辑，需要考虑不同操作类型的兼容性
    return operations;
  }
}

/**
 * 快捷键处理器
 */
export class ShortcutHandler {
  private static isListening = false;
  
  /**
   * 注册快捷键监听
   */
  static registerShortcuts(
    onUndo: () => void,
    onRedo: () => void
  ): () => void {
    if (this.isListening) return () => {};
    
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+Z 或 Cmd+Z (撤销)
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        onUndo();
        return;
      }
      
      // Ctrl+Y 或 Cmd+Shift+Z (重做)
      if (((event.ctrlKey || event.metaKey) && event.key === 'y') ||
          ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'z')) {
        event.preventDefault();
        onRedo();
        return;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    this.isListening = true;
    
    // 返回清理函数
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      this.isListening = false;
    };
  }
}

/**
 * 状态快照工具
 */
export class StateSnapshot {
  /**
   * 创建WebSocket状态快照
   */
  static createWebSocketSnapshot(websocket: any): any {
    return {
      protocol: websocket.item.protocol,
      url: {
        path: websocket.item.url.path,
        prefix: websocket.item.url.prefix
      },
      headers: websocket.item.headers.map((h: any) => ({ ...h })),
      queryParams: websocket.item.queryParams.map((p: any) => ({ ...p })),
      sendMessage: websocket.item.sendMessage,
      config: { ...websocket.config },
      preRequest: { ...websocket.preRequest },
      afterRequest: { ...websocket.afterRequest },
      info: {
        name: websocket.info.name,
        description: websocket.info.description
      }
    };
  }
  
  /**
   * 比较两个快照的差异
   */
  static compareSnapshots(oldSnapshot: any, newSnapshot: any): string[] {
    const differences: string[] = [];
    
    if (oldSnapshot.protocol !== newSnapshot.protocol) {
      differences.push('protocol');
    }
    
    if (oldSnapshot.url.path !== newSnapshot.url.path) {
      differences.push('url.path');
    }
    
    if (oldSnapshot.url.prefix !== newSnapshot.url.prefix) {
      differences.push('url.prefix');
    }
    
    if (!deepEqual(oldSnapshot.headers, newSnapshot.headers)) {
      differences.push('headers');
    }
    
    if (!deepEqual(oldSnapshot.queryParams, newSnapshot.queryParams)) {
      differences.push('queryParams');
    }
    
    if (oldSnapshot.sendMessage !== newSnapshot.sendMessage) {
      differences.push('sendMessage');
    }
    
    if (!deepEqual(oldSnapshot.config, newSnapshot.config)) {
      differences.push('config');
    }
    
    if (!deepEqual(oldSnapshot.preRequest, newSnapshot.preRequest)) {
      differences.push('preRequest');
    }
    
    if (!deepEqual(oldSnapshot.afterRequest, newSnapshot.afterRequest)) {
      differences.push('afterRequest');
    }
    
    if (oldSnapshot.info.name !== newSnapshot.info.name) {
      differences.push('info.name');
    }
    
    if (oldSnapshot.info.description !== newSnapshot.info.description) {
      differences.push('info.description');
    }
    
    return differences;
  }
}
