import { WebSocket } from 'ws';
import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { fileTypeFromBuffer } from 'file-type';

/**
 * WebSocket连接管理类
 */
export class WebSocketManager {
  private connections: Map<string, WebSocket> = new Map();
  private connectionIds: Set<string> = new Set();
  private nodeIdToConnectionId: Map<string, string> = new Map(); // 节点ID到连接ID的映射
  private connectionId = 0;

  constructor() {
    this.registerIpcHandlers();
  }

  /**
   * 注册IPC处理程序
   */
  private registerIpcHandlers() {
    // 连接WebSocket
    ipcMain.handle('websocket-connect', async (event: IpcMainInvokeEvent, url: string, nodeId: string) => {
      return this.connect(url, nodeId, event);
    });

    // 断开WebSocket连接
    ipcMain.handle('websocket-disconnect', async (_: IpcMainInvokeEvent, connectionId: string) => {
      return this.disconnect(connectionId);
    });

    // 发送WebSocket消息
    ipcMain.handle('websocket-send', async (_: IpcMainInvokeEvent, connectionId: string, message: string) => {
      return this.sendMessage(connectionId, message);
    });

    // 获取连接状态
    ipcMain.handle('websocket-get-state', async (_: IpcMainInvokeEvent, connectionId: string) => {
      return this.getConnectionState(connectionId);
    });

    // 获取所有连接
    ipcMain.handle('websocket-get-all-connections', async () => {
      return this.getAllConnections();
    });

    // 获取所有连接ID
    ipcMain.handle('websocket-get-connection-ids', async () => {
      return this.getConnectionIds();
    });

    // 检查节点ID是否有活跃连接
    ipcMain.handle('websocket-check-node-connection', async (_: IpcMainInvokeEvent, nodeId: string) => {
      return this.checkNodeConnection(nodeId);
    });

    // 清空所有WebSocket连接
    ipcMain.handle('websocket-clear-all-connections', async () => {
      return this.clearAllConnections();
    });

    // 断开指定节点的连接
    ipcMain.handle('websocket-disconnect-by-node', async (_: IpcMainInvokeEvent, nodeId: string) => {
      return this.disconnectByNode(nodeId);
    });
  }

