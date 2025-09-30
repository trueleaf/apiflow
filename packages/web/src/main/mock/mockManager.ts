
import { MockHttpNode, MockInstance, MockLog } from '@src/types/mock/mock';
import { CommonResponse } from '@src/types/project';
import { MockLogger } from './mockLogger';
import { matchPath, getPatternPriority, sleep } from '../utils';
import detect from 'detect-port';
import http from 'http';
import Koa from 'koa';
export class MockManager {
  private mockList: MockHttpNode[] = [];
  private logger: MockLogger = new MockLogger();
  private mockInstanceList: MockInstance[] = [];
  private portToInstanceMap: Map<number, MockInstance> = new Map();
  
  /*
  |--------------------------------------------------------------------------
  | 添加mock并且启动 Mock 服务器
  |--------------------------------------------------------------------------
  */
  // 设置服务器事件监听
  private setupServerEventListeners(server: http.Server, httpMock: MockHttpNode): void {
    server.on('close', () => {
      // 服务器关闭时自动清理资源
      this.removeMockByNodeId(httpMock._id);
      this.logger.addLog({
        type: "stop",
        nodeId: httpMock._id,
        projectId: httpMock.projectId,
        data: { port: httpMock.requestCondition.port },
        timestamp: Date.now()
      });
    });

    server.on('error', (error: unknown) => {
      this.logger.addLog({
        type: "error",
        nodeId: httpMock._id,
        projectId: httpMock.projectId,
        data: {
          errorType: "serverStartError",
          errorMsg: `服务器错误: ${(error as Error).message}`
        },
        timestamp: Date.now()
      });
    });
  }
  private async handleRequest(ctx: Koa.Context, port: number): Promise<void> {
    const startTime = Date.now();
    let matchedMock: MockHttpNode | null = null;
    
    try {
      // 实时从 mockList 中查找匹配的 mock 配置
      const candidateMocks = this.mockList
        .filter(mock => mock.requestCondition.port === port)
        .filter(mock => this.matchHttpMethod(ctx.method, mock.requestCondition.method))
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
      
      // 获取第一个响应配置
      const responseConfig = matchedMock.response[0];
      if (!responseConfig) {
        ctx.status = 500;
        ctx.body = { error: 'No response configuration found' };
        return;
      }

      // 设置响应状态码和头部
      ctx.status = responseConfig.statusCode;
      Object.entries(responseConfig.headers).forEach(([key, value]) => {
        ctx.set(key, value);
      });

      // 根据数据类型返回响应数据
      ctx.body = this.generateResponseData(responseConfig);
      
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: 'Internal server error' };
      
      if (matchedMock) {
        this.logger.addLog({
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
        
        this.logger.addLog({
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
            body: '' // 不解析body，保持为空
          },
          timestamp: startTime
        });
      }
    }
  }
  public async addAndStartMockServer(httpMock: MockHttpNode): Promise<CommonResponse<null>> {
    // 检测端口冲突
    const hasConflict = await this.checkPortIsConflict(httpMock);
    if (hasConflict) {
      // 从logger中获取最新的错误信息
      const logs = this.logger.getLogsByNodeId(httpMock._id);
      const latestErrorLog = logs.filter(log => log.type === 'error').pop();
      const errorMsg = latestErrorLog?.data.errorMsg || `端口 ${httpMock.requestCondition.port} 已被占用`;
      return { code: 1, msg: errorMsg, data: null };
    }
    try {
      const app = new Koa();
      app.use(async (ctx) => {
        await this.handleRequest(ctx, httpMock.requestCondition.port);
      });
      const server = app.listen(httpMock.requestCondition.port);
      // 存储实例信息
      const mockInstance: MockInstance = {
        nodeId: httpMock._id,
        projectId: httpMock.projectId,
        port: httpMock.requestCondition.port,
        app,
        server
      };
      
      this.mockInstanceList.push(mockInstance);
      this.portToInstanceMap.set(httpMock.requestCondition.port, mockInstance);
      this.setupServerEventListeners(server, httpMock);
      this.mockList.push(httpMock);
      this.logger.addLog({
        type: "start",
        nodeId: httpMock._id,
        projectId: httpMock.projectId,
        data: { port: httpMock.requestCondition.port },
        timestamp: Date.now()
      });
      
      return { code: 0, msg: '启动成功', data: null };
    } catch (error) {
      const errorMsg = `服务器启动失败: ${error instanceof Error ? error.message : 'Unknown error'}`;
      this.logger.addLog({
        type: "error",
        nodeId: httpMock._id,
        projectId: httpMock.projectId,
        data: {
          errorType: "serverStartError",
          errorMsg
        },
        timestamp: Date.now()
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
      const instanceIndex = this.mockInstanceList.findIndex(instance => instance.nodeId === nodeId);
      if (instanceIndex !== -1) {
        const instance = this.mockInstanceList[instanceIndex];
        
        // 强制关闭所有连接 (Node.js 18.2.0+)
        if (typeof instance.server.closeAllConnections === 'function') {
          instance.server.closeAllConnections();
        }
        
        instance.server.close((error) => {
          if (error) {
            // 检查是否为服务器未启动的错误
            if (this.isServerNotRunningError(error)) {
              console.log(`Mock服务器 ${instance.port} 已经处于停止状态`);
              // 记录特殊日志：服务器已经停止
              this.logger.addLog({
                type: "already-stopped",
                nodeId: instance.nodeId,
                projectId: instance.projectId,
                data: { 
                  port: instance.port,
                  reason: "服务器未启动或已经关闭"
                },
                timestamp: Date.now()
              });
            } else {
              console.error(`关闭Mock服务器 ${instance.port} 失败:`, error);
              // 记录其他类型的错误日志
              this.logger.addLog({
                type: "error",
                nodeId: instance.nodeId,
                projectId: instance.projectId,
                data: {
                  errorType: "unknownError",
                  errorMsg: `关闭服务器失败: ${error.message}`
                },
                timestamp: Date.now()
              });
              // 从 mockList 中移除
              this.removeMockByNodeId(nodeId);
              resolve({ code: 1, msg: error.message, data: null });
              return;
            }
          } else {
            console.log(`Mock服务器 ${instance.port} 已完全关闭`);
            // 记录停止日志
            this.logger.addLog({
              type: "stop",
              nodeId: instance.nodeId,
              projectId: instance.projectId,
              data: { port: instance.port },
              timestamp: Date.now()
            });
          }
          
          // 清理映射关系
          this.portToInstanceMap.delete(instance.port);
          this.mockInstanceList.splice(instanceIndex, 1);
          
          // 从 mockList 中移除
          this.removeMockByNodeId(nodeId);
          resolve({ code: 0, msg: '停止成功', data: null });
        });
        
        // 设置20秒超时，防止无限等待
        setTimeout(() => {
          // 清理映射关系
          this.portToInstanceMap.delete(instance.port);
          this.mockInstanceList.splice(instanceIndex, 1);
          
          // 从 mockList 中移除
          this.removeMockByNodeId(nodeId);
          resolve({ code: 1, msg: `关闭服务器超时: 端口 ${instance.port}`, data: null });
        }, 20000);
      } else {
        // 从 mockList 中移除
        this.removeMockByNodeId(nodeId);
        resolve({ code: 0, msg: '停止成功', data: null });
      }
    });
  }
  public removeMockByProjectId(projectId: string): void {
    this.mockList = this.mockList.filter(mock => mock.projectId !== projectId);
  }
  public async removeMockAndStopMockServerByProjectId(projectId: string): Promise<void> {
    const mocksToRemove = this.mockList.filter(mock => mock.projectId === projectId);
    // 并发关闭所有Mock服务器
    await Promise.all(mocksToRemove.map(mock => 
      this.removeMockByNodeIdAndStopMockServer(mock._id)
    ));
  }
  public getMockList(): MockHttpNode[] {
    return [...this.mockList];
  }
  public getLogsByNodeId(nodeId: string): MockLog[] {
    return this.logger.getLogsByNodeId(nodeId);
  }

  /*
  |--------------------------------------------------------------------------
  | 工具方法
  |--------------------------------------------------------------------------
  */
  // 判断是否为服务器未启动的错误
  private isServerNotRunningError(error: any): boolean {
    return error && 
           (error.code === 'ERR_SERVER_NOT_RUNNING' || 
            (error.message && error.message.toLowerCase().includes('server is not running')));
  }
  // 检测端口是否冲突
  private async checkPortIsConflict(httpMock: MockHttpNode): Promise<boolean> {
    // 检查 mockList 中是否已有相同端口
    const hasPortInMockList = this.mockList.some(mock => mock.requestCondition.port === httpMock.requestCondition.port);
    if (hasPortInMockList) {
      this.logger.addLog({
        type: "error",
        nodeId: httpMock._id,
        projectId: httpMock.projectId,
        data: {
          errorType: "portError",
          errorMsg: `端口 ${httpMock.requestCondition.port} 已被占用`
        },
        timestamp: Date.now()
      });
      return true;
    }
    // 使用 detect-port 检查系统端口是否被占用
    try {
      const availablePort = await detect(httpMock.requestCondition.port);
      if (availablePort !== httpMock.requestCondition.port) {
        this.logger.addLog({
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
      this.logger.addLog({
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
  // 匹配HTTP方法
  private matchHttpMethod(requestMethod: string, allowedMethods: (string)[]): boolean {
    return allowedMethods.includes('ALL') || allowedMethods.includes(requestMethod.toUpperCase());
  }
  // 生成响应数据
  private generateResponseData(responseConfig: any): any {
    switch (responseConfig.dataType) {
      case 'json':
        if (responseConfig.jsonConfig.mode === 'fixed') {
          try {
            return JSON.parse(responseConfig.jsonConfig.fixedData);
          } catch {
            return { data: responseConfig.jsonConfig.fixedData };
          }
        }
        // 随机模式暂时返回固定值
        return { message: 'Random JSON data' };
      
      case 'text':
        if (responseConfig.textConfig.mode === 'fixed') {
          return responseConfig.textConfig.fixedData;
        }
        // 随机模式暂时返回固定值
        return 'Random text data';
      
      default:
        return responseConfig;
    }
  }
}
