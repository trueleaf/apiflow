import { MockHttpNode, MockInstance, MockLog, MockStatusChangedPayload } from '@src/types/mockNode';
import { CommonResponse } from '@src/types/project';
import { MockUtils, ConsoleLogCollector } from './mockUtils';
import { matchPath, getPatternPriority, sleep } from '../utils';
import { contentViewInstance } from '../main';
import detect from 'detect-port';
import http from 'http';
import Koa from 'koa';
import bodyParser from '@koa/bodyparser';
import { nanoid } from 'nanoid/non-secure';
import { IPC_EVENTS } from '@src/types/ipc';

export class MockManager {
  private mockList: MockHttpNode[] = [];
  private mockInstanceList: MockInstance[] = [];
  private portToInstanceMap: Map<number, MockInstance> = new Map();
  private mockUtils: MockUtils = new MockUtils();
  private logBuffer: MockLog[] = [];
  private sendTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly BATCH_SEND_INTERVAL = 50;
  // 推送日志到渲染进程（批量）
  private pushLogToRenderer(log: Omit<MockLog, 'id'>): void {
    const logWithId = { ...log, id: nanoid() } as MockLog;
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
      contentViewInstance.webContents.send(IPC_EVENTS.MOCK.MAIN_TO_RENDERER.LOGS_BATCH, logsToSend);
    }
  }
  
  /*
  |--------------------------------------------------------------------------
  | 添加mock并且启动 Mock 服务器
  |--------------------------------------------------------------------------
  */
  // 设置服务器事件监听
  private setupServerEventListeners(server: http.Server, port: number): void {
    server.on('close', () => {
      // 服务器关闭时清理该端口的所有 Mock 配置
      const mocksOnPort = this.mockList.filter(mock => mock.requestCondition.port === port);
      mocksOnPort.forEach(mock => {
        this.removeMockByNodeId(mock._id);
      });
    });

    server.on('error', (error: unknown) => {
      // 记录该端口上所有 Mock 的错误日志
      const mocksOnPort = this.mockList.filter(mock => mock.requestCondition.port === port);
      mocksOnPort.forEach(mock => {
        this.pushLogToRenderer({
          type: "error",
          nodeId: mock._id,
          projectId: mock.projectId,
          data: {
            errorType: "serverStartError",
            errorMsg: `服务器错误: ${(error as Error).message}`
          },
          timestamp: Date.now()
        });
      });
    });
  }
  // 核心逻辑
  private async handleRequest(ctx: Koa.Context, port: number): Promise<void> {
    const startTime = Date.now();
    let matchedMock: MockHttpNode | null = null;
    const consoleCollector = new ConsoleLogCollector();
    
    try {
      // 实时从 mockList 中查找匹配的 mock 配置
      const candidateMocks = this.mockList
        .filter(mock => mock.requestCondition.port === port)
        .filter(mock => this.mockUtils.matchHttpMethod(ctx.method, mock.requestCondition.method))
        .map(mock => ({
          mock,
          matchResult: matchPath(mock.requestCondition.url, ctx.path),
          priority: getPatternPriority(mock.requestCondition.url)
        }))
        .filter(item => item.matchResult.matched)
        .sort((a, b) => a.priority - b.priority); // 按优先级排序

      if (candidateMocks.length === 0) {
        ctx.status = 404;
        ctx.body = { error: 'Mock not found' };
        return;
      }

      matchedMock = candidateMocks[0].mock;
      
      // 处理延迟
      if (matchedMock.config.delay > 0) {
        await sleep(matchedMock.config.delay);
      }
      
      // 选择响应配置（支持条件判断）
      let responseConfig = null;
      if (matchedMock.response.length === 0) {
        ctx.status = 500;
        ctx.body = { error: 'No response configuration found' };
        return;
      }
      for (const response of matchedMock.response) {
        if (!response.conditions.enabled) {
          responseConfig = response;
          break;
        }
        try {
          const conditionResult = await this.mockUtils.evaluateCondition(
            response.conditions.scriptCode,
            ctx,
            matchedMock.projectId,
            consoleCollector
          );
          if (conditionResult === true) {
            responseConfig = response;
            break;
          }
        } catch (error) {
          this.pushLogToRenderer({
            type: "error",
            nodeId: matchedMock._id,
            projectId: matchedMock.projectId,
            data: {
              errorType: "conditionScriptError",
              errorMsg: `条件脚本执行失败: ${error instanceof Error ? error.message : 'Unknown error'}`,
              conditionName: response.conditions.name
            },
            timestamp: Date.now()
          });
          ctx.status = 500;
          ctx.body = { 
            error: 'Condition script execution failed',
            details: error instanceof Error ? error.message : 'Unknown error'
          };
          return;
        }
      }
      if (!responseConfig) {
        this.pushLogToRenderer({
          type: "error",
          nodeId: matchedMock._id,
          projectId: matchedMock.projectId,
          data: {
            errorType: "conditionNotMet",
            errorMsg: "所有响应配置的条件都不满足"
          },
          timestamp: Date.now()
        });
        ctx.status = 500;
        ctx.body = { error: 'mock条件不满足' };
        return;
      }

      // 设置响应状态码和头部
      ctx.status = responseConfig.statusCode;
      Object.entries(responseConfig.headers).forEach(([key, value]) => {
        ctx.set(key, value);
      });

      // 对于SSE类型，进行特殊处理
      if (responseConfig.dataType === 'sse') {
        const hasContentType = Object.keys(responseConfig.headers).some(key => 
          key.toLowerCase() === 'content-type'
        );
        if (!hasContentType) {
          ctx.set('content-type', 'text/event-stream; charset=utf-8');
        }
        
        // SSE 类型直接处理，不需要设置 ctx.body
        this.mockUtils.handleSseResponse(responseConfig, ctx);
        return; // 提前返回，不需要设置 ctx.body
      }

      // 对于text类型，如果没有设置content-type，则根据textType设置对应的Content-Type
      if (responseConfig.dataType === 'text') {
        const hasContentType = Object.keys(responseConfig.headers).some(key => 
          key.toLowerCase() === 'content-type'
        );
        if (!hasContentType) {
          const textType = responseConfig.textConfig.textType || 'text/plain';
          const contentTypeMap: Record<string, string> = {
            'text/plain': 'text/plain; charset=utf-8',
            'html': 'text/html; charset=utf-8',
            'xml': 'application/xml; charset=utf-8',
            'yaml': 'application/x-yaml; charset=utf-8',
            'csv': 'text/csv; charset=utf-8',
            'any': 'text/plain; charset=utf-8',
          };
          ctx.set('content-type', contentTypeMap[textType] || 'text/plain; charset=utf-8');
        }
      }

      // 对于json类型，如果没有设置content-type，则设置默认值
      if (responseConfig.dataType === 'json') {
        const hasContentType = Object.keys(responseConfig.headers).some(key => 
          key.toLowerCase() === 'content-type'
        );
        if (!hasContentType) {
          ctx.set('content-type', 'application/json; charset=utf-8');
        }
      }
      const projectVariables = MockUtils.getProjectVariables(matchedMock.projectId);
      const responseData = await this.mockUtils.processResponseByDataType(responseConfig, ctx, projectVariables);
      
      // 对于image类型，如果没有设置content-type，则设置生成的MIME类型
      if (responseConfig.dataType === 'image') {
        const hasContentType = Object.keys(responseConfig.headers).some(key => 
          key.toLowerCase() === 'content-type'
        );
        if (!hasContentType) {
          const generatedMimeType = (responseConfig as any)._generatedMimeType || 'application/octet-stream';
          ctx.set('content-type', generatedMimeType);
        }
      }

      // 对于file类型，如果没有设置content-type，则设置生成的MIME类型
      if (responseConfig.dataType === 'file') {
        const hasContentType = Object.keys(responseConfig.headers).some(key => 
          key.toLowerCase() === 'content-type'
        );
        if (!hasContentType) {
          const generatedMimeType = (responseConfig as any)._generatedMimeType || 'application/octet-stream';
          ctx.set('content-type', generatedMimeType);
        }
        
        // 设置 Content-Disposition 头
        const hasContentDisposition = Object.keys(responseConfig.headers).some(key => 
          key.toLowerCase() === 'content-disposition'
        );
        if (!hasContentDisposition) {
          const generatedContentDisposition = (responseConfig as any)._generatedContentDisposition;
          if (generatedContentDisposition) {
            ctx.set('content-disposition', generatedContentDisposition);
          }
        }
      }

      // 对于binary类型，如果没有设置content-type，则设置生成的MIME类型
      if (responseConfig.dataType === 'binary') {
        const hasContentType = Object.keys(responseConfig.headers).some(key => 
          key.toLowerCase() === 'content-type'
        );
        if (!hasContentType) {
          const generatedMimeType = (responseConfig as any)._generatedMimeType || 'application/octet-stream';
          ctx.set('content-type', generatedMimeType);
        }
      }

      ctx.body = responseData;
      
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: 'Internal server error' };
      
      if (matchedMock) {
        this.pushLogToRenderer({
          type: "error",
          nodeId: matchedMock._id,
          projectId: matchedMock.projectId,
          data: {
            errorType: "unknownError",
            errorMsg: `请求处理错误: ${error instanceof Error ? error.message : 'Unknown error'}`
          },
          timestamp: Date.now()
        });
      }
    } finally {
      // 记录请求日志
      if (matchedMock) {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        // 解析URL获取path和query
        const url = new URL(ctx.url, `${ctx.protocol}://${ctx.host}`);
        const path = url.pathname;
        const query = url.search;
        
        // 获取用户代理
        const userAgent = ctx.get('user-agent') || '';
        
        // 获取内容类型和长度
        const contentType = ctx.get('content-type') || '';
        const contentLength = parseInt(ctx.get('content-length') || '0', 10);
        
        // 获取协议和主机名
        const protocol = ctx.protocol;
        const hostname = ctx.hostname;
        
        this.pushLogToRenderer({
          type: "request",
          nodeId: matchedMock._id,
          projectId: matchedMock.projectId,
          data: {
            // 核心日志字段 (参考Nginx格式)
            ip: ctx.ip,
            method: ctx.method,
            url: ctx.url,
            path: path,
            query: query,
            httpVersion: ctx.req.httpVersion,
            statusCode: ctx.status,
            bytesSent: 0, // 暂时设为0，可以后续完善
            referer: ctx.get('referer') || '',
            userAgent: userAgent,
            responseTime: responseTime,
            
            // Mock服务特有字段
            mockDelay: matchedMock.config.delay,
            matchedRoute: matchedMock.requestCondition.url,
            
            // 可选扩展字段
            protocol: protocol,
            hostname: hostname,
            contentType: contentType,
            contentLength: contentLength,
            
            // 保留原有但不显示在标准日志中的字段
            headers: ctx.headers as Record<string, string>,
            body: '', // 不解析body，保持为空
            
            // Console日志收集
            consoleLogs: consoleCollector.getLogs(),
          },
          timestamp: startTime
        });
      }
    }
  }
  public async addAndStartMockServer(httpMock: MockHttpNode): Promise<CommonResponse<null>> {
    const portExists = this.mockList.some(mock => mock.requestCondition.port === httpMock.requestCondition.port);
    if (portExists) {
      // 端口复用场景：直接添加到 mockList
      this.mockList.push(httpMock);
      this.pushLogToRenderer({
        type: "start",
        nodeId: httpMock._id,
        projectId: httpMock.projectId,
        data: { port: httpMock.requestCondition.port },
        timestamp: Date.now()
      });
      this.pushMockStatusChanged({
        nodeId: httpMock._id,
        projectId: httpMock.projectId,
        state: 'running',
        port: httpMock.requestCondition.port
      });
      return { code: 0, msg: '启动成功', data: null };
    }
    
    // 首次启动场景：检测端口冲突
    const hasConflict = await this.checkPortIsConflict(httpMock);
    if (hasConflict) {
      this.pushMockStatusChanged({
        nodeId: httpMock._id,
        projectId: httpMock.projectId,
        state: 'error',
        error: `端口 ${httpMock.requestCondition.port} 已被占用`
      });
      return { code: 1, msg: `端口 ${httpMock.requestCondition.port} 已被占用`, data: null };
    }
    
    try {
      const app = new Koa();
      app.use(bodyParser({
        enableTypes: ['json', 'form'],
        jsonLimit: '10mb',
        formLimit: '10mb',
        textLimit: '10mb',
      }));
      app.use(async (ctx) => {
        await this.handleRequest(ctx, httpMock.requestCondition.port);
      });
      const server = app.listen(httpMock.requestCondition.port);
      
      // 存储实例信息
      const mockInstance: MockInstance = {
        port: httpMock.requestCondition.port,
        app,
        server
      };
      
      this.mockInstanceList.push(mockInstance);
      this.portToInstanceMap.set(httpMock.requestCondition.port, mockInstance);
      this.setupServerEventListeners(server, httpMock.requestCondition.port);
      this.mockList.push(httpMock);
      
      this.pushLogToRenderer({
        type: "start",
        nodeId: httpMock._id,
        projectId: httpMock.projectId,
        data: { port: httpMock.requestCondition.port },
        timestamp: Date.now()
      });
      this.pushMockStatusChanged({
        nodeId: httpMock._id,
        projectId: httpMock.projectId,
        state: 'running',
        port: httpMock.requestCondition.port
      });
      
      return { code: 0, msg: '启动成功', data: null };
    } catch (error) {
      const errorMsg = `服务器启动失败: ${error instanceof Error ? error.message : 'Unknown error'}`;
      this.pushLogToRenderer({
        type: "error",
        nodeId: httpMock._id,
        projectId: httpMock.projectId,
        data: {
          errorType: "serverStartError",
          errorMsg
        },
        timestamp: Date.now()
      });
      this.pushMockStatusChanged({
        nodeId: httpMock._id,
        projectId: httpMock.projectId,
        state: 'error',
        error: errorMsg
      });
      return { code: 1, msg: errorMsg, data: null };
    }
  }
  /*
  |--------------------------------------------------------------------------
  | mockList 相关操作
  |--------------------------------------------------------------------------
  */
  public getMockByNodeId(nodeId: string): MockHttpNode | null {
    const mock = this.mockList.find(mock => mock._id === nodeId);
    return mock || null;
  }
  public replaceMockById(nodeId: string, httpMock: MockHttpNode): void {
    const index = this.mockList.findIndex(mock => mock._id === nodeId);
    if (index !== -1) {
      this.mockList[index] = httpMock;
    }
  }
  public removeMockByNodeId(nodeId: string): void {
    const index = this.mockList.findIndex(mock => mock._id === nodeId);
    if (index !== -1) {
      this.mockList.splice(index, 1);
    }
  }
  public removeMockByNodeIdAndStopMockServer(nodeId: string): Promise<CommonResponse<null>> {
    return new Promise((resolve) => {
      const mockToRemove = this.getMockByNodeId(nodeId);
      if (!mockToRemove) {
        resolve({ code: 0, msg: '停止成功', data: null });
        return;
      }
      const port = mockToRemove.requestCondition.port;
      this.removeMockByNodeId(nodeId);
      const remainingMocksOnPort = this.mockList.filter(mock => mock.requestCondition.port === port);
      if (remainingMocksOnPort.length > 0) {
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
        resolve({ code: 0, msg: '停止成功', data: null });
        return;
      }
      const instance = this.portToInstanceMap.get(port);
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
        resolve({ code: 0, msg: '停止成功', data: null });
        return;
      }
      instance.server.closeAllConnections();
      instance.server.close((error) => {
        if (error) {
          if (this.mockUtils.isServerNotRunningError(error)) {
            this.pushLogToRenderer({
              type: "already-stopped",
              nodeId: mockToRemove._id,
              projectId: mockToRemove.projectId,
              data: { 
                port,
                reason: "服务器未启动或已经关闭"
              },
              timestamp: Date.now()
            });
            this.pushMockStatusChanged({
              nodeId: mockToRemove._id,
              projectId: mockToRemove.projectId,
              state: 'stopped'
            });
          } else {
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
            this.pushMockStatusChanged({
              nodeId: mockToRemove._id,
              projectId: mockToRemove.projectId,
              state: 'error',
              error: error.message
            });
            resolve({ code: 1, msg: error.message, data: null });
            return;
          }
        } else {
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
        }
        const instanceIndex = this.mockInstanceList.findIndex(inst => inst.port === port);
        if (instanceIndex !== -1) {
          this.mockInstanceList.splice(instanceIndex, 1);
        }
        this.portToInstanceMap.delete(port);
        resolve({ code: 0, msg: '停止成功', data: null });
      });
      // 设置20秒超时，防止无限等待
      setTimeout(() => {
        const instanceIndex = this.mockInstanceList.findIndex(inst => inst.port === port);
        if (instanceIndex !== -1) {
          this.mockInstanceList.splice(instanceIndex, 1);
        }
        this.portToInstanceMap.delete(port);
        resolve({ code: 1, msg: `关闭服务器超时: 端口 ${port}`, data: null });
      }, 20000);
    });
  }
  public removeMockByProjectId(projectId: string): void {
    this.mockList = this.mockList.filter(mock => mock.projectId !== projectId);
  }
  public async removeMockAndStopMockServerByProjectId(projectId: string): Promise<void> {
    const mocksToRemove = this.mockList.filter(mock => mock.projectId === projectId);
    const portGroups = new Map<number, string[]>();
    mocksToRemove.forEach(mock => {
      const port = mock.requestCondition.port;
      if (!portGroups.has(port)) {
        portGroups.set(port, []);
      }
      portGroups.get(port)!.push(mock._id);
    });
    // 对每个端口，只处理第一个 Mock，其余的会在移除第一个时自动处理
    const promises: Promise<CommonResponse<null>>[] = [];
    portGroups.forEach((nodeIds) => {
      // 只处理第一个，因为 removeMockByNodeIdAndStopMockServer 会检查端口上的剩余 Mock
      nodeIds.forEach(nodeId => {
        promises.push(this.removeMockByNodeIdAndStopMockServer(nodeId));
      });
    });
    
    await Promise.all(promises);
    
    // 清理该项目的变量缓存（使用 MockUtils 静态方法）
    MockUtils.clearProjectVariables(projectId);
  }

  // 检测端口是否冲突
  private async checkPortIsConflict(httpMock: MockHttpNode): Promise<boolean> {
    try {
      const availablePort = await detect(httpMock.requestCondition.port);
      if (availablePort !== httpMock.requestCondition.port) {
        this.pushLogToRenderer({
          type: "error",
          nodeId: httpMock._id,
          projectId: httpMock.projectId,
          data: {
            errorType: "portError",
            errorMsg: `端口 ${httpMock.requestCondition.port} 已被系统占用`
          },
          timestamp: Date.now()
        });
        return true;
      }
    } catch (error) {
      this.pushLogToRenderer({
        type: "error",
        nodeId: httpMock._id,
        projectId: httpMock.projectId,
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
  //推送Mock状态变更到渲染进程
  private pushMockStatusChanged(payload: MockStatusChangedPayload): void {
    if (contentViewInstance && contentViewInstance.webContents) {
      contentViewInstance.webContents.send(IPC_EVENTS.MOCK.MAIN_TO_RENDERER.STATUS_CHANGED, payload);
    }
  }
  //获取所有Mock状态
  public getAllMockStates(projectId: string): MockStatusChangedPayload[] {
    const projectMocks = this.mockList.filter(mock => mock.projectId === projectId);
    return projectMocks.map(mock => ({
      nodeId: mock._id,
      projectId: mock.projectId,
      state: 'running' as const,
      port: mock.requestCondition.port
    }));
  }
}

