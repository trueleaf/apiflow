import { MockHttpNode, MockSSEEventData } from '@src/types/mockNode';
import { globalAiManager } from '../ai/ai';
import { fakerZH_CN, fakerEN, fakerJA } from '@faker-js/faker';
import sharp from 'sharp';
import mime from 'mime-types';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import Koa from 'koa';
import { runtime } from '../runtime/runtime';
import vm from 'vm';
import json5 from 'json5';
import { ApidocVariable } from '@src/types';

type MockResponseConfig = MockHttpNode['response'][0];
type FileResponseResult = { data: Buffer; mimeType: string; fileName: string; contentDisposition: string };
type BinaryResponseResult = { data: Buffer; mimeType: string };

// Console日志收集器
export class ConsoleLogCollector {
  private logs: Array<{
    level: 'log' | 'warn' | 'error' | 'info' | 'debug',
    message: string,
    timestamp: number,
  }> = [];
  private readonly MAX_LOGS = 50;
  private readonly MAX_MESSAGE_LENGTH = 500;
  private readonly MAX_DEPTH = 3;
  // 添加日志
  public add(level: 'log' | 'warn' | 'error' | 'info' | 'debug', args: any[]): void {
    if (this.logs.length >= this.MAX_LOGS) {
      return;
    }
    const message = this.formatMessage(args);
    this.logs.push({
      level,
      message,
      timestamp: Date.now(),
    });
  }
  // 格式化消息
  private formatMessage(args: any[]): string {
    const formatted = args.map(arg => this.serializeValue(arg, 0)).join(' ');
    return formatted.length > this.MAX_MESSAGE_LENGTH 
      ? formatted.substring(0, this.MAX_MESSAGE_LENGTH - 3) + '...' 
      : formatted;
  }
  // 序列化值
  private serializeValue(value: any, depth: number): string {
    if (depth > this.MAX_DEPTH) {
      return '[Object]';
    }
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    const type = typeof value;
    if (type === 'string') return value;
    if (type === 'number' || type === 'boolean') return String(value);
    if (type === 'function') return '[Function]';
    if (type === 'object') {
      try {
        if (Array.isArray(value)) {
          const items = value.slice(0, 10).map(item => this.serializeValue(item, depth + 1));
          const suffix = value.length > 10 ? `, ... ${value.length - 10} more` : '';
          return `[${items.join(', ')}${suffix}]`;
        }
        const seen = new WeakSet();
        const replacer = (_key: string, val: any) => {
          if (typeof val === 'object' && val !== null) {
            if (seen.has(val)) return '[Circular]';
            seen.add(val);
          }
          return val;
        };
        return JSON.stringify(value, replacer);
      } catch {
        return '[Object]';
      }
    }
    return String(value);
  }
  // 获取收集的日志
  public getLogs() {
    return [...this.logs];
  }
  // 清空日志
  public clear(): void {
    this.logs = [];
  }
}

export class MockUtils {
  // 兼容ESM环境的当前模块目录
  private static readonly moduleDirname: string = path.dirname(fileURLToPath(import.meta.url));
  // 项目变量缓存: projectId -> variables
  private static projectVariablesMap: Map<string, ApidocVariable[]> = new Map();

  /*
  |--------------------------------------------------------------------------
  | 项目变量管理（静态方法）
  |--------------------------------------------------------------------------
  */
  // 同步项目变量到主进程缓存
  public static syncProjectVariables(projectId: string, variables: ApidocVariable[]): void {
    MockUtils.projectVariablesMap.set(projectId, variables);
  }

  // 获取项目变量
  public static getProjectVariables(projectId: string): ApidocVariable[] {
    const variables = MockUtils.projectVariablesMap.get(projectId);
    if (!variables) {
      return [];
    }
    return variables;
  }

  // 清理项目变量缓存
  public static clearProjectVariables(projectId: string): void {
    MockUtils.projectVariablesMap.delete(projectId);
  }

  /*
  |--------------------------------------------------------------------------
  | Console日志收集辅助方法
  |--------------------------------------------------------------------------
  */
  // 创建自定义Console对象
  private createCustomConsole(collector: ConsoleLogCollector): Console {
    const createLogMethod = (level: 'log' | 'warn' | 'error' | 'info' | 'debug') => {
      return (...args: any[]) => {
        collector.add(level, args);
      };
    };
    return {
      log: createLogMethod('log'),
      warn: createLogMethod('warn'),
      error: createLogMethod('error'),
      info: createLogMethod('info'),
      debug: createLogMethod('debug'),
    } as Console;
  }

  /*
  |--------------------------------------------------------------------------
  | 实例方法
  |--------------------------------------------------------------------------
  */
  // 生成随机文本内容
  public generateRandomText(size: number): string {
    const currentLanguage = this.getCurrentLanguage();
    const fakerInstance = this.getFakerInstance(currentLanguage);
    let result = '';
    if (size <= 50) {
      const sentence = fakerInstance.lorem.sentence();
      return sentence.substring(0, size);
    }
    while (result.length < size) {
      const randomType = Math.random();
      if (randomType < 0.4) {
        // 40% 概率生成句子
        result += fakerInstance.lorem.sentence() + ' ';
      } else if (randomType < 0.7) {
        // 30% 概率生成段落的一部分
        result += fakerInstance.lorem.paragraph().substring(0, 100) + ' ';
      } else if (randomType < 0.85) {
        // 15% 概率生成单词组合
        result += fakerInstance.lorem.words(Math.floor(Math.random() * 5) + 3) + '. ';
      } else {
        // 15% 概率生成其他类型的内容
        const contentTypes = [
          () => `${fakerInstance.person.fullName()}: ${fakerInstance.lorem.sentence()}`,
          () => `${fakerInstance.company.name()} - ${fakerInstance.company.catchPhrase()}`,
          () => `${fakerInstance.date.recent().toLocaleDateString()} ${fakerInstance.lorem.words(5)}`,
          () => fakerInstance.lorem.lines()
        ];
        const randomContent = contentTypes[Math.floor(Math.random() * contentTypes.length)]();
        result += randomContent + ' ';
      }
    }
    
    return result.substring(0, size).trim();
  }

