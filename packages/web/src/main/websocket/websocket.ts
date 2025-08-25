import { WebSocket } from 'ws';
import { ipcMain, IpcMainInvokeEvent } from 'electron';

/**
 * WebSocket连接管理类
 */
export class WebSocketManager {
  private connections: Map<string, WebSocket> = new Map();
  private connectionId = 0;

  constructor() {
    this.registerIpcHandlers();
  }

  /**
   * 注册IPC处理程序
   */
  private registerIpcHandlers() {
    // 连接WebSocket
    ipcMain.handle('websocket-connect', async (event: IpcMainInvokeEvent, url: string) => {
      return this.connect(url, event);
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
  }

  /**
   * 连接到WebSocket服务器
   * @param url WebSocket服务器URL
   * @param event IPC事件对象，用于向渲染进程发送消息
   * @returns 连接ID
   */
  async connect(url: string, event: IpcMainInvokeEvent): Promise<{ success: boolean; connectionId?: string; error?: string }> {
    try {
      const connectionId = `ws_${++this.connectionId}`;
      const ws = new WebSocket(url);

      // 连接打开事件
      ws.on('open', () => {
        console.log(`WebSocket连接已建立: ${url}`);
        event.sender.send('websocket-opened', { connectionId, url });
      });

      // 接收消息事件
      ws.on('message', (data) => {
        const message = data.toString();
        console.log(`WebSocket收到消息 [${connectionId}]:`, message);
        event.sender.send('websocket-message', { connectionId, message, url });
      });

      // 连接关闭事件
      ws.on('close', (code, reason) => {
        console.log(`WebSocket连接已关闭 [${connectionId}]: ${code} ${reason}`);
        this.connections.delete(connectionId);
        event.sender.send('websocket-closed', { connectionId, code, reason: reason.toString(), url });
      });

      // 连接错误事件
      ws.on('error', (error) => {
        console.error(`WebSocket连接错误 [${connectionId}]:`, error);
        this.connections.delete(connectionId);
        event.sender.send('websocket-error', { connectionId, error: error.message, url });
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
    try {
      const ws = this.connections.get(connectionId);
      if (!ws) {
        return { success: false, error: '连接不存在' };
      }

      ws.close();
      this.connections.delete(connectionId);
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
  }
}

// 创建WebSocket管理器实例
export const webSocketManager = new WebSocketManager();