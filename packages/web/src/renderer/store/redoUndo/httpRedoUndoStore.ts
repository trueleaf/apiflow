import { defineStore } from "pinia";
import { ref } from "vue";
import type {
  HttpRedoUnDoOperation
} from "@src/types/redoUndo/httpRedoUndo";
import type { ApidocProperty, HttpNodeRequestMethod } from "@src/types";
import type { HttpNode } from "@src/types/httpNode/httpNode";
import type { HttpNodeBodyRawType } from "@src/types/httpNode/types";
import { useHttpNode } from "@/store/httpNode/httpNodeStore";
import { cloneDeep } from "lodash-es";
import { httpRedoUndoCache } from "@/cache/redoUndo/httpRedoUndoCache";
import { logger } from '@/helper/logger';

// 自定义响应类型用于撤销重做操作
type RedoUndoResponse = {
  code: number;
  msg: string;
  operation?: HttpRedoUnDoOperation;
};

export const useHttpRedoUndo = defineStore('httpRedoUndo', () => {
  const httpRedoList = ref<Record<string, HttpRedoUnDoOperation[]>>({});
  const httpUndoList = ref<Record<string, HttpRedoUnDoOperation[]>>({});
  const httpNodeStore = useHttpNode();
  const pathOperationMergeMs = 250;
  /**
   * 记录操作
   */
  const recordOperation = (operation: HttpRedoUnDoOperation): void => {
    const nodeId = operation.nodeId;
    if (!httpUndoList.value[nodeId]) {
      httpUndoList.value[nodeId] = [];
    }
    const lastOperation = httpUndoList.value[nodeId].at(-1);
    if (
      operation.type === 'pathOperation' &&
      lastOperation?.type === 'pathOperation' &&
      operation.operationName === lastOperation.operationName &&
      operation.affectedModuleName === lastOperation.affectedModuleName &&
      operation.timestamp - lastOperation.timestamp <= pathOperationMergeMs
    ) {
      lastOperation.newValue = operation.newValue;
      lastOperation.timestamp = operation.timestamp;
      httpRedoList.value[nodeId] = [];
      httpRedoUndoCache.setRedoUndoListByNodeId(nodeId, httpRedoList.value[nodeId], httpUndoList.value[nodeId]);
      return;
    }
    httpUndoList.value[nodeId].push(operation);
    httpRedoList.value[nodeId] = []; // 清空redo列表

    const maxHistoryLength = 100; // 默认最大历史记录长度
    if (httpUndoList.value[nodeId].length > maxHistoryLength) {
      httpUndoList.value[nodeId] = httpUndoList.value[nodeId].slice(-maxHistoryLength);
    }
    // 同步到cache
    httpRedoUndoCache.setRedoUndoListByNodeId(nodeId, httpRedoList.value[nodeId], httpUndoList.value[nodeId]);
  };

  /**
   * 撤销操作
   */
  const httpUndo = (nodeId: string): RedoUndoResponse => {
    const undoList = httpUndoList.value[nodeId];
    if (!undoList || undoList.length === 0) {
      return { code: 1, msg: '没有可撤销的操作' };
    }
    const operation = undoList.pop()!;
    try {
      applyOperation(operation, "undo");
      if (!httpRedoList.value[nodeId]) {
        httpRedoList.value[nodeId] = [];
      }
      httpRedoList.value[nodeId].push(operation);

      // 同步到cache
      httpRedoUndoCache.setRedoUndoListByNodeId(nodeId, httpRedoList.value[nodeId], httpUndoList.value[nodeId]);
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
  const httpRedo = (nodeId: string): RedoUndoResponse => {
    const redoList = httpRedoList.value[nodeId];
    if (!redoList || redoList.length === 0) {
      return { code: 1, msg: '没有可重做的操作' };
    }
    const operation = redoList.pop()!;
    try {
      applyOperation(operation, "redo");
      if (!httpUndoList.value[nodeId]) {
        httpUndoList.value[nodeId] = [];
      }
      httpUndoList.value[nodeId].push(operation);

      // 同步到cache
      httpRedoUndoCache.setRedoUndoListByNodeId(nodeId, httpRedoList.value[nodeId], httpUndoList.value[nodeId]);
      return { code: 0, msg: '重做成功', operation };
    } catch (error) {
      logger.error('重做操作失败', { error });
      redoList.push(operation); // 回滚
      return { code: 1, msg: '重做操作失败' };
    }
  };

  /**
   * 应用操作到HTTP store
   */
  const applyOperation = (operation: HttpRedoUnDoOperation, operationType: "redo" | "undo"): void => {
    const targetValue = operationType === "undo" ? operation.oldValue : operation.newValue;

    switch (operation.type) {
      case 'methodOperation':
        httpNodeStore.changeHttpNodeMethod(targetValue as HttpNodeRequestMethod);
        break;

      case 'prefixOperation':
        httpNodeStore.changeHttpNodePrefix(targetValue as string);
        break;

      case 'pathOperation':
        httpNodeStore.changeHttpNodeUrl(targetValue as string);
        break;

      case 'headersOperation':
        httpNodeStore.httpNodeInfo.item.headers = cloneDeep(targetValue as ApidocProperty<'string'>[]);
        break;

      case 'queryParamsOperation':
        httpNodeStore.httpNodeInfo.item.queryParams = cloneDeep(targetValue as ApidocProperty<'string'>[]);
        break;

      case 'pathsOperation':
        httpNodeStore.changePathParams(cloneDeep(targetValue as ApidocProperty<'string'>[]));
        break;

      case 'bodyOperation':
        {
          const bodyValue = targetValue as {
            requestBody: HttpNode['item']['requestBody'];
            contentType: HttpNode['item']['contentType'];
          };
          httpNodeStore.httpNodeInfo.item.requestBody = cloneDeep(bodyValue.requestBody);
          httpNodeStore.changeContentType(bodyValue.contentType);
        }
        break;

      case 'rawJsonOperation':
        httpNodeStore.changeRawJson(targetValue as string);
        break;

      case 'rawDataOperation':
        {
          const rawDataValue = targetValue as { data: string; dataType: HttpNodeBodyRawType };
          httpNodeStore.changeBodyRawValue(rawDataValue.data);
          httpNodeStore.changeBodyRawType(rawDataValue.dataType);
        }
        break;

      case 'preRequestOperation':
        httpNodeStore.httpNodeInfo.preRequest = cloneDeep(targetValue as HttpNode['preRequest']);
        break;

      case 'afterRequestOperation':
        httpNodeStore.httpNodeInfo.afterRequest = cloneDeep(targetValue as HttpNode['afterRequest']);
        break;

      case 'basicInfoOperation':
        {
          const info = targetValue as { name: string; description: string };
          if (info.name !== undefined) {
            httpNodeStore.changeHttpNodeName(info.name);
          }
          if (info.description !== undefined) {
            httpNodeStore.changeDescription(info.description);
          }
        }
        break;

      case 'responseParamsOperation':
        httpNodeStore.httpNodeInfo.item.responseParams = cloneDeep(targetValue as HttpNode['item']['responseParams']);
        break;

      case 'remarksOperation':
        {
          const remarksValue = targetValue as { description: string };
          httpNodeStore.changeDescription(remarksValue.description);
        }
        break;

      default:
        logger.warn('未知的操作类型', { type: (operation as { type: string }).type });
    }
  };

  /**
   * 从缓存初始化指定节点的数据
   */
  const initFromCache = (nodeId: string): void => {
    const cacheData = httpRedoUndoCache.getRedoUndoListByNodeId(nodeId);
    httpUndoList.value[nodeId] = cacheData.undoList;
    httpRedoList.value[nodeId] = cacheData.redoList;
  };

  /**
   * 清除指定节点的redoList和undoList
   */
  const clearRedoUndoListByNodeId = (nodeId: string): void => {
    httpRedoList.value[nodeId] = [];
    httpUndoList.value[nodeId] = [];
    httpRedoUndoCache.setRedoUndoListByNodeId(nodeId, [], []);
  };

  return {
    httpRedoList,
    httpUndoList,
    recordOperation,
    httpUndo,
    httpRedo,
    initFromCache,
    clearRedoUndoListByNodeId
  };
});
