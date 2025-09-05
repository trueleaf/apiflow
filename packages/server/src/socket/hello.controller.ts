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
    
    try {
      // 尝试解析JSON数据
      const message = JSON.parse(data.toString());
      const { type, size = 1024 } = message; // 默认1KB大小
      
      // 根据类型生成不同的响应数据
      switch (type) {
        case 'json':
          return this.generateJsonData(size);
        
        case 'text':
          return this.generateTextData(size);
        
        case 'array':
          return this.generateArrayData(size);
        
        case 'xml':
          return this.generateXmlData(size);
        
        case 'csv':
          return this.generateCsvData(size);
        
        case 'binary':
          return this.generateBinaryData(size);
        
        case 'number':
          return this.generateNumberData(size);
        
        case 'boolean':
          return this.generateBooleanData(size);
        
        default:
          return {
            type: 'error',
            message: `不支持的数据类型: ${type}`,
            supportedTypes: ['json', 'text', 'array', 'xml', 'csv', 'binary', 'number', 'boolean'],
            timestamp: new Date().toISOString(),
          };
      }
    } catch (error) {
      // 如果不是JSON格式，返回简单的文本响应
      return {
        type: 'response',
        original: data.toString(),
        result: `服务器已收到: ${data}`,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @OnWSDisConnection()
  async disconnect(id: number) {
    console.log('客户端断开连接: ' + id);
  }

  // 生成JSON数据
  private generateJsonData(size: number) {
    const targetSize = Math.max(size, 100); // 最小100字节
    let data = {
      type: 'json',
      timestamp: new Date().toISOString(),
      size: targetSize,
      data: {} as any
    };

    // 填充数据直到达到目标大小
    let currentSize = JSON.stringify(data).length;
    let counter = 0;
    
    while (currentSize < targetSize) {
      data.data[`field_${counter}`] = `这是第${counter}个字段的数据，用于填充到指定大小`;
      counter++;
      currentSize = JSON.stringify(data).length;
      
      // 防止无限循环
      if (counter > 1000) break;
    }

    return data;
  }

  // 生成纯文本数据
  private generateTextData(size: number) {
    const targetSize = Math.max(size, 50);
    const baseText = '这是模拟生成的文本数据。';
    const repeatCount = Math.ceil(targetSize / baseText.length);
    
    return {
      type: 'text',
      timestamp: new Date().toISOString(),
      size: targetSize,
      data: (baseText.repeat(repeatCount)).substring(0, targetSize)
    };
  }

  // 生成数组数据
  private generateArrayData(size: number) {
    const targetSize = Math.max(size, 100);
    const items = [];
    let currentSize = 0;
    let counter = 0;

    while (currentSize < targetSize) {
      const item = {
        id: counter,
        name: `Item ${counter}`,
        value: Math.random() * 100,
        description: `这是第${counter}个数组项目的描述信息`
      };
      items.push(item);
      currentSize = JSON.stringify({ type: 'array', data: items }).length;
      counter++;
      
      if (counter > 500) break;
    }

    return {
      type: 'array',
      timestamp: new Date().toISOString(),
      size: targetSize,
      count: items.length,
      data: items
    };
  }

  // 生成XML数据
  private generateXmlData(size: number) {
    const targetSize = Math.max(size, 200);
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n';
    let counter = 0;
    
    while (xml.length < targetSize - 50) { // 预留结束标签空间
      xml += `  <item id="${counter}">\n`;
      xml += `    <name>项目${counter}</name>\n`;
      xml += `    <value>${Math.random() * 100}</value>\n`;
      xml += `    <description>这是第${counter}个XML项目的描述</description>\n`;
      xml += `  </item>\n`;
      counter++;
      
      if (counter > 100) break;
    }
    
    xml += '</root>';

    return {
      type: 'xml',
      timestamp: new Date().toISOString(),
      size: targetSize,
      data: xml
    };
  }

  // 生成CSV数据
  private generateCsvData(size: number) {
    const targetSize = Math.max(size, 100);
    let csv = 'ID,名称,数值,描述\n';
    let counter = 0;
    
    while (csv.length < targetSize) {
      csv += `${counter},项目${counter},${(Math.random() * 100).toFixed(2)},这是第${counter}个CSV项目的描述信息\n`;
      counter++;
      
      if (counter > 200) break;
    }

    return {
      type: 'csv',
      timestamp: new Date().toISOString(),
      size: targetSize,
      rows: counter,
      data: csv
    };
  }

  // 生成二进制数据（Base64编码）
  private generateBinaryData(size: number) {
    const targetSize = Math.max(size, 64);
    const buffer = Buffer.alloc(targetSize);
    
    // 填充随机数据
    for (let i = 0; i < targetSize; i++) {
      buffer[i] = Math.floor(Math.random() * 256);
    }

    return {
      type: 'binary',
      timestamp: new Date().toISOString(),
      size: targetSize,
      encoding: 'base64',
      data: buffer.toString('base64')
    };
  }

  // 生成数字数据
  private generateNumberData(size: number) {
    const count = Math.max(Math.floor(size / 8), 10); // 假设每个数字约8字节
    const numbers = [];
    
    for (let i = 0; i < count; i++) {
      numbers.push({
        integer: Math.floor(Math.random() * 1000000),
        float: Math.random() * 1000,
        timestamp: Date.now() + i
      });
    }

    return {
      type: 'number',
      timestamp: new Date().toISOString(),
      size: size,
      count: count,
      data: numbers
    };
  }

  // 生成布尔数据
  private generateBooleanData(size: number) {
    const count = Math.max(Math.floor(size / 50), 5); // 假设每个布尔对象约50字节
    const booleans = [];
    
    for (let i = 0; i < count; i++) {
      booleans.push({
        id: i,
        value: Math.random() > 0.5,
        description: `布尔值${i}: ${Math.random() > 0.5 ? '真' : '假'}`,
        metadata: {
          generated: true,
          index: i,
          timestamp: new Date().toISOString()
        }
      });
    }

    return {
      type: 'boolean',
      timestamp: new Date().toISOString(),
      size: size,
      count: count,
      data: booleans
    };
  }
}
