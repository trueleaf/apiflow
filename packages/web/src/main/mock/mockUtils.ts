import { MockHttpNode, MockSSEEventData } from '@src/types/mock/mock';
import { aiManager } from '../ai/ai';
import { fakerZH_CN, fakerEN, fakerJA } from '@faker-js/faker';
import sharp from 'sharp';
import mime from 'mime-types';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import Koa from 'koa';
import { runtime } from '../runtime/runtime';

type MockResponseConfig = MockHttpNode['response'][0];
export class MockUtils {
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
    const complexity = Math.min(Math.max(Math.floor(size / 20), 1), 20); // 1-20个字段
    const jsonData: Record<string, unknown> = {};
    const fieldTypes = [
      // 基础信息字段
      () => ({ id: fakerInstance.string.uuid() }),
      () => ({ name: fakerInstance.person.fullName() }),
      () => ({ email: fakerInstance.internet.email() }),
      () => ({ phone: fakerInstance.phone.number() }),
      () => ({ address: fakerInstance.location.streetAddress() }),
      () => ({ city: fakerInstance.location.city() }),
      () => ({ country: fakerInstance.location.country() }),
      () => ({ company: fakerInstance.company.name() }),
      () => ({ department: fakerInstance.commerce.department() }),
      () => ({ jobTitle: fakerInstance.person.jobTitle() }),
      
      // 数字和日期字段
      () => ({ age: fakerInstance.number.int({ min: 18, max: 80 }) }),
      () => ({ score: fakerInstance.number.float({ min: 0, max: 100, fractionDigits: 2 }) }),
      () => ({ price: fakerInstance.commerce.price() }),
      () => ({ createdAt: fakerInstance.date.past().toISOString() }),
      () => ({ updatedAt: fakerInstance.date.recent().toISOString() }),
      () => ({ birthDate: fakerInstance.date.birthdate().toISOString() }),
      
      // 布尔和状态字段
      () => ({ isActive: fakerInstance.datatype.boolean() }),
      () => ({ isVerified: fakerInstance.datatype.boolean() }),
      () => ({ status: fakerInstance.helpers.arrayElement(['active', 'inactive', 'pending', 'completed']) }),
      () => ({ priority: fakerInstance.helpers.arrayElement(['low', 'medium', 'high', 'urgent']) }),
      
      // 文本内容字段
      () => ({ description: fakerInstance.lorem.sentence() }),
      () => ({ content: fakerInstance.lorem.paragraph() }),
      () => ({ notes: fakerInstance.lorem.words(10) }),
      () => ({ tags: fakerInstance.lorem.words(3).split(' ') }),
      
      // 网络和技术字段
      () => ({ website: fakerInstance.internet.url() }),
      () => ({ avatar: fakerInstance.image.avatar() }),
      () => ({ ipAddress: fakerInstance.internet.ip() }),
      () => ({ userAgent: fakerInstance.internet.userAgent() }),
    ];
    const selectedFields = fakerInstance.helpers.arrayElements(fieldTypes, complexity);
    selectedFields.forEach(fieldGenerator => {
      Object.assign(jsonData, fieldGenerator());
    });
    if (complexity >= 5) {
      jsonData.metadata = {
        version: fakerInstance.system.semver(),
        source: fakerInstance.helpers.arrayElement(['api', 'import', 'manual', 'system']),
        lastModified: fakerInstance.date.recent().toISOString(),
        permissions: fakerInstance.helpers.arrayElements(['read', 'write', 'delete', 'admin'], 2)
      };
    }
    if (complexity >= 8) {
      const itemCount = Math.min(Math.floor(complexity / 4), 5);
      jsonData.items = Array.from({ length: itemCount }, () => ({
        id: fakerInstance.string.uuid(),
        name: fakerInstance.commerce.productName(),
        price: fakerInstance.commerce.price(),
        category: fakerInstance.commerce.department(),
        available: fakerInstance.datatype.boolean()
      }));
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
      console.warn('MIME类型检测失败:', error);
      return 'application/octet-stream';
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
        console.warn('SSE data JSON解析失败，使用原始字符串:', error);
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
  public async generateImage(width: number, height: number, formats: string[] = ['png']): Promise<Buffer> {
    try {
      // 确保尺寸在合理范围内
      const safeWidth = Math.max(1, Math.min(width || 400, 2000));
      const safeHeight = Math.max(1, Math.min(height || 300, 2000));
      
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
      
      return await sharpInstance.toBuffer();
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
    // 设置SSE响应头
    ctx.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });
    
    // 立即发送一个空的数据包来建立连接
    ctx.res.write(': SSE connection established\n\n');
    
    let messageCount = 0;
    let intervalId: NodeJS.Timeout | null = null;
    
    // 清理函数
    const cleanup = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      console.log(`SSE连接清理完成，共发送了 ${messageCount} 条消息`);
    };
    
