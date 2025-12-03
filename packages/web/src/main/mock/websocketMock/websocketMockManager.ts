import { WebSocketMockNode, WebSocketMockLog, WebSocketMockStatusChangedPayload } from '@src/types/mockNode';
import { CommonResponse } from '@src/types/project';
import { contentViewInstance } from '../../main';
import detect from 'detect-port';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import { nanoid } from 'nanoid/non-secure';
import { IPC_EVENTS } from '@src/types/ipc';

type WebSocketMockInstance = {
  port: number;
  path: string;
  server: http.Server;
  wss: WebSocketServer;
  clients: Map<string, WebSocket>;
}

export class WebSocketMockManager {
  private websocketMockList: WebSocketMockNode[] = [];
  private websocketServerInstances: WebSocketMockInstance[] = [];
  private websocketPortToInstanceMap: Map<number, WebSocketMockInstance> = new Map();
  private logBuffer: WebSocketMockLog[] = [];
  private sendTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly BATCH_SEND_INTERVAL = 50;
  // 推送日志到渲染进程（批量）
  private pushLogToRenderer(log: Omit<WebSocketMockLog, 'id'>): void {
    const logWithId = { ...log, id: nanoid() } as WebSocketMockLog;
    this.logBuffer.push(logWithId);
    if (!this.sendTimer) {
      this.sendTimer = setTimeout(() => {
        this.flushLogs();
      }, this.BATCH_SEND_INTERVAL);
    }
  }
  // 批量发送日志到渲染进程
  private flushLogs(): void {
    if (this.logBuffer.length === 0) {
      this.sendTimer = null;
      return;
    }
    const logsToSend = [...this.logBuffer];
    this.logBuffer = [];
    this.sendTimer = null;
    if (contentViewInstance && contentViewInstance.webContents) {
      contentViewInstance.webContents.send(IPC_EVENTS.websocketMock.mainToRenderer.logsBatch, logsToSend);
    }
  }
  // 推送Mock状态变更到渲染进程
  private pushMockStatusChanged(payload: WebSocketMockStatusChangedPayload): void {
    if (contentViewInstance && contentViewInstance.webContents) {
      contentViewInstance.webContents.send(IPC_EVENTS.websocketMock.mainToRenderer.statusChanged, payload);
    }
  }
  // 检测端口是否冲突
  private async checkPortConflict(port: number, nodeId: string, projectId: string): Promise<boolean> {
    try {
      const availablePort = await detect(port);
      if (availablePort !== port) {
        this.pushLogToRenderer({
          type: "error",
          nodeId,
          projectId,
          data: {
            errorType: "portError",
            errorMsg: `WebSocket Mock 端口 ${port} 已被系统占用`
          },
          timestamp: Date.now()
        });
        return true;
      }
    } catch (error) {
      this.pushLogToRenderer({
        type: "error",
        nodeId,
        projectId,
        data: {
          errorType: "portError",
          errorMsg: `端口检测失败: ${error instanceof Error ? error.message : 'Unknown error'}`
        },
        timestamp: Date.now()
      });
      return true;
    }
    return false;
  }
  // 处理客户端连接
  private handleClientConnection(ws: WebSocket, mock: WebSocketMockNode, instance: WebSocketMockInstance, clientIp: string): void {
    const clientId = nanoid();
    instance.clients.set(clientId, ws);
    // 记录连接日志
    this.pushLogToRenderer({
      type: "connect",
      nodeId: mock._id,
      projectId: mock.projectId,
      data: {
        clientId,
        ip: clientIp,
      },
      timestamp: Date.now()
    });
    // 发送欢迎消息
    if (mock.config.welcomeMessage.enabled && mock.config.welcomeMessage.content) {
      const welcomeContent = mock.config.welcomeMessage.content;
      setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(welcomeContent);
          this.pushLogToRenderer({
            type: "send",
            nodeId: mock._id,
            projectId: mock.projectId,
            data: {
              clientId,
              content: welcomeContent,
              size: Buffer.byteLength(welcomeContent, 'utf-8'),
              messageType: 'welcome',
            },
            timestamp: Date.now()
          });
        }
      }, mock.config.delay);
    }
    // 处理收到的消息
    ws.on('message', (data) => {
      const content = data.toString();
      // 记录收到的消息
      this.pushLogToRenderer({
        type: "receive",
        nodeId: mock._id,
        projectId: mock.projectId,
        data: {
          clientId,
          content,
          size: Buffer.byteLength(content, 'utf-8'),
        },
        timestamp: Date.now()
      });
      // 发送固定回复
      if (mock.response.content && ws.readyState === WebSocket.OPEN) {
        const responseContent = mock.response.content;
        setTimeout(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(responseContent);
            this.pushLogToRenderer({
              type: "send",
              nodeId: mock._id,
              projectId: mock.projectId,
              data: {
                clientId,
                content: responseContent,
                size: Buffer.byteLength(responseContent, 'utf-8'),
                messageType: 'response',
              },
              timestamp: Date.now()
            });
          }
        }, mock.config.delay);
      }
    });
    // 处理连接关闭
    ws.on('close', (code, reason) => {
      instance.clients.delete(clientId);
      this.pushLogToRenderer({
        type: "disconnect",
        nodeId: mock._id,
        projectId: mock.projectId,
        data: {
          clientId,
          code,
          reason: reason.toString(),
        },
        timestamp: Date.now()
      });
    });
    // 处理错误
    ws.on('error', (error) => {
      this.pushLogToRenderer({
        type: "error",
        nodeId: mock._id,
        projectId: mock.projectId,
        data: {
          errorType: "unknownError",
          errorMsg: `客户端连接错误: ${error.message}`
        },
        timestamp: Date.now()
      });
    });
  }
  // 添加并启动 WebSocket Mock 服务器
  public async addAndStartServer(wsMock: WebSocketMockNode): Promise<CommonResponse<null>> {
    const existingInstance = this.websocketPortToInstanceMap.get(wsMock.requestCondition.port);
    if (existingInstance) {
      // 端口已被使用，检查路径是否冲突
      const pathConflict = this.websocketMockList.some(
        mock => mock.requestCondition.port === wsMock.requestCondition.port &&
                mock.requestCondition.path === wsMock.requestCondition.path
      );
      if (pathConflict) {
        const errorMsg = `WebSocket Mock 路径 ${wsMock.requestCondition.path} 在端口 ${wsMock.requestCondition.port} 上已被使用`;
        this.pushMockStatusChanged({
          nodeId: wsMock._id,
          projectId: wsMock.projectId,
          state: 'error',
          error: errorMsg
        });
        return { code: 1, msg: errorMsg, data: null };
      }
      // 端口复用，添加到列表
      this.websocketMockList.push(wsMock);
      this.pushLogToRenderer({
        type: "start",
        nodeId: wsMock._id,
        projectId: wsMock.projectId,
        data: { port: wsMock.requestCondition.port, path: wsMock.requestCondition.path },
        timestamp: Date.now()
      });
      this.pushMockStatusChanged({
        nodeId: wsMock._id,
        projectId: wsMock.projectId,
        state: 'running',
        port: wsMock.requestCondition.port
      });
      return { code: 0, msg: 'WebSocket Mock 启动成功', data: null };
    }
    // 检测端口冲突
    const hasConflict = await this.checkPortConflict(wsMock.requestCondition.port, wsMock._id, wsMock.projectId);
    if (hasConflict) {
      this.pushMockStatusChanged({
        nodeId: wsMock._id,
        projectId: wsMock.projectId,
        state: 'error',
        error: `WebSocket Mock 端口 ${wsMock.requestCondition.port} 已被占用`
      });
      return { code: 1, msg: `端口 ${wsMock.requestCondition.port} 已被占用`, data: null };
    }
    try {
      const server = http.createServer();
      const wss = new WebSocketServer({ server });
      const instance: WebSocketMockInstance = {
        port: wsMock.requestCondition.port,
        path: wsMock.requestCondition.path,
        server,
        wss,
        clients: new Map(),
      };
      // 处理 WebSocket 连接
      wss.on('connection', (ws, req) => {
        const requestPath = req.url || '/';
        const clientIp = req.socket.remoteAddress || 'unknown';
        // 查找匹配的 Mock 配置
        const matchedMock = this.websocketMockList.find(
          mock => mock.requestCondition.port === wsMock.requestCondition.port &&
                  this.matchPath(requestPath, mock.requestCondition.path)
        );
        if (matchedMock) {
          this.handleClientConnection(ws, matchedMock, instance, clientIp);
        } else {
          ws.close(1008, 'No matching mock configuration');
        }
      });
      // 启动服务器
      server.listen(wsMock.requestCondition.port);
      this.websocketServerInstances.push(instance);
      this.websocketPortToInstanceMap.set(wsMock.requestCondition.port, instance);
      this.websocketMockList.push(wsMock);
      this.pushLogToRenderer({
        type: "start",
        nodeId: wsMock._id,
        projectId: wsMock.projectId,
        data: { port: wsMock.requestCondition.port, path: wsMock.requestCondition.path },
        timestamp: Date.now()
      });
      this.pushMockStatusChanged({
        nodeId: wsMock._id,
        projectId: wsMock.projectId,
        state: 'running',
        port: wsMock.requestCondition.port
      });
      return { code: 0, msg: 'WebSocket Mock 启动成功', data: null };
    } catch (error) {
      const errorMsg = `WebSocket Mock 服务器启动失败: ${error instanceof Error ? error.message : 'Unknown error'}`;
      this.pushLogToRenderer({
        type: "error",
        nodeId: wsMock._id,
        projectId: wsMock.projectId,
        data: {
          errorType: "serverStartError",
          errorMsg
        },
        timestamp: Date.now()
      });
      this.pushMockStatusChanged({
        nodeId: wsMock._id,
        projectId: wsMock.projectId,
        state: 'error',
        error: errorMsg
      });
      return { code: 1, msg: errorMsg, data: null };
    }
  }
  // 路径匹配
  private matchPath(requestPath: string, mockPath: string): boolean {
    // 简单的精确匹配，去除查询参数
    const cleanRequestPath = requestPath.split('?')[0];
    return cleanRequestPath === mockPath;
  }
  // 根据节点ID获取 WebSocket Mock 配置
  public getWebSocketMockByNodeId(nodeId: string): WebSocketMockNode | null {
    return this.websocketMockList.find(mock => mock._id === nodeId) || null;
  }
  // 根据ID替换 WebSocket Mock 配置
  public replaceWebSocketMockById(nodeId: string, wsMock: WebSocketMockNode): void {
    const index = this.websocketMockList.findIndex(mock => mock._id === nodeId);
    if (index !== -1) {
      this.websocketMockList[index] = wsMock;
    }
  }
  // 根据节点ID移除 WebSocket Mock 配置
  private removeWebSocketMockByNodeId(nodeId: string): void {
    const index = this.websocketMockList.findIndex(mock => mock._id === nodeId);
    if (index !== -1) {
      this.websocketMockList.splice(index, 1);
    }
  }
  // 移除 WebSocket Mock 并停止服务器
  public removeWebSocketMockAndStopServer(nodeId: string): Promise<CommonResponse<null>> {
    return new Promise((resolve) => {
      const mockToRemove = this.getWebSocketMockByNodeId(nodeId);
      if (!mockToRemove) {
        resolve({ code: 0, msg: 'WebSocket Mock 停止成功', data: null });
        return;
      }
      const port = mockToRemove.requestCondition.port;
      this.removeWebSocketMockByNodeId(nodeId);
      // 检查该端口上是否还有其他 Mock
      const remainingMocksOnPort = this.websocketMockList.filter(mock => mock.requestCondition.port === port);
      if (remainingMocksOnPort.length > 0) {
        // 端口上还有其他 Mock，不关闭服务器
        this.pushLogToRenderer({
          type: "stop",
          nodeId: mockToRemove._id,
          projectId: mockToRemove.projectId,
          data: { port },
          timestamp: Date.now()
        });
        this.pushMockStatusChanged({
          nodeId: mockToRemove._id,
          projectId: mockToRemove.projectId,
          state: 'stopped'
        });
        resolve({ code: 0, msg: 'WebSocket Mock 停止成功', data: null });
        return;
      }
      // 关闭服务器
      const instance = this.websocketPortToInstanceMap.get(port);
      if (!instance) {
        this.pushLogToRenderer({
          type: "stop",
          nodeId: mockToRemove._id,
          projectId: mockToRemove.projectId,
          data: { port },
          timestamp: Date.now()
        });
        this.pushMockStatusChanged({
          nodeId: mockToRemove._id,
          projectId: mockToRemove.projectId,
          state: 'stopped'
        });
        resolve({ code: 0, msg: 'WebSocket Mock 停止成功', data: null });
        return;
      }
      // 关闭所有客户端连接
      instance.clients.forEach((client) => {
        client.close(1001, 'Server shutting down');
      });
      instance.clients.clear();
      // 关闭 WebSocket 服务器
      instance.wss.close(() => {
        instance.server.close((error) => {
          if (error) {
            this.pushLogToRenderer({
              type: "error",
              nodeId: mockToRemove._id,
              projectId: mockToRemove.projectId,
              data: {
                errorType: "unknownError",
                errorMsg: `关闭服务器失败: ${error.message}`
              },
              timestamp: Date.now()
            });
          } else {
            this.pushLogToRenderer({
              type: "stop",
              nodeId: mockToRemove._id,
              projectId: mockToRemove.projectId,
              data: { port },
              timestamp: Date.now()
            });
          }
          this.pushMockStatusChanged({
            nodeId: mockToRemove._id,
            projectId: mockToRemove.projectId,
            state: 'stopped'
          });
          // 清理实例
          const instanceIndex = this.websocketServerInstances.findIndex(inst => inst.port === port);
          if (instanceIndex !== -1) {
            this.websocketServerInstances.splice(instanceIndex, 1);
          }
          this.websocketPortToInstanceMap.delete(port);
          resolve({ code: 0, msg: 'WebSocket Mock 停止成功', data: null });
        });
      });
      // 设置超时
      setTimeout(() => {
        const instanceIndex = this.websocketServerInstances.findIndex(inst => inst.port === port);
        if (instanceIndex !== -1) {
          this.websocketServerInstances.splice(instanceIndex, 1);
        }
        this.websocketPortToInstanceMap.delete(port);
        resolve({ code: 1, msg: `WebSocket Mock 服务器关闭超时: 端口 ${port}`, data: null });
      }, 20000);
    });
  }
  // 根据项目ID移除所有 WebSocket Mock 并停止服务器
  public async removeWebSocketMocksByProjectId(projectId: string): Promise<void> {
    const mocksToRemove = this.websocketMockList.filter(mock => mock.projectId === projectId);
    const promises: Promise<CommonResponse<null>>[] = [];
    mocksToRemove.forEach(mock => {
      promises.push(this.removeWebSocketMockAndStopServer(mock._id));
    });
    await Promise.all(promises);
  }
  // 获取所有 WebSocket Mock 状态
  public getAllWebSocketMockStates(projectId: string): WebSocketMockStatusChangedPayload[] {
    const projectMocks = this.websocketMockList.filter(mock => mock.projectId === projectId);
    return projectMocks.map(mock => ({
      nodeId: mock._id,
      projectId: mock.projectId,
      state: 'running' as const,
      port: mock.requestCondition.port,
      path: mock.requestCondition.path
    }));
  }
}
