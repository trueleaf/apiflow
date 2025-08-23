import { WSController, OnWSConnection, OnWSMessage, OnWSDisConnection, Inject } from '@midwayjs/core';
import { Context } from '@midwayjs/ws';
import * as http from 'http';

@WSController()
export class HelloSocketController {
  @Inject()
    ctx: Context;

  @OnWSConnection()
  async onConnectionMethod(socket: Context, request: http.IncomingMessage) {
    console.log(`namespace / got a connection ${this.ctx.readyState}`);
    // 发送欢迎消息
    this.ctx.send(JSON.stringify({
      type: 'connection',
      message: '欢迎连接到WebSocket服务器',
      timestamp: new Date().toISOString()
    }));
  }

  @OnWSMessage('message')
  async gotMessage(data) {
    console.log('收到消息:', data);
    // 简单的数据处理和返回
    return {
      type: 'response',
      original: data,
      result: `服务器已收到: ${data}`,
      timestamp: new Date().toISOString(),
      processed: parseInt(data) + 5 || data + ' - 已处理'
    };
  }

  @OnWSDisConnection()
  async disconnect(id: number) {
    console.log('客户端断开连接: ' + id);
  }
}
