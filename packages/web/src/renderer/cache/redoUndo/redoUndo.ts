import type { 
  WsRedoUnDoOperation
} from "@src/types/redoUndo";

/**
 * RedoUndo缓存管理类
 * 负责sessionStorage存储redo/undo数据
 */
export class RedoUndoCache {
  private readonly storagePrefix = 'redoUndo_';

  /**
   * 获取指定节点的redo/undo数据
   */
  getRedoUndoListByNodeId(nodeId: string): {
    redoList: WsRedoUnDoOperation[];
    undoList: WsRedoUnDoOperation[];
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

  /**
   * 设置指定节点的redo/undo数据
   */
  setRedoUndoListByNodeId(nodeId: string, redoList: WsRedoUnDoOperation[], undoList: WsRedoUnDoOperation[]): boolean {
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

  /**
   * 获取所有节点的redo/undo数据
   */
  getRedoUndoList(): Record<string, {
    redoList: WsRedoUnDoOperation[];
    undoList: WsRedoUnDoOperation[];
  }> {
    try {
      const allKeys = this.getAllStorageKeys();
      const allData: Record<string, {
        redoList: WsRedoUnDoOperation[];
        undoList: WsRedoUnDoOperation[];
      }> = {};
      
      for (const key of allKeys) {
        const data = sessionStorage.getItem(key);
        if (data) {
          const nodeId = key.replace(this.storagePrefix, '');
          const parsed = JSON.parse(data);
          allData[nodeId] = {
            redoList: parsed.redoList || [],
            undoList: parsed.undoList || []
          };
        }
      }
      
      return allData;
    } catch (error) {
      console.error('获取所有RedoUndo缓存数据失败:', error);
      return {};
    }
  }

  /**
   * 清空所有节点的redo/undo数据
   */
  clearRedoUndoList(): boolean {
    try {
      const allKeys = this.getAllStorageKeys();
      for (const key of allKeys) {
        sessionStorage.removeItem(key);
      }
      return true;
    } catch (error) {
      console.error('清空所有RedoUndo数据失败:', error);
      return false;
    }
  }

  // 私有方法

  /**
   * 获取存储键名
   */
  private getStorageKey(nodeId: string): string {
    return `${this.storagePrefix}${nodeId}`;
  }

  /**
   * 获取所有RedoUndo相关的存储键名
   */
  private getAllStorageKeys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(this.storagePrefix)) {
        keys.push(key);
      }
    }
    return keys;
  }

}

// 导出单例实例
export const redoUndoCache = new RedoUndoCache();