  // 生成随机HTML内容（body片段）
  public generateRandomHtml(tagCount: number): string {
    const currentLanguage = this.getCurrentLanguage();
    const fakerInstance = this.getFakerInstance(currentLanguage);
    const safeTagCount = Math.max(1, Math.min(tagCount, 100)); // 限制1-100个标签
    
    // HTML标签模板
    const tagTemplates = [
      () => `<h1>${fakerInstance.lorem.words(3)}</h1>`,
      () => `<h2>${fakerInstance.lorem.words(4)}</h2>`,
      () => `<h3>${fakerInstance.lorem.words(3)}</h3>`,
      () => `<p>${fakerInstance.lorem.paragraph()}</p>`,
      () => `<div class="${fakerInstance.lorem.word()}">${fakerInstance.lorem.sentence()}</div>`,
      () => `<span>${fakerInstance.lorem.words(5)}</span>`,
      () => `<a href="${fakerInstance.internet.url()}">${fakerInstance.lorem.words(2)}</a>`,
      () => `<ul>\n  <li>${fakerInstance.lorem.sentence()}</li>\n  <li>${fakerInstance.lorem.sentence()}</li>\n  <li>${fakerInstance.lorem.sentence()}</li>\n</ul>`,
      () => `<ol>\n  <li>${fakerInstance.lorem.sentence()}</li>\n  <li>${fakerInstance.lorem.sentence()}</li>\n</ol>`,
      () => `<blockquote>${fakerInstance.lorem.paragraph()}</blockquote>`,
      () => `<img src="${fakerInstance.image.url()}" alt="${fakerInstance.lorem.words(2)}" />`,
      () => `<strong>${fakerInstance.lorem.words(3)}</strong>`,
      () => `<em>${fakerInstance.lorem.words(3)}</em>`,
      () => `<code>${fakerInstance.lorem.word()}.${fakerInstance.lorem.word()}()</code>`,
    ];
    
    let html = '';
    for (let i = 0; i < safeTagCount; i++) {
      const template = fakerInstance.helpers.arrayElement(tagTemplates);
      html += template() + '\n';
    }
    
    return html.trim();
  }

  // 生成随机XML内容
  public generateRandomXml(nodeCount: number): string {
    const currentLanguage = this.getCurrentLanguage();
    const fakerInstance = this.getFakerInstance(currentLanguage);
    const safeNodeCount = Math.max(1, Math.min(nodeCount, 100)); // 限制1-100个节点
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n';
    
    for (let i = 0; i < safeNodeCount; i++) {
      const nodeName = fakerInstance.lorem.word();
      const nodeValue = fakerInstance.helpers.arrayElement([
        fakerInstance.lorem.sentence(),
        fakerInstance.person.fullName(),
        fakerInstance.internet.email(),
        fakerInstance.number.int({ min: 1, max: 1000 }).toString(),
        fakerInstance.date.recent().toISOString(),
      ]);
      xml += `  <${nodeName}>${nodeValue}</${nodeName}>\n`;
    }
    
    xml += '</root>';
    return xml;
  }

  // 生成随机YAML内容
  public generateRandomYaml(keyCount: number): string {
    const currentLanguage = this.getCurrentLanguage();
    const fakerInstance = this.getFakerInstance(currentLanguage);
    const safeKeyCount = Math.max(1, Math.min(keyCount, 100)); // 限制1-100个键值对
    
    let yaml = '';
    
    for (let i = 0; i < safeKeyCount; i++) {
      const key = fakerInstance.lorem.word();
      const valueType = Math.random();
      
      let value: string;
      if (valueType < 0.3) {
        // 字符串值
        value = `"${fakerInstance.lorem.sentence()}"`;
      } else if (valueType < 0.5) {
        // 数字值
        value = fakerInstance.number.int({ min: 1, max: 1000 }).toString();
      } else if (valueType < 0.6) {
        // 布尔值
        value = fakerInstance.datatype.boolean().toString();
      } else if (valueType < 0.8) {
        // 简单数组
        value = `\n  - ${fakerInstance.lorem.word()}\n  - ${fakerInstance.lorem.word()}\n  - ${fakerInstance.lorem.word()}`;
      } else {
        // 嵌套对象
        value = `\n  name: "${fakerInstance.person.fullName()}"\n  email: "${fakerInstance.internet.email()}"`;
      }
      
      yaml += `${key}: ${value}\n`;
    }
    
    return yaml.trim();
  }

  // 生成随机CSV内容
  public generateRandomCsv(rowCount: number): string {
    const currentLanguage = this.getCurrentLanguage();
    const fakerInstance = this.getFakerInstance(currentLanguage);
    const safeRowCount = Math.max(1, Math.min(rowCount, 100)); // 限制1-100行
    
    // CSV表头
    let csv = 'id,name,email,phone,company,city,status\n';
    
    // 生成数据行
    for (let i = 0; i < safeRowCount; i++) {
      const row = [
        i + 1,
        `"${fakerInstance.person.fullName()}"`,
        fakerInstance.internet.email(),
        `"${fakerInstance.phone.number()}"`,
        `"${fakerInstance.company.name()}"`,
        `"${fakerInstance.location.city()}"`,
        fakerInstance.helpers.arrayElement(['active', 'inactive', 'pending'])
      ];
      csv += row.join(',') + '\n';
    }
    
    return csv.trim();
  }

  // 根据语言环境获取对应的 faker 实例
  public getFakerInstance(language: 'zh-cn' | 'zh-tw' | 'en' | 'ja') {
    try {
      switch (language) {
        case 'zh-cn':
          return fakerZH_CN;
        case 'zh-tw':
          // 繁体中文使用简体中文的 faker，内容类似
          return fakerZH_CN;
        case 'en':
          return fakerEN;
        case 'ja':
          return fakerJA;
        default:
          return fakerEN; // 默认使用英文
      }
    } catch (error) {
      return fakerEN;
    }
  }

