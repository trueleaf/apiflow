
import { MockHttpNode, MockInstance, MockLog } from '@src/types/mock/mock';
import { MockLogger } from './mockLogger';
import { matchPath, getPatternPriority } from '../utils';
import detect from 'detect-port';
import http from 'http';
import Koa from 'koa';
import { sleep } from '@/helper/index.ts';

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
        this.logger.addLog({
          type: "request",
          nodeId: matchedMock._id,
          projectId: matchedMock.projectId,
          data: {
            ip: ctx.ip,
            method: ctx.method,
            url: ctx.url,
            httpVersion: ctx.req.httpVersion,
            statusCode: ctx.status,
            bytesSent: 0, // 暂时设为0，可以后续完善
            referer: ctx.get('referer') || '',
            headers: ctx.headers as Record<string, string>,
            body: '' // 不解析body，保持为空
          },
          timestamp: startTime
        });
      }
    }
  }
  public async addAndStartMockServer(httpMock: MockHttpNode): Promise<boolean> {
    // 检测端口冲突
    const hasConflict = await this.checkPortIsConflict(httpMock);
    if (hasConflict) {
      return false;
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
      
      return true;
    } catch (error) {
      this.logger.addLog({
        type: "error",
        nodeId: httpMock._id,
        projectId: httpMock.projectId,
        data: {
          errorType: "serverStartError",
          errorMsg: `服务器启动失败: ${error instanceof Error ? error.message : 'Unknown error'}`
        },
        timestamp: Date.now()
      });
      return false;
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
  public removeMockByNodeIdAndStopMockServer(nodeId: string): void {
    const instanceIndex = this.mockInstanceList.findIndex(instance => instance.nodeId === nodeId);
    if (instanceIndex !== -1) {
      const instance = this.mockInstanceList[instanceIndex];
      instance.server.close();
      this.portToInstanceMap.delete(instance.port);
      this.mockInstanceList.splice(instanceIndex, 1);
    }
    this.removeMockByNodeId(nodeId);
  }
  public removeMockByProjectId(projectId: string): void {
    this.mockList = this.mockList.filter(mock => mock.projectId !== projectId);
  }
  public removeMockAndStopMockServerByProjectId(projectId: string): void {
    const mocksToRemove = this.mockList.filter(mock => mock.projectId === projectId);
    mocksToRemove.forEach(mock => {
      this.removeMockByNodeIdAndStopMockServer(mock._id);
    });
  }
  public getUsedPort(): { port: number, projectId: string, nodeId: string }[] {
    return this.mockList.map(mock => ({
      port: mock.requestCondition.port,
      projectId: mock.projectId,
      nodeId: mock._id
    }));
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
          errorMsg: `端口 ${httpMock.requestCondition.port} 已被占用（内部冲突）`
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
