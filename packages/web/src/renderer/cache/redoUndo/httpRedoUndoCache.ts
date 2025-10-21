import type {
  HttpRedoUnDoOperation
} from "@src/types/redoUndo/httpRedoUndo";

/**
 * HTTP RedoUndo缓存管理类
 * 负责sessionStorage存储HTTP redo/undo数据
 */
export class HttpRedoUndoCache {
  private readonly storagePrefix = 'redoUndo/http/';
  // 获取指定节点的redo/undo数据
  getRedoUndoListByNodeId(nodeId: string): {
    redoList: HttpRedoUnDoOperation[];
    undoList: HttpRedoUnDoOperation[];
  } | null {
    try {
      const key = this.getStorageKey(nodeId);
      const data = sessionStorage.getItem(key);
      if (!data) return null;

      const parsed = JSON.parse(data);
      return {
        redoList: parsed.redoList || [],
        undoList: parsed.undoList || []
      };
    } catch (error) {
      console.error('获取RedoUndo缓存数据失败:', error);
      return null;
    }
  }
  // 设置指定节点的redo/undo数据
  setRedoUndoListByNodeId(nodeId: string, redoList: HttpRedoUnDoOperation[], undoList: HttpRedoUnDoOperation[]): boolean {
    try {
      const data = {
        redoList,
        undoList,
        lastUpdated: Date.now()
      };

      const key = this.getStorageKey(nodeId);
      sessionStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('保存RedoUndo缓存数据失败:', error);
      return false;
    }
  }
  // 获取存储键名
  private getStorageKey(nodeId: string): string {
    return `${this.storagePrefix}${nodeId}`;
  }

}

// 导出单例实例
export const httpRedoUndoCache = new HttpRedoUndoCache();