  // 生成随机JSON数据
  public generateRandomJson(size: number): Record<string, unknown> {
    const currentLanguage = this.getCurrentLanguage();
    const fakerInstance = this.getFakerInstance(currentLanguage);
    const complexity = Math.min(Math.max(size, 1), 9999); // 1-9999个字段

    type RandomFieldGenerator = {
      baseKey: string;
      createValue: () => unknown;
    };

    const fieldTemplates: RandomFieldGenerator[] = [
      // 基础信息字段
      { baseKey: 'id', createValue: () => fakerInstance.string.uuid() },
      { baseKey: 'name', createValue: () => fakerInstance.person.fullName() },
      { baseKey: 'email', createValue: () => fakerInstance.internet.email() },
      { baseKey: 'phone', createValue: () => fakerInstance.phone.number() },
      { baseKey: 'address', createValue: () => fakerInstance.location.streetAddress() },
      { baseKey: 'city', createValue: () => fakerInstance.location.city() },
      { baseKey: 'country', createValue: () => fakerInstance.location.country() },
      { baseKey: 'company', createValue: () => fakerInstance.company.name() },
      { baseKey: 'department', createValue: () => fakerInstance.commerce.department() },
      { baseKey: 'jobTitle', createValue: () => fakerInstance.person.jobTitle() },

      // 数字和日期字段
      { baseKey: 'age', createValue: () => fakerInstance.number.int({ min: 18, max: 80 }) },
      { baseKey: 'score', createValue: () => fakerInstance.number.float({ min: 0, max: 100, fractionDigits: 2 }) },
      { baseKey: 'price', createValue: () => fakerInstance.commerce.price() },
      { baseKey: 'createdAt', createValue: () => fakerInstance.date.past().toISOString() },
      { baseKey: 'updatedAt', createValue: () => fakerInstance.date.recent().toISOString() },
      { baseKey: 'birthDate', createValue: () => fakerInstance.date.birthdate().toISOString() },

      // 布尔和状态字段
      { baseKey: 'isActive', createValue: () => fakerInstance.datatype.boolean() },
      { baseKey: 'isVerified', createValue: () => fakerInstance.datatype.boolean() },
      { baseKey: 'status', createValue: () => fakerInstance.helpers.arrayElement(['active', 'inactive', 'pending', 'completed']) },
      { baseKey: 'priority', createValue: () => fakerInstance.helpers.arrayElement(['low', 'medium', 'high', 'urgent']) },

      // 文本内容字段
      { baseKey: 'description', createValue: () => fakerInstance.lorem.sentence() },
      { baseKey: 'content', createValue: () => fakerInstance.lorem.paragraph() },
      { baseKey: 'notes', createValue: () => fakerInstance.lorem.words(10) },
      { baseKey: 'tags', createValue: () => fakerInstance.lorem.words(3).split(' ') },

      // 网络和技术字段
      { baseKey: 'website', createValue: () => fakerInstance.internet.url() },
      { baseKey: 'avatar', createValue: () => fakerInstance.image.avatar() },
      { baseKey: 'ipAddress', createValue: () => fakerInstance.internet.ip() },
      { baseKey: 'userAgent', createValue: () => fakerInstance.internet.userAgent() }
    ];

    const requiredFields: RandomFieldGenerator[] = [];
    if (complexity >= 5) {
      requiredFields.push({
        baseKey: 'metadata',
        createValue: () => ({
          version: fakerInstance.system.semver(),
          source: fakerInstance.helpers.arrayElement(['api', 'import', 'manual', 'system']),
          lastModified: fakerInstance.date.recent().toISOString(),
          permissions: fakerInstance.helpers.arrayElements(['read', 'write', 'delete', 'admin'], 2)
        })
      });
    }
    if (complexity >= 8) {
      requiredFields.push({
        baseKey: 'items',
        createValue: () => {
          const itemCount = Math.min(Math.floor(complexity / 4), 5);
          return Array.from({ length: itemCount }, () => ({
            id: fakerInstance.string.uuid(),
            name: fakerInstance.commerce.productName(),
            price: fakerInstance.commerce.price(),
            category: fakerInstance.commerce.department(),
            available: fakerInstance.datatype.boolean()
          }));
        }
      });
    }

    const jsonData: Record<string, unknown> = {};
    const keyCount: Record<string, number> = {};

    requiredFields.forEach(field => {
      jsonData[field.baseKey] = field.createValue();
      keyCount[field.baseKey] = 1;
    });

    for (let index = requiredFields.length; index < complexity; index += 1) {
      const template = fakerInstance.helpers.arrayElement(fieldTemplates);
      const currentCount = keyCount[template.baseKey] ?? 0;
      const suffix = currentCount === 0 ? '' : `_${currentCount}`;
      jsonData[`${template.baseKey}${suffix}`] = template.createValue();
      keyCount[template.baseKey] = currentCount + 1;
    }

    return jsonData;
  }

