import { defineStore } from "pinia";
import { ref } from "vue";
import type {
  HttpRedoUnDoOperation
} from "@src/types/redoUndo/httpRedoUndo";
import type { ApidocProperty, HttpNodeRequestMethod } from "@src/types";
import type { HttpNode } from "@src/types/httpNode";
import { useApidoc } from "@/store/share/apidocStore";
import { cloneDeep } from "lodash-es";
import { httpRedoUndoCache } from "@/cache/redoUndo/httpRedoUndoCache";
import { logger } from '@/helper';

// 自定义响应类型用于撤销重做操作
type RedoUndoResponse = {
  code: number;
  msg: string;
  operation?: HttpRedoUnDoOperation;
};

export const useHttpRedoUndo = defineStore('httpRedoUndo', () => {
  const httpRedoList = ref<Record<string, HttpRedoUnDoOperation[]>>({});
  const httpUndoList = ref<Record<string, HttpRedoUnDoOperation[]>>({});
  const apidocStore = useApidoc();
  /**
   * 记录操作
   */
  const recordOperation = (operation: HttpRedoUnDoOperation): void => {
    const nodeId = operation.nodeId;
    if (!httpUndoList.value[nodeId]) {
      httpUndoList.value[nodeId] = [];
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
        apidocStore.changeApidocMethod(targetValue as HttpNodeRequestMethod);
        break;

      case 'prefixOperation':
        apidocStore.changeApidocPrefix(targetValue as string);
        break;

      case 'pathOperation':
        apidocStore.changeApidocUrl(targetValue as string);
        break;

      case 'headersOperation':
        apidocStore.apidoc.item.headers = cloneDeep(targetValue as ApidocProperty<'string'>[]);
        break;

      case 'queryParamsOperation':
        apidocStore.apidoc.item.queryParams = cloneDeep(targetValue as ApidocProperty<'string'>[]);
        break;

      case 'pathsOperation':
        apidocStore.changePathParams(cloneDeep(targetValue as ApidocProperty<'string'>[]));
        break;

      case 'bodyOperation':
        {
          const bodyValue = targetValue as {
            requestBody: HttpNode['item']['requestBody'];
            contentType: HttpNode['item']['contentType'];
          };
          apidocStore.apidoc.item.requestBody = cloneDeep(bodyValue.requestBody);
          apidocStore.changeContentType(bodyValue.contentType);
        }
        break;

      case 'rawJsonOperation':
        apidocStore.changeRawJson(targetValue as string);
        break;

      case 'preRequestOperation':
        apidocStore.apidoc.preRequest = cloneDeep(targetValue as HttpNode['preRequest']);
        break;

      case 'afterRequestOperation':
        apidocStore.apidoc.afterRequest = cloneDeep(targetValue as HttpNode['afterRequest']);
        break;

      case 'basicInfoOperation':
        {
          const info = targetValue as { name: string; description: string };
          if (info.name !== undefined) {
            apidocStore.changeApidocName(info.name);
          }
          if (info.description !== undefined) {
            apidocStore.changeDescription(info.description);
          }
        }
        break;

      case 'responseParamsOperation':
        apidocStore.apidoc.item.responseParams = cloneDeep(targetValue as HttpNode['item']['responseParams']);
        break;

      default:
        logger.warn('未知的操作类型', { type: (operation as any).type });
    }
  };

  /**
   * 从缓存初始化指定节点的数据
   */
  const initFromCache = (nodeId: string): void => {
    const cacheData = httpRedoUndoCache.getRedoUndoListByNodeId(nodeId);
    if (cacheData) {
      httpUndoList.value[nodeId] = cacheData.undoList;
      httpRedoList.value[nodeId] = cacheData.redoList;
    } else {
      httpUndoList.value[nodeId] = [];
      httpRedoList.value[nodeId] = [];
    }
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
