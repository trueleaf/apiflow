import { HttpMockNode, MockInstance, MockLog, MockStatusChangedPayload } from '@src/types/mockNode';
import { CommonResponse } from '@src/types/project';
import { MockUtils, ConsoleLogCollector } from '../mockUtils';
import { matchPath, getPatternPriority, sleep } from '../../utils';
import { contentViewInstance } from '../../main';
import detect from 'detect-port';
import http from 'http';
import Koa from 'koa';
import { koaBody } from 'koa-body';
import { nanoid } from 'nanoid/non-secure';
import { IPC_EVENTS } from '@src/types/ipc';

export class HttpMockManager {
  private httpMockList: HttpMockNode[] = [];
  private httpServerInstances: MockInstance[] = [];
  private httpPortToInstanceMap: Map<number, MockInstance> = new Map();
  private mockUtils: MockUtils = new MockUtils();
  private httpLogBuffer: MockLog[] = [];
  private sendTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly BATCH_SEND_INTERVAL = 50;
  // 推送日志到渲染进程（批量）
  private pushLogToRenderer(log: Omit<MockLog, 'id'>): void {
    const logWithId = { ...log, id: nanoid() } as MockLog;
    this.httpLogBuffer.push(logWithId);
    if (!this.sendTimer) {
      this.sendTimer = setTimeout(() => {
        this.flushLogs();
      }, this.BATCH_SEND_INTERVAL);
    }
  }
  // 批量发送日志到渲染进程
  private flushLogs(): void {
    if (this.httpLogBuffer.length === 0) {
      this.sendTimer = null;
      return;
    }
    const logsToSend = [...this.httpLogBuffer];
    this.httpLogBuffer = [];
    this.sendTimer = null;
    if (contentViewInstance && contentViewInstance.webContents) {
      contentViewInstance.webContents.send(IPC_EVENTS.mock.mainToRenderer.logsBatch, logsToSend);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | 添加并启动 HTTP Mock 服务器
  |--------------------------------------------------------------------------
  */
  // 设置服务器事件监听
  private setupHttpServerListeners(server: http.Server, port: number): void {
    server.on('close', () => {
      // 服务器关闭时清理该端口的所有 Mock 配置
      const mocksOnPort = this.httpMockList.filter(mock => mock.requestCondition.port === port);
      mocksOnPort.forEach(mock => {
        this.removeHttpMockByNodeId(mock._id);
      });
    });

    server.on('error', (error: unknown) => {
      // 记录该端口上所有 Mock 的错误日志
      const mocksOnPort = this.httpMockList.filter(mock => mock.requestCondition.port === port);
      mocksOnPort.forEach(mock => {
        this.pushLogToRenderer({
          type: "error",
          nodeId: mock._id,
          projectId: mock.projectId,
          data: {
            errorType: "serverStartError",
            errorMsg: `HTTP 服务器错误: ${(error as Error).message}`
          },
          timestamp: Date.now()
        });
      });
    });
  }
  // 获取请求体字符串
  private getRequestBody(ctx: Koa.Context): string {
    const body = (ctx.request as any).body;
    const files = (ctx.request as any).files;
    if (!body && !files) return '';

    const contentType = ctx.get('content-type') || '';

    // 处理 multipart/form-data（koa-body 解析后的数据）
    if (contentType.includes('multipart/form-data')) {
      const parts: string[] = [];
      
      // 添加表单字段
      if (body && typeof body === 'object') {
        for (const [key, value] of Object.entries(body)) {
          if (Array.isArray(value)) {
            value.forEach(v => {
              parts.push(`Content-Disposition: form-data; name="${key}"\r\n\r\n${String(v)}`);
            });
          } else {
            parts.push(`Content-Disposition: form-data; name="${key}"\r\n\r\n${String(value)}`);
          }
        }
      }
      
      // 添加文件字段（koa-body 将文件存储在 ctx.request.files 中）
      if (files) {
        // files 可能是对象或数组
        const fileArray = Array.isArray(files) ? files : Object.values(files).flat();
        for (const file of fileArray) {
          const fileInfo = file as any;
          const filename = fileInfo.originalFilename || fileInfo.newFilename || 'unknown';
          const fieldname = fileInfo.fieldName || fileInfo.name || 'file';
          const size = fileInfo.size || 0;
          const mimetype = fileInfo.mimetype || fileInfo.type || 'application/octet-stream';
          parts.push(
            `Content-Disposition: form-data; name="${fieldname}"; filename="${filename}"\r\n` +
            `Content-Type: ${mimetype}\r\n\r\n` +
            `[Binary File: ${filename}, Size: ${size} bytes]`
          );
        }
      }
      
      if (parts.length > 0) {
        const boundary = contentType.match(/boundary=([^;]+)/)?.[1] || 'boundary';
        return parts.map(part => `--${boundary}\r\n${part}\r\n`).join('') + `--${boundary}--`;
      }
      return '';
    }

    if (!body) return '';

    if (typeof body === 'string') {
      return body;
    }

    if (contentType.includes('application/json')) {
      return JSON.stringify(body);
    }

    if (contentType.includes('application/x-www-form-urlencoded')) {
      try {
        const params = new URLSearchParams();
        // koa-bodyparser 解析的 body 是对象，值可能是字符串或数组
        for (const [key, value] of Object.entries(body)) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, String(v)));
          } else {
            params.append(key, String(value));
          }
        }
        return params.toString();
      } catch (e) {
        return JSON.stringify(body);
      }
    }

    try {
      return JSON.stringify(body);
    } catch {
      return String(body);
    }
  }

  // 处理 HTTP 请求
  private async handleHttpRequest(ctx: Koa.Context, port: number): Promise<void> {
    const startTime = Date.now();
    let matchedMock: HttpMockNode | null = null;
    const consoleCollector = new ConsoleLogCollector();

    try {
      // 实时从 httpMockList 中查找匹配的 mock 配置
      const candidateMocks = this.httpMockList
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
        ctx.body = { error: 'HTTP Mock not found' };
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
        ctx.body = { error: 'No HTTP response configuration found' };
        return;
      }
      for (const response of matchedMock.response) {
        if (!response.conditions.enabled) {
          responseConfig = response;
          break;
        }
        let conditionResult: unknown;
        try {
          conditionResult = await this.mockUtils.evaluateCondition(
            response.conditions.scriptCode,
            ctx,
            matchedMock.projectId,
            consoleCollector
          );
          responseConfig = response;
          if (conditionResult) {
            break;
          } else {
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
            ctx.body = {
              error: 'HTTP Mock 条件不满足，执行代码返回值不是truly',
              scriptCode: matchedMock.response.map(r => r.conditions.scriptCode).join('\n---\n'),
              conditionResult
            };
            return;
          }
        } catch (error) {
          this.pushLogToRenderer({
            type: "error",
            nodeId: matchedMock._id,
            projectId: matchedMock.projectId,
            data: {
              errorType: "conditionScriptError",
              errorMsg: `条件脚本执行失败: ${error instanceof Error ? error.message : 'Unknown error'}`,
              conditionName: response.conditions.name,
              conditionResult
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
        ctx.body = {
          error: 'HTTP Mock 条件不满足，执行代码返回值不是truly',
          scriptCode: matchedMock.response.map(r => r.conditions.scriptCode).join('\n---\n')
        };
        return;
      }

      // 设置响应状态码和头部
      ctx.status = responseConfig.statusCode;
      const allHeaders = [
        ...responseConfig.headers.defaultHeaders.filter(h => h.select),
        ...responseConfig.headers.customHeaders.filter(h => h.select)
      ];
      allHeaders.forEach(header => {
        if (header.key && header.value) {
          ctx.set(header.key, header.value);
        }
      });

      // 对于redirect类型，进行重定向处理
      if (responseConfig.dataType === 'redirect') {
        ctx.status = responseConfig.redirectConfig.statusCode;
        const projectVariables = MockUtils.getProjectVariables(matchedMock.projectId);
        const location = await this.mockUtils.replaceVariables(responseConfig.redirectConfig.location, projectVariables);
        ctx.set('Location', location);
        ctx.body = '';
        return;
      }

      // 对于SSE类型，进行特殊处理
      if (responseConfig.dataType === 'sse') {
        const hasContentType = allHeaders.some(header =>
          header.key && header.key.toLowerCase() === 'content-type'
        );
        if (!hasContentType) {
          ctx.set('content-type', 'text/event-stream; charset=utf-8');
        }

        // SSE 类型直接处理，不需要设置 ctx.body，传递项目变量
        const projectVariables = MockUtils.getProjectVariables(matchedMock.projectId);
        this.mockUtils.handleSseResponse(responseConfig, ctx, projectVariables);
        return; // 提前返回，不需要设置 ctx.body
      }

      // 对于text类型，如果没有设置content-type，则根据textType设置对应的Content-Type
      if (responseConfig.dataType === 'text') {
        const hasContentType = allHeaders.some(header =>
          header.key && header.key.toLowerCase() === 'content-type'
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
        const hasContentType = allHeaders.some(header =>
          header.key && header.key.toLowerCase() === 'content-type'
        );
        if (!hasContentType) {
          ctx.set('content-type', 'application/json; charset=utf-8');
        }
      }
      const projectVariables = MockUtils.getProjectVariables(matchedMock.projectId);
      const responseData = await this.mockUtils.processResponseByDataType(responseConfig, ctx, projectVariables);

      // 对于image类型，如果没有设置content-type，则设置生成的MIME类型
      if (responseConfig.dataType === 'image') {
        const hasContentType = allHeaders.some(header =>
          header.key && header.key.toLowerCase() === 'content-type'
        );
        if (!hasContentType) {
          const generatedMimeType = (responseConfig as any)._generatedMimeType || 'application/octet-stream';
          ctx.set('content-type', generatedMimeType);
        }
      }

      // 对于file类型，如果没有设置content-type，则设置生成的MIME类型
      if (responseConfig.dataType === 'file') {
        const hasContentType = allHeaders.some(header =>
          header.key && header.key.toLowerCase() === 'content-type'
        );
        if (!hasContentType) {
          const generatedMimeType = (responseConfig as any)._generatedMimeType || 'application/octet-stream';
          ctx.set('content-type', generatedMimeType);
        }

        // 设置 Content-Disposition 头
        const hasContentDisposition = allHeaders.some(header =>
          header.key && header.key.toLowerCase() === 'content-disposition'
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
        const hasContentType = allHeaders.some(header =>
          header.key && header.key.toLowerCase() === 'content-type'
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
            body: this.getRequestBody(ctx), // 获取请求体

            // Console日志收集
            consoleLogs: consoleCollector.getLogs(),
          },
          timestamp: startTime
        });
      }
    }
  }
  // 添加并启动 HTTP Mock 服务器
  public async addAndStartHttpServer(httpMock: HttpMockNode): Promise<CommonResponse<null>> {
    const portExists = this.httpMockList.some(mock => mock.requestCondition.port === httpMock.requestCondition.port);
    if (portExists) {
      // 端口复用场景：直接添加到 httpMockList
      this.httpMockList.push(httpMock);
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
      return { code: 0, msg: 'HTTP Mock 启动成功', data: null };
    }

    // 首次启动场景：检测端口冲突
    const hasConflict = await this.checkHttpPortConflict(httpMock);
    if (hasConflict) {
      this.pushMockStatusChanged({
        nodeId: httpMock._id,
        projectId: httpMock.projectId,
        state: 'error',
        error: `HTTP 端口 ${httpMock.requestCondition.port} 已被占用`
      });
      return { code: 1, msg: `HTTP 端口 ${httpMock.requestCondition.port} 已被占用`, data: null };
    }

    try {
      const app = new Koa();
      
      // 使用 koa-body 统一处理所有请求体类型（包括 multipart/form-data）
      app.use(koaBody({
        multipart: true, // 启用 multipart/form-data 解析
        urlencoded: true,
        json: true,
        text: true,
        formidable: {
          maxFileSize: 100 * 1024 * 1024, // 100MB
          keepExtensions: true,
        },
        jsonLimit: '10mb',
        formLimit: '10mb',
        textLimit: '10mb',
      }));
      
      app.use(async (ctx) => {
        await this.handleHttpRequest(ctx, httpMock.requestCondition.port);
      });
      const server = app.listen(httpMock.requestCondition.port);

      // 存储实例信息
      const mockInstance: MockInstance = {
        port: httpMock.requestCondition.port,
        app,
        server
      };

      this.httpServerInstances.push(mockInstance);
      this.httpPortToInstanceMap.set(httpMock.requestCondition.port, mockInstance);
      this.setupHttpServerListeners(server, httpMock.requestCondition.port);
      this.httpMockList.push(httpMock);

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

      return { code: 0, msg: 'HTTP Mock 启动成功', data: null };
    } catch (error) {
      const errorMsg = `HTTP 服务器启动失败: ${error instanceof Error ? error.message : 'Unknown error'}`;
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
  | HTTP Mock 相关操作
  |--------------------------------------------------------------------------
  */
  // 根据节点ID获取 HTTP Mock 配置
  public getHttpMockByNodeId(nodeId: string): HttpMockNode | null {
    const mock = this.httpMockList.find(mock => mock._id === nodeId);
    return mock || null;
  }
  // 根据ID替换 HTTP Mock 配置
  public replaceHttpMockById(nodeId: string, httpMock: HttpMockNode): void {
    const index = this.httpMockList.findIndex(mock => mock._id === nodeId);
    if (index !== -1) {
      this.httpMockList[index] = httpMock;
    }
  }
  // 根据节点ID移除 HTTP Mock 配置
  public removeHttpMockByNodeId(nodeId: string): void {
    const index = this.httpMockList.findIndex(mock => mock._id === nodeId);
    if (index !== -1) {
      this.httpMockList.splice(index, 1);
    }
  }
  // 移除 HTTP Mock 并停止服务器
  public removeHttpMockAndStopServer(nodeId: string): Promise<CommonResponse<null>> {
    return new Promise((resolve) => {
      const mockToRemove = this.getHttpMockByNodeId(nodeId);
      if (!mockToRemove) {
        resolve({ code: 0, msg: 'HTTP Mock 停止成功', data: null });
        return;
      }
      const port = mockToRemove.requestCondition.port;
      this.removeHttpMockByNodeId(nodeId);
      const remainingMocksOnPort = this.httpMockList.filter(mock => mock.requestCondition.port === port);
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
        resolve({ code: 0, msg: 'HTTP Mock 停止成功', data: null });
        return;
      }
      const instance = this.httpPortToInstanceMap.get(port);
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
        resolve({ code: 0, msg: 'HTTP Mock 停止成功', data: null });
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
        const instanceIndex = this.httpServerInstances.findIndex(inst => inst.port === port);
        if (instanceIndex !== -1) {
          this.httpServerInstances.splice(instanceIndex, 1);
        }
        this.httpPortToInstanceMap.delete(port);
        resolve({ code: 0, msg: 'HTTP Mock 停止成功', data: null });
      });
      // 设置20秒超时，防止无限等待
      setTimeout(() => {
        const instanceIndex = this.httpServerInstances.findIndex(inst => inst.port === port);
        if (instanceIndex !== -1) {
          this.httpServerInstances.splice(instanceIndex, 1);
        }
        this.httpPortToInstanceMap.delete(port);
        resolve({ code: 1, msg: `HTTP 服务器关闭超时: 端口 ${port}`, data: null });
      }, 20000);
    });
  }
  // 根据项目ID移除 HTTP Mock 配置
  public removeHttpMocksByProjectId(projectId: string): void {
    this.httpMockList = this.httpMockList.filter(mock => mock.projectId !== projectId);
  }
  // 根据项目ID移除 HTTP Mock 并停止服务器
  public async removeHttpMocksAndStopServersByProjectId(projectId: string): Promise<void> {
    const mocksToRemove = this.httpMockList.filter(mock => mock.projectId === projectId);
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
      // 只处理第一个，因为 removeHttpMockAndStopServer 会检查端口上的剩余 Mock
      nodeIds.forEach(nodeId => {
        promises.push(this.removeHttpMockAndStopServer(nodeId));
      });
    });

    await Promise.all(promises);

    // 清理该项目的变量缓存（使用 MockUtils 静态方法）
    MockUtils.clearProjectVariables(projectId);
  }

  // 检测 HTTP 端口是否冲突
  private async checkHttpPortConflict(httpMock: HttpMockNode): Promise<boolean> {
    try {
      const availablePort = await detect(httpMock.requestCondition.port);
      if (availablePort !== httpMock.requestCondition.port) {
        this.pushLogToRenderer({
          type: "error",
          nodeId: httpMock._id,
          projectId: httpMock.projectId,
          data: {
            errorType: "portError",
            errorMsg: `HTTP 端口 ${httpMock.requestCondition.port} 已被系统占用`
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
          errorMsg: `HTTP 端口检测失败: ${error instanceof Error ? error.message : 'Unknown error'}`
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
      contentViewInstance.webContents.send(IPC_EVENTS.mock.mainToRenderer.statusChanged, payload);
    }
  }
  // 获取所有 HTTP Mock 状态
  public getAllHttpMockStates(projectId: string): MockStatusChangedPayload[] {
    const projectMocks = this.httpMockList.filter(mock => mock.projectId === projectId);
    return projectMocks.map(mock => ({
      nodeId: mock._id,
      projectId: mock.projectId,
      state: 'running' as const,
      port: mock.requestCondition.port
    }));
  }
}