  // 获取当前语言环境
  public getCurrentLanguage(): 'zh-cn' | 'zh-tw' | 'en' | 'ja' {
    return runtime.getLanguage();
  }
  // 匹配HTTP方法
  public matchHttpMethod(requestMethod: string, allowedMethods: string[]): boolean {
    return allowedMethods.includes('ALL') || allowedMethods.includes(requestMethod.toUpperCase());
  }
  // 判断是否为服务器未启动的错误
  public isServerNotRunningError(error: any): boolean {
    return error && 
           (error.code === 'ERR_SERVER_NOT_RUNNING' || 
            (error.message && error.message.toLowerCase().includes('server is not running')));
  }
  // 检测文件 MIME 类型
  public getFileMimeType(filePath: string): string {
    try {
      // 首先尝试通过文件扩展名检测
      const mimeType = mime.lookup(filePath);
      if (mimeType) {
        return mimeType;
      }
      
      // 如果无法检测，返回默认类型
      return 'application/octet-stream';
    } catch (error) {
      return 'application/octet-stream';
    }
  }
  // 生成 Content-Disposition 响应头，支持中文文件名（RFC 5987）
  public generateContentDisposition(fileName: string, type: 'attachment' | 'inline' = 'attachment'): string {
    try {
      // 对于纯ASCII文件名，使用简单格式
      if (/^[\x20-\x7E]*$/.test(fileName)) {
        return `${type}; filename="${fileName}"`;
      }
      
      // 对于包含非ASCII字符（如中文）的文件名，使用 RFC 5987 编码
      // 同时提供 filename 和 filename* 两个参数以兼容不同的客户端
      const encodedFileName = encodeURIComponent(fileName);
      
      // filename 参数：使用ASCII近似值（移除非ASCII字符）
      const asciiFileName = fileName.replace(/[^\x20-\x7E]/g, '_');
      
      // filename* 参数：使用 UTF-8 编码（RFC 5987格式：charset'lang'encoded-value）
      return `${type}; filename="${asciiFileName}"; filename*=UTF-8''${encodedFileName}`;
    } catch (error) {
      // 降级到简单格式
      return `${type}; filename="download"`;
    }
  }
  // 读取文件数据
  public async readFileData(filePath: string): Promise<{ data: Buffer; mimeType: string }> {
    try {
      const resolvedPath = path.resolve(filePath);
      if (!fs.existsSync(resolvedPath)) {
        throw new Error(`文件不存在: ${filePath}`);
      }
      const stats = fs.statSync(resolvedPath);
      if (!stats.isFile()) {
        throw new Error(`路径不是文件: ${filePath}`);
      }
      const data = fs.readFileSync(resolvedPath);
      const mimeType = this.getFileMimeType(resolvedPath);
      
      return { data, mimeType };
    } catch (error) {
      throw new Error(`文件读取失败: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | SSE处理方法
  |--------------------------------------------------------------------------
  */
  // 生成SSE事件数据
  public generateSSEEventData(sseConfig: MockResponseConfig['sseConfig'], messageIndex: number): MockSSEEventData {
    const eventData: Partial<MockSSEEventData> = {};
    
    // 处理 id 字段
    if (sseConfig.event.id.enable) {
      switch (sseConfig.event.id.valueMode) {
        case 'increment':
          eventData.id = (messageIndex + 1).toString();
          break;
        case 'random':
          eventData.id = randomUUID();
          break;
        case 'timestamp':
          eventData.id = Date.now().toString();
          break;
        default:
          eventData.id = messageIndex.toString();
      }
    }
    
    // 处理 event 字段
    if (sseConfig.event.event.enable && sseConfig.event.event.value) {
      eventData.event = sseConfig.event.event.value;
    }
    
    // 处理 retry 字段
    if (sseConfig.event.retry.enable && sseConfig.event.retry.value > 0) {
      eventData.retry = sseConfig.event.retry.value;
    }
    
    // 处理 data 字段
    let dataContent: string;
    if (sseConfig.event.data.mode === 'json') {
      try {
        // 尝试解析为 JSON 对象，然后序列化
        const jsonData = JSON.parse(sseConfig.event.data.value || '{}');
        dataContent = JSON.stringify(jsonData);
      } catch (error) {
        dataContent = sseConfig.event.data.value || '{}';
      }
    } else {
      // string 模式直接使用值
      dataContent = sseConfig.event.data.value || '';
    }
    
    eventData.data = dataContent;
    
    return eventData as MockSSEEventData;
  }

  // 格式化SSE消息
  public formatSSEMessage(eventData: MockSSEEventData): string {
    let message = '';
    
    if (eventData.id !== undefined) {
      message += `id: ${eventData.id}\n`;
    }
    
    if (eventData.event !== undefined) {
      message += `event: ${eventData.event}\n`;
    }
    
    if (eventData.retry !== undefined) {
      message += `retry: ${eventData.retry}\n`;
    }
    
    // data 字段可能包含多行，需要按行处理
    const dataLines = eventData.data.split('\n');
    dataLines.forEach(line => {
      message += `data: ${line}\n`;
    });
    
    // SSE 消息以双换行结束
    message += '\n';
    
    return message;
  }

  /*
  |--------------------------------------------------------------------------
  | 图片生成方法
  |--------------------------------------------------------------------------
  */

  // 生成图片方法
  // randomSizeKB: 目标大小（KB），用于增加无用内容以接近目标体积
  public async generateImage(width: number, height: number, formats: string[] = ['png'], randomSizeKB?: number): Promise<Buffer> {
    try {
      // 确保尺寸在合理范围内
      const safeWidth = Math.max(1, Math.min(width || 400, 2000));
      const safeHeight = Math.max(1, Math.min(height || 300, 2000));
      const targetSizeBytes = Math.max(0, Math.floor((randomSizeKB || 0) * 1024));
      
      // 生成随机背景色
      const colors = [
        '#3498db', '#e74c3c', '#2ecc71', '#f39c12', 
        '#9b59b6', '#1abc9c', '#34495e', '#e67e22'
      ];
      const bgColor = colors[Math.floor(Math.random() * colors.length)];
      
      // 使用 sharp 创建一个纯色背景图片
      const format = formats[0] || 'png';
      
      // 创建 SVG 内容，因为 sharp 支持从 SVG 生成图片
      const svgContent = `
        <svg width="${safeWidth}" height="${safeHeight}" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="${bgColor}"/>
          <text 
            x="50%" 
            y="50%" 
            dominant-baseline="central" 
            text-anchor="middle" 
            fill="white" 
            font-family="Arial, sans-serif" 
            font-size="${Math.min(safeWidth, safeHeight) / 10}"
            font-weight="bold"
          >
            ${safeWidth} x ${safeHeight}
          </text>
        </svg>
      `;
      
      // 若请求生成 SVG，直接返回 SVG Buffer（不经 sharp 转换），并按需填充注释以增大体积
      if (format.toLowerCase() === 'svg') {
        let resultSvg = svgContent;
        if (targetSizeBytes > 0) {
          const baseLength = Buffer.byteLength(resultSvg);
          if (baseLength < targetSizeBytes) {
            const diff = targetSizeBytes - baseLength;
            // 计算注释结构自身的开销: \n + '<!-- ' + ' -->' + \n = 11 字节
            const commentOverhead = 11;
            const fillerLen = Math.max(0, diff - commentOverhead);
            const filler = 'x'.repeat(fillerLen);
            resultSvg = resultSvg.replace('</svg>', `\n<!-- ${filler} -->\n</svg>`);
          }
        }
        return Buffer.from(resultSvg);
      }

      // 使用 sharp 将 SVG 转换为指定格式的图片
      let sharpInstance = sharp(Buffer.from(svgContent));

      switch (format.toLowerCase()) {
        case 'png':
          sharpInstance = sharpInstance.png();
          break;
        case 'jpg':
        case 'jpeg':
          sharpInstance = sharpInstance.jpeg({ quality: 80 });
          break;
        case 'webp':
          sharpInstance = sharpInstance.webp();
          break;
        default:
          sharpInstance = sharpInstance.png();
      }
      
      const buffer = await sharpInstance.toBuffer();
      if (targetSizeBytes > 0 && buffer.length < targetSizeBytes) {
        const pad = targetSizeBytes - buffer.length;
        const padding = Buffer.alloc(pad, 0);
        return Buffer.concat([buffer, padding]);
      }
      return buffer;
    } catch (error) {
      console.error('图片生成失败:', error);
      // 返回一个最小的 PNG 图片 Buffer
      const fallbackSvg = `
        <svg width="200" height="150" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#cccccc"/>
          <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" fill="#666666" font-family="Arial">
            Error
          </text>
        </svg>
      `;
      return await sharp(Buffer.from(fallbackSvg)).png().toBuffer();
    }
  }

  /*
  |--------------------------------------------------------------------------
  | 响应处理方法
  |--------------------------------------------------------------------------
  */

  // 处理SSE类型响应
  public handleSseResponse(responseConfig: MockResponseConfig, ctx: Koa.Context): void {
    const { sseConfig } = responseConfig;
    const interval = Math.max(sseConfig.interval || 1000, 100); // 最小100ms间隔
    const maxNum = Math.max(sseConfig.maxNum || 10, 1); // 最少发送1条数据
    
    // 设置HTTP状态码
    ctx.status = 200;
    // 告诉Koa不要自动处理响应,我们手动控制
    ctx.respond = false;
    
    // 设置SSE响应头
    ctx.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });
    
    let messageCount = 0;
    let intervalId: NodeJS.Timeout | null = null;
    
    // 清理函数
    const cleanup = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };
    
    // 监听客户端断开连接
    ctx.req.on('close', () => {
      cleanup();
    });
    
    ctx.req.on('error', (error) => {
      console.error('SSE连接错误:', error);
      cleanup();
    });
    
    // 开始发送数据
    intervalId = setInterval(() => {
      try {
        // 检查是否已达到最大发送次数
        if (messageCount >= maxNum) {
          cleanup();
          ctx.res.end();
          return;
        }
        
        // 生成事件数据
        const eventData = this.generateSSEEventData(sseConfig, messageCount);
        const message = this.formatSSEMessage(eventData);
        
        // 发送数据
        ctx.res.write(message);
        messageCount++;

      } catch (error) {
        console.error('SSE消息发送失败:', error);
        cleanup();
        ctx.res.end();
      }
    }, interval);
    
    // 设置超时保护 (最多运行1小时)
    setTimeout(() => {
      if (intervalId) {
        cleanup();
        ctx.res.end();
      }
    }, 60 * 60 * 1000); // 1小时超时
  }

  // 处理JSON类型响应
  public async handleJsonResponse(
    responseConfig: MockResponseConfig, 
    variables: ApidocVariable[] = []
  ): Promise<Record<string, unknown>> {
    const { jsonConfig } = responseConfig;
    
    try {
      switch (jsonConfig.mode) {
        case 'fixed':
          // 固定模式：使用 getRealJson 解析并返回固定JSON数据，支持变量和表达式
          try {
            if (!jsonConfig.fixedData || jsonConfig.fixedData.trim() === '') {
              return {};
            }
            return await this.getRealJson(jsonConfig.fixedData, variables);
          } catch (parseError) {
            console.error('JSON解析错误:', parseError);
            return { 
              error: 'Invalid JSON format in fixed data',
              originalData: jsonConfig.fixedData,
              parseError: parseError instanceof Error ? parseError.message : 'Unknown parse error'
            };
          }
        
        case 'random':
          // 随机模式：使用faker生成随机JSON数据
          return this.generateRandomJson(jsonConfig.randomSize || 10);
        
        case 'randomAi': {
          const prompt = jsonConfig.prompt?.trim();
          if (!prompt) {
            return { error: 'AI生成失败：提示词不能为空' };
          }

          try {
            const aiJsonText = await globalAiManager.chatWithJsonText([prompt]);
            if (!aiJsonText) {
              return { error: 'AI生成失败：返回内容为空' };
            }
            try {
              return JSON.parse(aiJsonText) as Record<string, unknown>;
            } catch {
              return { error: 'AI生成失败：返回内容不是合法的JSON格式' };
            }
          } catch (aiError) {
            const errorMessage = aiError instanceof Error ? aiError.message : '未知错误';
            return { error: `AI生成失败：${errorMessage}` };
          }
        }
        
        default:
          try {
            if (jsonConfig.fixedData) {
              return JSON.parse(jsonConfig.fixedData);
            }
          } catch {
            // 如果固定数据也无法解析，返回默认JSON
          }
          return { message: 'Default JSON response', mode: jsonConfig.mode };
      }
    } catch (error) {
      console.error('JSON处理过程中发生错误:', error);
      return { 
        error: 'JSON generation failed',
        fallback: true,
        originalError: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 处理文本类型响应
  public async handleTextResponse(responseConfig: MockResponseConfig): Promise<string> {
    const { textConfig } = responseConfig;
    
    try {
      switch (textConfig.mode) {
        case 'fixed':
          // 固定模式：直接返回固定数据
          return textConfig.fixedData || '';
        
        case 'random':
          // 随机模式：根据textType生成对应格式的文本
          const textType = textConfig.textType || 'text/plain';
          const randomSize = textConfig.randomSize || 100;
          
          switch (textType) {
            case 'html':
              return this.generateRandomHtml(randomSize);
            case 'xml':
              return this.generateRandomXml(randomSize);
            case 'yaml':
              return this.generateRandomYaml(randomSize);
            case 'csv':
              return this.generateRandomCsv(randomSize);
            case 'text/plain':
            case 'any':
            default:
              return this.generateRandomText(randomSize);
          }
        
        case 'randomAi':
          // AI模式：调用AI生成，失败时降级到随机模式
          try {
            let prompt = textConfig.prompt || '请生成一段文本内容';
            const textType = textConfig.textType || 'text/plain';
            
            // 根据textType添加格式提示
            if (textType !== 'any') {
              const formatHints: Record<string, string> = {
                'text/plain': 'Generate plain text content.',
                'html': 'Generate content in HTML format.',
                'xml': 'Generate content in XML format.',
                'yaml': 'Generate content in YAML format.',
                'csv': 'Generate content in CSV format.',
              };
              const formatHint = formatHints[textType];
              if (formatHint) {
                prompt = `${formatHint} ${prompt}`;
              }
            }
            
            const aiText = await globalAiManager.chatWithText([prompt], 'DeepSeek', 300);
            return aiText;
          } catch (aiError) {
            // 降级时也根据textType生成对应格式
            const textType = textConfig.textType || 'text/plain';
            const randomSize = textConfig.randomSize || 100;
            
            switch (textType) {
              case 'html':
                return this.generateRandomHtml(randomSize);
              case 'xml':
                return this.generateRandomXml(randomSize);
              case 'yaml':
                return this.generateRandomYaml(randomSize);
              case 'csv':
                return this.generateRandomCsv(randomSize);
              case 'text/plain':
              case 'any':
              default:
                return this.generateRandomText(randomSize);
            }
          }
        
        default:
          return textConfig.fixedData || '默认文本内容';
      }
    } catch (error) {
      console.error('文本处理过程中发生错误:', error);
      return textConfig.fixedData || '文本生成失败，返回默认内容';
    }
  }

  // 处理图片类型响应
  public async handleImageResponse(responseConfig: MockResponseConfig): Promise<{ data: Buffer; mimeType: string }> {
    const { imageConfig } = responseConfig;
    
    try {
      switch (imageConfig.mode) {
        case 'fixed':
          // 固定模式：读取指定文件路径的图片数据
          try {
            if (!imageConfig.fixedFilePath || imageConfig.fixedFilePath.trim() === '') {
              throw new Error('未指定图片文件路径');
            }
            
            const { data, mimeType } = await this.readFileData(imageConfig.fixedFilePath);
            return { data, mimeType };
          } catch (fileError) {
            console.error('文件读取失败:', fileError);
            // 文件读取失败时，生成一个错误提示图片
            const errorBuffer = await this.generateImage(400, 300, ['png']);
            return { data: errorBuffer, mimeType: 'image/png' };
          }
        
        case 'random':
          // 随机模式：生成随机图片，显示尺寸信息
          const width = imageConfig.randomWidth || 400;
          const height = imageConfig.randomHeight || 300;
          
          // 确定图片格式
          const imageFormat = imageConfig.imageConfig || 'png';
          const formats = [imageFormat];
          const targetKB = imageConfig.randomSize || 0;
          const randomBuffer = await this.generateImage(width, height, formats, targetKB);
          
          // 根据格式返回对应的 MIME 类型
          let mimeType: string;
          switch (imageFormat.toLowerCase()) {
            case 'jpg':
            case 'jpeg':
              mimeType = 'image/jpeg';
              break;
            case 'png':
              mimeType = 'image/png';
              break;
            case 'webp':
              mimeType = 'image/webp';
              break;
            case 'svg':
              mimeType = 'image/svg+xml';
              break;
            default:
              mimeType = 'image/png';
          }
          
          return { data: randomBuffer, mimeType };
        
        default:
          // 默认生成一个简单的图片
          const defaultBuffer = await this.generateImage(200, 150, ['png']);
          return { data: defaultBuffer, mimeType: 'image/png' };
      }
    } catch (error) {
      console.error('图片处理过程中发生错误:', error);
      // 生成一个错误提示图片
      try {
        const errorBuffer = await this.generateImage(300, 200, ['png']);
        return { data: errorBuffer, mimeType: 'image/png' };
      } catch (fallbackError) {
        console.error('错误图片生成也失败:', fallbackError);
        // 返回一个最小的空 Buffer
        return { data: Buffer.alloc(0), mimeType: 'application/octet-stream' };
      }
    }
  }

  // 处理文件类型响应
  public async handleFileResponse(responseConfig: MockResponseConfig): Promise<FileResponseResult> {
    const { fileConfig } = responseConfig;
    
    try {
      // 根据fileType选择对应的样本文件
      const fileExtension = fileConfig.fileType;
      // 解析静态资源目录（兼容开发与打包环境）
      const staticDir = MockUtils.resolveStaticDir();
      const sampleFileName = `sample.${fileExtension}`;
      const filePath = path.join(staticDir, sampleFileName);
      
      // 读取文件数据
      const { data, mimeType } = await this.readFileData(filePath);

      // 生成 Content-Disposition 头
      const contentDisposition = this.generateContentDisposition(sampleFileName, 'attachment');

      return { data, mimeType, fileName: sampleFileName, contentDisposition };
    } catch (error) {
      console.error('文件类型响应处理失败:', error);
      
      // 生成一个错误提示文件 (使用简单的文本文件作为fallback)
      const errorMessage = `文件读取失败: ${error instanceof Error ? error.message : 'Unknown error'}\n文件类型: ${fileConfig.fileType}`;
      const errorBuffer = Buffer.from(errorMessage, 'utf-8');
      const errorFileName = `error-${fileConfig.fileType}.txt`;
      const contentDisposition = this.generateContentDisposition(errorFileName, 'attachment');
      
      return { 
        data: errorBuffer, 
        mimeType: 'text/plain',
        fileName: errorFileName,
        contentDisposition
      };
    }
  }

  // 解析静态资源根目录
  private static resolveStaticDir(): string {
    // 优先按 Electron 打包目录解析
    const candidates: string[] = [];
    if ((process as NodeJS.Process & { versions?: { electron?: string } }).versions?.electron) {
      candidates.push(path.join(process.resourcesPath, 'static'));
    }
    // 兼容构建产物目录
    candidates.push(path.resolve(process.cwd(), 'dist/static'));
    // 开发场景：源码目录
    candidates.push(path.resolve(process.cwd(), 'src/static'));
    // 通过当前模块目录反推到项目根再定位 src/static（dist/main/mock -> ../../../src/static）
    candidates.push(path.resolve(MockUtils.moduleDirname, '../../../src/static'));
    // 去重并返回第一个存在的目录
    const seen: Set<string> = new Set();
    for (const dir of candidates) {
      if (!seen.has(dir)) {
        seen.add(dir);
        if (fs.existsSync(dir)) return dir;
      }
    }
    return path.resolve(process.cwd(), 'src/static');
  }

  // 处理二进制类型响应
  public async handleBinaryResponse(responseConfig: MockResponseConfig): Promise<BinaryResponseResult> {
    const { binaryConfig } = responseConfig;
    
    try {
      // 检查文件路径是否提供
      if (!binaryConfig.filePath || binaryConfig.filePath.trim() === '') {
        throw new Error('未指定二进制文件路径');
      }
      
      // 读取指定路径的文件数据
      const { data, mimeType } = await this.readFileData(binaryConfig.filePath);

      return { data, mimeType };
    } catch (error) {
      console.error('二进制类型响应处理失败:', error);
      
      // 生成一个错误提示文件 (使用简单的文本文件作为fallback)
      const errorMessage = `二进制文件读取失败: ${error instanceof Error ? error.message : 'Unknown error'}\n文件路径: ${binaryConfig.filePath}`;
      const errorBuffer = Buffer.from(errorMessage, 'utf-8');
      
      return { 
        data: errorBuffer, 
        mimeType: 'text/plain'
      };
    }
  }

  // 根据数据类型分发到对应的处理函数
  public async processResponseByDataType(
    responseConfig: MockResponseConfig, 
    ctx?: Koa.Context,
    variables: ApidocVariable[] = []
  ): Promise<string | Record<string, unknown> | Buffer> {
    switch (responseConfig.dataType) {
      case 'sse':
        // SSE 类型需要 ctx 参数，如果没有则返回错误信息
        if (!ctx) {
          return { error: 'SSE requires context parameter' };
        }
        this.handleSseResponse(responseConfig, ctx);
        return 'SSE streaming started'; // 占位返回值，实际不会被使用
      case 'json':
        return await this.handleJsonResponse(responseConfig, variables);
      case 'text':
        return await this.handleTextResponse(responseConfig);
      case 'image': {
        const imageResult = await this.handleImageResponse(responseConfig);
        // 将 mimeType 信息存储到响应配置中，供后续设置 content-type 使用
        (responseConfig as any)._generatedMimeType = imageResult.mimeType;
        return imageResult.data;
      }
      case 'file': {
        const fileResult = await this.handleFileResponse(responseConfig);
        // 将 mimeType 和 contentDisposition 信息存储到响应配置中，供后续设置响应头使用
        (responseConfig as any)._generatedMimeType = fileResult.mimeType;
        (responseConfig as any)._generatedContentDisposition = fileResult.contentDisposition;
        return fileResult.data;
      }
      case 'binary': {
        const binaryResult = await this.handleBinaryResponse(responseConfig);
        // 将 mimeType 信息存储到响应配置中，供后续设置 content-type 使用
        (responseConfig as any)._generatedMimeType = binaryResult.mimeType;
        return binaryResult.data;
      }
      default:
        return { error: 'Unsupported data type', dataType: responseConfig.dataType };
    }
  }

  /*
  |--------------------------------------------------------------------------
  | getRealJson 相关辅助方法
  |--------------------------------------------------------------------------
  */

  // 将 ApidocVariable[] 转换为 Record<string, any>
  private getObjectVariable(variables: ApidocVariable[]): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const variable of variables) {
      const { name, value, type } = variable;
      
      // 根据类型转换值
      switch (type) {
        case 'number':
          result[name] = Number(value);
          break;
        case 'boolean':
          result[name] = value === 'true' || value === '1';
          break;
        case 'null':
          result[name] = null;
          break;
        case 'any':
          // 尝试解析为 JSON，失败则作为字符串
          try {
            result[name] = JSON.parse(value);
          } catch {
            result[name] = value;
          }
          break;
        case 'file':
          // 文件类型暂时保存路径字符串
          result[name] = variable.fileValue?.path || value;
          break;
        case 'string':
        default:
          result[name] = value;
          break;
      }
    }
    
    return result;
  }

  // 判断字符串是否为表达式
  private isExpression(str: string): boolean {
    const trimmed = str.trim();
    
    // 如果是纯数字，不视为表达式
    if (/^\d+(\.\d+)?$/.test(trimmed)) {
      return false;
    }
    
    // 如果是纯变量名（字母、数字、下划线），不视为表达式
    if (/^[a-zA-Z_]\w*$/.test(trimmed)) {
      return false;
    }
    
    // 包含运算符的视为表达式
    return /[+\-*/()%<>=!&|]/.test(trimmed);
  }
  // 解析Cookie字符串为对象
  private parseCookies(cookieHeader: string): Record<string, string> {
    const cookies: Record<string, string> = {};
    if (!cookieHeader || cookieHeader.trim() === '') {
      return cookies;
    }
    const pairs = cookieHeader.split(';');
    for (const pair of pairs) {
      const [key, ...valueParts] = pair.split('=');
      const trimmedKey = key?.trim();
      const value = valueParts.join('=').trim();
      if (trimmedKey) {
        cookies[trimmedKey] = decodeURIComponent(value || '');
      }
    }
    return cookies;
  }
  // 构建Express风格的req对象
  private buildRequestObject(ctx: Koa.Context, variables: Record<string, any>): any {
    const cookieHeader = (ctx.headers.cookie || '') as string;
    const cookies = this.parseCookies(cookieHeader);
    const timestamp = Date.now();
    const datetime = new Date(timestamp).toISOString();
    const secure = ctx.protocol === 'https';
    const xRequestedWith = ctx.headers['x-requested-with'];
    const xhr = (typeof xRequestedWith === 'string' ? xRequestedWith : '').toLowerCase() === 'xmlhttprequest';
    const search = ctx.search || '';
    const host = ctx.host || ctx.hostname;
    const origin = `${ctx.protocol}://${host}`;
    const req = {
      method: ctx.method,
      url: ctx.url,
      originalUrl: ctx.originalUrl || ctx.url,
      path: ctx.path,
      search: search,
      query: ctx.query,
      headers: ctx.headers,
      body: ctx.request.body || {},
      cookies: cookies,
      ip: ctx.ip,
      protocol: ctx.protocol,
      secure: secure,
      xhr: xhr,
      hostname: ctx.hostname,
      host: host,
      origin: origin,
      get: (headerName: string) => {
        const lowerName = headerName.toLowerCase();
        return ctx.headers[lowerName];
      },
      userAgent: ctx.headers['user-agent'] || '',
      contentType: ctx.headers['content-type'] || '',
      referer: ctx.headers['referer'] || ctx.headers['referrer'] || '',
      authorization: ctx.headers['authorization'] || '',
      accept: ctx.headers['accept'] || '',
      acceptLanguage: ctx.headers['accept-language'] || '',
      acceptEncoding: ctx.headers['accept-encoding'] || '',
      contentLength: parseInt(ctx.headers['content-length'] || '0', 10),
      timestamp: timestamp,
      datetime: datetime,
      params: {},
      variables: variables,
    };
    return req;
  }

  // 使用 Node.js vm 模块安全执行表达式
  private async evaluateExpressionWithIsolatedVM(
    expression: string,
    variables: Record<string, any>,
    consoleCollector?: ConsoleLogCollector
  ): Promise<any> {
    try {
      // 创建一个沙箱环境，包含变量和安全的全局对象
      const sandbox = {
        ...variables,
        Math: Math,
        Date: Date,
        JSON: JSON,
        String: String,
        Number: Number,
        Boolean: Boolean,
        Array: Array,
        Object: Object,
        console: consoleCollector ? this.createCustomConsole(consoleCollector) : console,
      };
      
      // 创建一个 VM 上下文
      const context = vm.createContext(sandbox);
      
      // 执行表达式并获取结果（设置超时为 1000ms）
      const script = new vm.Script(expression);
      const result = script.runInContext(context, { timeout: 1000 });
      
      return result;
    } catch (error) {
      console.error('表达式执行失败:', expression, error);
      throw new Error(`表达式执行错误: ${(error as Error).message}`);
    }
  }
  // 执行条件脚本，返回布尔值
  public async evaluateCondition(
    scriptCode: string,
    ctx: Koa.Context,
    projectId: string,
    consoleCollector?: ConsoleLogCollector
  ): Promise<boolean> {
    if (!scriptCode || scriptCode.trim() === '') {
      return true;
    }
    const projectVariables = MockUtils.getProjectVariables(projectId);
    const variablesObj = this.getObjectVariable(projectVariables);
    const req = this.buildRequestObject(ctx, variablesObj);
    try {
      const result = await this.evaluateExpressionWithIsolatedVM(
        `(() => { ${scriptCode} })()`, 
        { req },
        consoleCollector
      );
      return Boolean(result);
    } catch (error) {
      throw error;
    }
  }

  // 将模板字符串转换为真实值
  // 支持: {{ variable }}、{{ expression }}、{{ @xxx }}、\{{ }}
  private async convertTemplateValueToRealValue(
    stringValue: string,
    objectVariable: Record<string, any>
  ): Promise<any> {
    // 检查是否为单模板：整个字符串是一个 {{ }} 包裹的内容
    // 这种情况返回实际值，可能是数字、对象等，而不是字符串
    const isSingleMustachTemplate = stringValue.match(/^\s*\{\{\s*(.*?)\s*\}\}\s*$/);
    
    if (isSingleMustachTemplate) {
      const content = isSingleMustachTemplate[1];
      
      // 如果以 @ 开头，保留原始值
      if (content.startsWith('@')) {
        return content;
      }
      
      // 如果变量存在，直接返回变量值
      if (objectVariable[content] !== undefined) {
        return objectVariable[content];
      }
      
      // 检查是否为表达式
      if (this.isExpression(content)) {
        try {
          const result = await this.evaluateExpressionWithIsolatedVM(content, objectVariable);
          return result;
        } catch (error) {
          return isSingleMustachTemplate[0]; // 返回原始字符串
        }
      }
      
      // 既不是变量也不是表达式，返回原始字符串
      return isSingleMustachTemplate[0];
    }
    
    // 多模板或混合文本：替换所有 {{ }} 中的内容
    let result = stringValue;
    
    // 第一步：替换非转义的 {{ }} 中的变量和表达式
    const promises: Promise<void>[] = [];
    const replacements: Array<{ placeholder: string; value: string }> = [];
    
    // 使用正则匹配所有非转义的 {{ }}
    const regex = /(?<!\\)\{\{\s*(.*?)\s*\}\}/g;
    let match: RegExpExecArray | null;
    
    while ((match = regex.exec(stringValue)) !== null) {
      const fullMatch = match[0];
      const content = match[1];
      const placeholder = `__PLACEHOLDER_${replacements.length}__`;
      
      const promise = (async () => {
        // 如果以 @ 开头，保留原始内容
        if (content.startsWith('@')) {
          replacements.push({ placeholder, value: content });
          return;
        }
        
        // 如果变量存在，使用变量值
        if (objectVariable[content] !== undefined) {
          const value = objectVariable[content];
          replacements.push({ 
            placeholder, 
            value: typeof value === 'string' ? value : String(value)
          });
          return;
        }
        
        // 检查是否为表达式
        if (this.isExpression(content)) {
          try {
            const result = await this.evaluateExpressionWithIsolatedVM(content, objectVariable);
            replacements.push({ 
              placeholder, 
              value: typeof result === 'string' ? result : String(result)
            });
            return;
          } catch (error) {
            replacements.push({ placeholder, value: fullMatch });
            return;
          }
        }
        
        // 既不是变量也不是表达式，保留原始字符串
        replacements.push({ placeholder, value: fullMatch });
      })();
      
      promises.push(promise);
    }
    
    // 等待所有替换完成
    await Promise.all(promises);
    
    // 先用占位符替换所有 {{ }}
    let index = 0;
    result = result.replace(regex, () => {
      return `__PLACEHOLDER_${index++}__`;
    });
    
    // 然后用实际值替换占位符
    for (const { placeholder, value } of replacements) {
      result = result.replace(placeholder, value);
    }
    
    // 第二步：处理 @variable 格式（不在 {{ }} 中的）
    result = result.replace(/(@[^@\s]+)/g, (_, variableName: string) => {
      return variableName;
    });
    
    // 第三步：移除转义符 \ （\{{ 变成 {{，\@ 变成 @）
    result = result.replace(/\\(?=\{\{|@)/g, '');
    
    return result;
  }

  // 递归处理 JSON 对象的 value，替换所有表达式和变量
  private async processJsonValues(
    jsonData: any,
    objectVariable: Record<string, any>
  ): Promise<any> {
    // 处理 null
    if (jsonData === null) {
      return null;
    }
    
    // 处理基本类型
    const isSimpleValue = typeof jsonData === 'string' || 
                         typeof jsonData === 'number' || 
                         typeof jsonData === 'boolean';
    
    if (isSimpleValue) {
      // 只有字符串类型才需要处理模板
      if (typeof jsonData === 'string') {
        return await this.convertTemplateValueToRealValue(jsonData, objectVariable);
      }
      return jsonData;
    }
    
    // 处理数组
    if (Array.isArray(jsonData)) {
      const result: any[] = [];
      for (const item of jsonData) {
        const processedItem = await this.processJsonValues(item, objectVariable);
        result.push(processedItem);
      }
      return result;
    }
    
    // 处理对象
    if (typeof jsonData === 'object') {
      const result: Record<string, any> = {};
      for (const key in jsonData) {
        const value = jsonData[key];
        const processedValue = await this.processJsonValues(value, objectVariable);
        result[key] = processedValue;
      }
      return result;
    }
    
    return jsonData;
  }

  // 处理 JSON 对象的 key，支持 key 中的表达式
  private async processJsonKeys(
    jsonData: any,
    objectVariable: Record<string, any>
  ): Promise<any> {
    // 处理 null 和基本类型
    if (jsonData === null || typeof jsonData !== 'object') {
      return jsonData;
    }
    
    // 处理数组：递归处理数组中的每个元素
    if (Array.isArray(jsonData)) {
      const result: any[] = [];
      for (const item of jsonData) {
        const processedItem = await this.processJsonKeys(item, objectVariable);
        result.push(processedItem);
      }
      return result;
    }
    
    // 处理对象：替换 key 中的表达式
    const result: Record<string, any> = {};
    
    for (const key in jsonData) {
      const value = jsonData[key];
      
      // 处理 key（如果包含模板或表达式）
      let newKey = key;
      if (key.includes('{{')) {
        const processedKey = await this.convertTemplateValueToRealValue(key, objectVariable);
        // 确保 key 是字符串
        newKey = typeof processedKey === 'string' ? processedKey : String(processedKey);
      }
      
      // 递归处理 value
      const processedValue = await this.processJsonKeys(value, objectVariable);
      
      // 注意：这里不考虑 key 冲突，后面的会覆盖前面的
      result[newKey] = processedValue;
    }
    
    return result;
  }

  /*
  |--------------------------------------------------------------------------
  | getRealJson 主方法
  |--------------------------------------------------------------------------
  */

  // 解析 JSON 字符串并处理变量和表达式
  public async getRealJson(
    strJson: string,
    variables: ApidocVariable[]
  ): Promise<Record<string, any>> {
    // 参数验证
    if (!strJson || !strJson.trim()) {
      return {};
    }
    
    try {
      // 步骤1: 将变量数组转换为对象
      const objectVariable = this.getObjectVariable(variables);
      
      // 步骤2: 使用 json5 解析 JSON 字符串（支持更灵活的 JSON 格式）
      const jsonObject = json5.parse(strJson);
      
      // 步骤3: 处理 JSON 对象的所有 value
      const processedValues = await this.processJsonValues(jsonObject, objectVariable);
      
      // 步骤4: 处理 JSON 对象的所有 key
      const processedKeys = await this.processJsonKeys(processedValues, objectVariable);
      
      return processedKeys;
      
    } catch (error) {
      console.error('getRealJson 解析失败:', error);
      throw new Error(
        `JSON 数据格式解析错误\n原始数据：${strJson}\n错误信息：${(error as Error).message}`
      );
    }
  }
}