    // 监听客户端断开连接
    ctx.req.on('close', () => {
      console.log('SSE客户端断开连接');
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
          console.log(`SSE已发送完所有数据 (${maxNum} 条)，结束连接`);
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
        
        console.log(`发送SSE消息 ${messageCount}/${maxNum}:`, { 
          id: eventData.id, 
          event: eventData.event,
          dataLength: eventData.data.length 
        });
        
      } catch (error) {
        console.error('SSE消息发送失败:', error);
        cleanup();
        ctx.res.end();
      }
    }, interval);
    
    // 设置超时保护 (最多运行1小时)
    setTimeout(() => {
      if (intervalId) {
        console.log('SSE连接超时，强制关闭');
        cleanup();
        ctx.res.end();
      }
    }, 60 * 60 * 1000); // 1小时超时
  }

  // 处理JSON类型响应
  public async handleJsonResponse(responseConfig: MockResponseConfig): Promise<Record<string, unknown>> {
    console.log('处理JSON类型响应:', {
      dataType: responseConfig.dataType,
      jsonConfig: responseConfig.jsonConfig
    });

    const { jsonConfig } = responseConfig;
    
    try {
      switch (jsonConfig.mode) {
        case 'fixed':
          // 固定模式：解析并返回固定JSON数据
          try {
            if (!jsonConfig.fixedData || jsonConfig.fixedData.trim() === '') {
              return { message: 'No fixed data provided' };
            }
            return JSON.parse(jsonConfig.fixedData);
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
        
        case 'randomAi':
          // AI模式：调用AI生成JSON，失败时降级到随机模式
          try {
            const ai = new aiManager();
            const prompt = jsonConfig.prompt || '请生成一个JSON对象数据';
            const aiJsonText = await ai.chatWithJsonText([prompt], 'DeepSeek', jsonConfig.randomSize || 200);
            
            // 尝试解析AI返回的JSON
            try {
              return JSON.parse(aiJsonText);
            } catch (aiParseError) {
              console.warn('AI返回的JSON格式无效，降级到随机模式:', aiParseError);
              return this.generateRandomJson(jsonConfig.randomSize || 10);
            }
          } catch (aiError) {
            console.warn('AI JSON生成失败，降级到随机模式:', aiError);
            return this.generateRandomJson(jsonConfig.randomSize || 10);
          }
        
        default:
          console.warn('未知的JSON配置模式:', jsonConfig.mode);
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
    console.log('处理文本类型响应:', {
      dataType: responseConfig.dataType,
      textConfig: responseConfig.textConfig
    });

    const { textConfig } = responseConfig;
    
    try {
      switch (textConfig.mode) {
        case 'fixed':
          // 固定模式：直接返回固定数据
          return textConfig.fixedData || '';
        
        case 'random':
          // 随机模式：根据语言环境和大小生成随机文本
          return this.generateRandomText(textConfig.randomSize || 100);
        
        case 'randomAi':
          // AI模式：调用AI生成，失败时降级到随机模式
          try {
            const ai = new aiManager();
            const prompt = textConfig.prompt || '请生成一段文本内容';
            const aiText = await ai.chatWithText([prompt], 'DeepSeek', textConfig.randomSize || 100);
            return aiText;
          } catch (aiError) {
            console.warn('AI文本生成失败，降级到随机模式:', aiError);
            return this.generateRandomText(textConfig.randomSize || 100);
          }
        
        default:
          console.warn('未知的文本配置模式:', textConfig.mode);
          return textConfig.fixedData || '默认文本内容';
      }
    } catch (error) {
      console.error('文本处理过程中发生错误:', error);
      return textConfig.fixedData || '文本生成失败，返回默认内容';
    }
  }

  // 处理图片类型响应
  public async handleImageResponse(responseConfig: MockResponseConfig): Promise<{ data: Buffer; mimeType: string }> {
    console.log('处理图片类型响应:', {
      dataType: responseConfig.dataType,
      imageConfig: responseConfig.imageConfig
    });

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
          
          const randomBuffer = await this.generateImage(width, height, formats);
          
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
          console.warn('未知的图片配置模式:', imageConfig.mode);
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
  public async handleFileResponse(responseConfig: MockResponseConfig): Promise<{ data: Buffer; mimeType: string }> {
    console.log('处理文件类型响应:', {
      dataType: responseConfig.dataType,
      fileConfig: responseConfig.fileConfig
    });

    const { fileConfig } = responseConfig;
    
    try {
      // 根据fileType选择对应的样本文件
      const fileExtension = fileConfig.fileType;
      const staticDir = path.join(__dirname, '../../static');
      const sampleFileName = `sample.${fileExtension}`;
      const filePath = path.join(staticDir, sampleFileName);
      
      console.log('尝试读取文件:', filePath);
      
      // 读取文件数据
      const { data, mimeType } = await this.readFileData(filePath);
      
      console.log('文件读取成功:', { 
        fileSize: data.length, 
        mimeType,
        fileName: sampleFileName 
      });
      
      return { data, mimeType };
    } catch (error) {
      console.error('文件类型响应处理失败:', error);
      
      // 生成一个错误提示文件 (使用简单的文本文件作为fallback)
      const errorMessage = `文件读取失败: ${error instanceof Error ? error.message : 'Unknown error'}\n文件类型: ${fileConfig.fileType}`;
      const errorBuffer = Buffer.from(errorMessage, 'utf-8');
      
      return { 
        data: errorBuffer, 
        mimeType: 'text/plain' 
      };
    }
  }

  // 处理二进制类型响应
  public async handleBinaryResponse(responseConfig: MockResponseConfig): Promise<{ data: Buffer; mimeType: string }> {
    console.log('处理二进制类型响应:', {
      dataType: responseConfig.dataType,
      binaryConfig: responseConfig.binaryConfig
    });

    const { binaryConfig } = responseConfig;
    
    try {
      // 检查文件路径是否提供
      if (!binaryConfig.filePath || binaryConfig.filePath.trim() === '') {
        throw new Error('未指定二进制文件路径');
      }
      
      console.log('尝试读取二进制文件:', binaryConfig.filePath);
      
      // 读取指定路径的文件数据
      const { data, mimeType } = await this.readFileData(binaryConfig.filePath);
      
      console.log('二进制文件读取成功:', { 
        fileSize: data.length, 
        mimeType,
        filePath: binaryConfig.filePath 
      });
      
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
  public async processResponseByDataType(responseConfig: MockResponseConfig, ctx?: Koa.Context): Promise<string | Record<string, unknown> | Buffer> {
    switch (responseConfig.dataType) {
      case 'sse':
        // SSE 类型需要 ctx 参数，如果没有则返回错误信息
        if (!ctx) {
          return { error: 'SSE requires context parameter' };
        }
        this.handleSseResponse(responseConfig, ctx);
        return 'SSE streaming started'; // 占位返回值，实际不会被使用
      case 'json':
        return await this.handleJsonResponse(responseConfig);
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
        // 将 mimeType 信息存储到响应配置中，供后续设置 content-type 使用
        (responseConfig as any)._generatedMimeType = fileResult.mimeType;
        return fileResult.data;
      }
      case 'binary': {
        const binaryResult = await this.handleBinaryResponse(responseConfig);
        // 将 mimeType 信息存储到响应配置中，供后续设置 content-type 使用
        (responseConfig as any)._generatedMimeType = binaryResult.mimeType;
        return binaryResult.data;
      }
      default:
        console.log('未知的数据类型:', responseConfig.dataType);
        return { error: 'Unsupported data type', dataType: responseConfig.dataType };
    }
  }
}