  /**
   * 连接到WebSocket服务器
   * @param url WebSocket服务器URL
   * @param nodeId 节点ID，用于标识连接
   * @param event IPC事件对象，用于向渲染进程发送消息
   * @returns 连接ID
   */
  async connect(url: string, nodeId: string, event: IpcMainInvokeEvent): Promise<{ success: boolean; connectionId?: string; error?: string }> {
    try {
      // 如果该节点已有连接，先断开旧连接
      const existingConnectionId = this.nodeIdToConnectionId.get(nodeId);
      if (existingConnectionId) {
        await this.disconnect(existingConnectionId);
      }

      const connectionId = `ws_${++this.connectionId}`;
      const ws = new WebSocket(url);

      // 连接打开事件
      ws.on('open', () => {
        // 自动添加到连接ID集合
        this.connectionIds.add(connectionId);
        // 建立节点ID到连接ID的映射
        this.nodeIdToConnectionId.set(nodeId, connectionId);
        event.sender.send('websocket-opened', { connectionId, nodeId, url });
      });

      // 接收消息事件
      ws.on('message', async (data) => {
        let mimeType = 'application/octet-stream';
        let contentType: 'text' | 'binary' = 'binary';
        
        // 将 data 转换为 Buffer 以便进行 mime 类型检测
        const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data as ArrayBuffer);
        
        try {
          // 使用 file-type 检测文件类型
          const fileType = await fileTypeFromBuffer(buffer);
          if (fileType) {
            mimeType = fileType.mime;
            contentType = 'binary';
          } else {
            // 如果无法检测到文件类型，尝试作为文本处理
            const text = buffer.toString('utf8');
            
            // 检查是否为有效的 UTF-8 文本
            if (/^[\x20-\x7E\s\u4e00-\u9fff]*$/.test(text)) {
              contentType = 'text';
              
              // 根据文本内容判断具体的 MIME 类型
              try {
                JSON.parse(text);
                mimeType = 'application/json';
              } catch {
                if (text.trim().startsWith('<') && text.trim().endsWith('>')) {
                  mimeType = 'text/xml';
                } else {
                  mimeType = 'text/plain';
                }
              }
            }
          }
        } catch (error) {
          console.warn('MIME类型检测失败:', error);
          // 检测失败时尝试文本解析
          try {
            const text = buffer.toString('utf8');
            if (/^[\x20-\x7E\s\u4e00-\u9fff]*$/.test(text)) {
              contentType = 'text';
              mimeType = 'text/plain';
            }
          } catch {
            // 完全无法解析，保持为二进制
          }
        }
        
        event.sender.send('websocket-message', { 
          connectionId, 
          nodeId, 
          message: buffer, 
          mimeType, 
          contentType,
          url 
        });
      });

      // 连接关闭事件
      ws.on('close', (code, reason) => {
        this.connections.delete(connectionId);
        this.connectionIds.delete(connectionId);
        this.nodeIdToConnectionId.delete(nodeId);
        event.sender.send('websocket-closed', { connectionId, nodeId, code, reason: reason.toString(), url });
      });

      // 连接错误事件
      ws.on('error', (error) => {
        console.error(`WebSocket连接错误 [${connectionId}]:`, error);
        this.connections.delete(connectionId);
        this.connectionIds.delete(connectionId);
        this.nodeIdToConnectionId.delete(nodeId);
        event.sender.send('websocket-error', { connectionId, nodeId, error: error.message, url });
      });
      // 保存连接
      this.connections.set(connectionId, ws);
      return { success: true, connectionId };
    } catch (error) {
      console.error('WebSocket连接失败:', error);
      return { success: false, error: error instanceof Error ? error.message : '未知错误' };
    }
  }

  /**
   * 断开WebSocket连接
   * @param connectionId 连接ID
   */
  async disconnect(connectionId: string): Promise<{ success: boolean; error?: string }> {
    console.log('主进程断开websocket连接')

    try {
      const ws = this.connections.get(connectionId);
      if (!ws) {
        return { success: false, error: '连接不存在' };
      }

      // 找到对应的节点ID并清理映射
      let nodeIdToRemove: string | undefined;
      for (const [nodeId, connId] of this.nodeIdToConnectionId.entries()) {
        if (connId === connectionId) {
          nodeIdToRemove = nodeId;
          break;
        }
      }
      if (nodeIdToRemove) {
        this.nodeIdToConnectionId.delete(nodeIdToRemove);
      }

      ws.close();
      this.connections.delete(connectionId);
      // 自动从连接ID集合中移除
      this.connectionIds.delete(connectionId);
      return { success: true };
    } catch (error) {
      console.error('断开WebSocket连接失败:', error);
      return { success: false, error: error instanceof Error ? error.message : '未知错误' };
    }
  }

  /**
   * 发送消息
   * @param connectionId 连接ID
   * @param message 消息内容
   */
  async sendMessage(connectionId: string, message: string): Promise<{ success: boolean; error?: string }> {
    try {
      const ws = this.connections.get(connectionId);
      if (!ws) {
        return { success: false, error: '连接不存在' };
      }

      if (ws.readyState !== WebSocket.OPEN) {
        return { success: false, error: '连接未打开' };
      }

      ws.send(message);
      return { success: true };
    } catch (error) {
      console.error('发送WebSocket消息失败:', error);
      return { success: false, error: error instanceof Error ? error.message : '未知错误' };
    }
  }

  /**
   * 获取连接状态
   * @param connectionId 连接ID
   */
  async getConnectionState(connectionId: string): Promise<{ state?: number; error?: string }> {
    const ws = this.connections.get(connectionId);
    if (!ws) {
      return { error: '连接不存在' };
    }
    return { state: ws.readyState };
  }

  /**
   * 获取所有连接信息
   */
  async getAllConnections(): Promise<{ connectionId: string; state: number }[]> {
    const connections: { connectionId: string; state: number }[] = [];
    this.connections.forEach((ws, connectionId) => {
      connections.push({ connectionId, state: ws.readyState });
    });
    return connections;
  }

  /**
   * 获取所有连接ID
   */
  async getConnectionIds(): Promise<string[]> {
    return Array.from(this.connectionIds);
  }

  /**
   * 检查节点是否有活跃的WebSocket连接
   * @param nodeId 节点ID
   */
  async checkNodeConnection(nodeId: string): Promise<{ 
    connected: boolean; 
    connectionId?: string; 
    state?: number;
  }> {
    const connectionId = this.nodeIdToConnectionId.get(nodeId);
    if (!connectionId) {
      return { connected: false };
    }

    const ws = this.connections.get(connectionId);
    if (!ws) {
      // 连接记录不一致，清理映射
      this.nodeIdToConnectionId.delete(nodeId);
      this.connectionIds.delete(connectionId);
      return { connected: false };
    }

    return {
      connected: ws.readyState === WebSocket.OPEN,
      connectionId,
      state: ws.readyState
    };
  }

  /**
   * 清空所有WebSocket连接
   */
  async clearAllConnections(): Promise<{ success: boolean; closedCount: number; error?: string }> {
    try {
      let closedCount = 0;
      const connectionsToClose = Array.from(this.connections.entries());
      
      for (const [connectionId, ws] of connectionsToClose) {
        try {
          if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
            ws.close();
            closedCount++;
          }
        } catch (error) {
          console.error(`关闭WebSocket连接失败 [${connectionId}]:`, error);
        }
      }
      // 清理所有状态
      this.connections.clear();
      this.connectionIds.clear();
      this.nodeIdToConnectionId.clear();
      return { success: true, closedCount };
    } catch (error) {
      console.error('清空WebSocket连接失败:', error);
      return { success: false, closedCount: 0, error: error instanceof Error ? error.message : '未知错误' };
    }
  }

  /**
   * 根据节点ID断开连接
   * @param nodeId 节点ID
   */
  async disconnectByNode(nodeId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const connectionId = this.nodeIdToConnectionId.get(nodeId);
      if (!connectionId) {
        return { success: false, error: '该节点没有活跃连接' };
      }

      return await this.disconnect(connectionId);
    } catch (error) {
      console.error('根据节点ID断开连接失败:', error);
      return { success: false, error: error instanceof Error ? error.message : '未知错误' };
    }
  }

  /**
   * 清理所有连接
   */
  cleanup() {
    this.connections.forEach((ws, connectionId) => {
      try {
        ws.close();
      } catch (error) {
        console.error(`清理WebSocket连接失败 [${connectionId}]:`, error);
      }
    });
    this.connections.clear();
    this.connectionIds.clear();
    this.nodeIdToConnectionId.clear();
  }
}

// 创建WebSocket管理器实例
export const webSocketManager = new WebSocketManager();