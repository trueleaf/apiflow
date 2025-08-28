import { WSController, OnWSConnection, OnWSMessage, OnWSDisConnection, Inject } from '@midwayjs/core';
import { Context } from '@midwayjs/ws';
import * as http from 'http';

@WSController()
export class HelloSocketController {
  @Inject()
    ctx: Context;

  @OnWSConnection()
  async onConnectionMethod(socket: Context, request: http.IncomingMessage) {

    // 打印请求头、请求url和一些必要信息
    console.log('WebSocket连接请求头:', request.headers);
    console.log('WebSocket连接请求url:', request.url);
    console.log('WebSocket连接远程地址:', request.socket?.remoteAddress);
    console.log('WebSocket连接协议:', request.headers['sec-websocket-protocol']);
    // 发送欢迎消息
    this.ctx.send(JSON.stringify({
      type: 'connection',
      message: '欢迎连接到WebSocket服务器',
      timestamp: new Date().toISOString(),
      url: request.url,
      headers: request.headers,
      remoteAddress: request.socket?.remoteAddress
    }));
  }

  @OnWSMessage('message')
  async gotMessage(data: Buffer) {
    console.log('收到消息:', data.toString());
    // 简单的数据处理和返回
    return {
      type: 'response',
      original: data,
      result: `服务器已收到: ${data}`,
      timestamp: new Date().toISOString(),
    };
  }

  @OnWSDisConnection()
  async disconnect(id: number) {
    console.log('客户端断开连接: ' + id);
  }
}
