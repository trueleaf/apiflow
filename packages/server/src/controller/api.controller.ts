import { Inject, Controller, All, Body, Post, Get } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { UserService } from '../service/security/user.js';
import { InjectEntityModel } from '@midwayjs/typegoose';
import { User } from '../entity/security/user.js';
import { ReturnModelType } from '@typegoose/typegoose';
// import { sleep } from '../utils/utils.js';
import path, { dirname } from 'node:path';
import fs from 'node:fs'
import { fileURLToPath } from 'node:url';
// import { PassThrough } from 'node:stream';
// import { PassThrough } from 'node:stream';

@Controller('/api')
export class APIController {
  @Inject()
    ctx: Context;

  @Inject()
    userService: UserService;

  @InjectEntityModel(User)
    userModel: ReturnModelType<typeof User>;


  @All('/test/request_method')
  async methodTest() {
    console.log('method test')
    return {
      method: this.ctx.method,
    };
  }
  @All('/test/query_params/*')
  async queryTest() {
    console.log('query test', this.ctx.query)
    return {
      query: this.ctx.query,
      path: this.ctx.path,
    };
  }
  @All('/test/request_info/**')
  async requestInfoTest() {
    // const rawBody = await new Promise((resolve, reject) => {
    //   let data = '';
    //   this.ctx.req.setEncoding('utf8');
    //   this.ctx.req.on('data', chunk => {
    //     data += chunk
    //   });
    //   this.ctx.req.on('end', () => resolve(data));
    // });
    console.log('request_info test', this.ctx.fields)
    return {
      query: this.ctx.query,
      path: this.ctx.path,
      body: this.ctx.request.body,
      // rawBody,
      files: this.ctx.files,
      fields: this.ctx.fields,
      headers: this.ctx.headers,
    };
  }
  @All('/test/raw_body')
  async rawBodyTest() {
    console.log('rawBody test')
    const rawBody = await new Promise((resolve) => {
      let data = '';
      this.ctx.req.setEncoding('utf8');
      this.ctx.req.on('data', chunk => {
        data += chunk
      });
      this.ctx.req.on('end', () => resolve(data));
    });
    return {
      rawBody,
    };
  }
  @All('/test/binary')
  async binaryTest() {
    console.log('binaryTest')
    const rawBody = await new Promise((resolve) => {
      let data = '';
      this.ctx.req.setEncoding('utf8');
      this.ctx.req.on('data', chunk => {
        data += chunk
      });
      this.ctx.req.on('end', () => resolve(data));
    });
    return {
      path: this.ctx.path,
      rawBody,
      headers: this.ctx.headers,
    };
  }
  @All('/test/response/**')
  async responseTest(@Body() params: { type: string, size: 'normal' | 'large' }) {
    const __dirname = dirname(fileURLToPath(import.meta.url));
    // const data = await this.userModel.find();
    if (params.type === 'json' && params.size === 'normal') {
      const filePath = path.resolve(__dirname, '../../public/response_test/text/res.json');
      this.ctx.set('Content-Type', 'application/json; charset=utf-8');
      const dataBuffer = fs.readFileSync(filePath);
      return dataBuffer;
    } else if (params.type === 'css' && params.size === 'normal') {
      const filePath = path.resolve(__dirname, '../../public/response_test/text/res.css');
      this.ctx.set('Content-Type', 'text/css; charset=utf-8');
      const dataBuffer = fs.readFileSync(filePath);
      return dataBuffer;
    } else if (params.type === 'js' && params.size === 'normal') {
      const filePath = path.resolve(__dirname, '../../public/response_test/text/res.js');
      this.ctx.set('Content-Type', 'application/javascript; charset=utf-8');
      const dataBuffer = fs.readFileSync(filePath);
      return dataBuffer;
    } else if (params.type === 'html' && params.size === 'normal') {
      const filePath = path.resolve(__dirname, '../../public/response_test/text/res.html');
      this.ctx.set('Content-Type', 'text/html; charset=utf-8');
      const dataBuffer = fs.readFileSync(filePath);
      return dataBuffer;
    } else if (params.type === 'txt' && params.size === 'normal') {
      const filePath = path.resolve(__dirname, '../../public/response_test/text/res.txt');
      this.ctx.set('Content-Type', 'text/plain; charset=utf-8');
      const dataBuffer = fs.readFileSync(filePath);
      return dataBuffer;
    } else if (params.type === 'xml' && params.size === 'normal') {
      const filePath = path.resolve(__dirname, '../../public/response_test/text/res.xml');
      this.ctx.set('Content-Type', 'application/xml; charset=utf-8');
      const dataBuffer = fs.readFileSync(filePath);
      return dataBuffer;
    } else if (params.type === 'csv' && params.size === 'normal') {
      const filePath = path.resolve(__dirname, '../../public/response_test/text/res.csv');
      this.ctx.set('Content-Type', 'text/csv; charset=utf-8');
      const dataBuffer = fs.readFileSync(filePath);
      return dataBuffer;
    } else if (params.type === 'doc') {
      const filePath = path.resolve(__dirname, '../../public/response_test/office/res.doc');
      this.ctx.set('Content-Type', 'application/msword; charset=utf-8');
      const dataBuffer = fs.readFileSync(filePath);
      return dataBuffer;
    } else if (params.type === 'docx') {
      const filePath = path.resolve(__dirname, '../../public/response_test/office/res.docx');
      this.ctx.set('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document; charset=utf-8');
      const dataBuffer = fs.readFileSync(filePath);
      return dataBuffer;
    } else if (params.type === 'pdf') {
      const filePath = path.resolve(__dirname, '../../public/response_test/office/res.pdf');
      this.ctx.set('Content-Type', 'application/pdf; charset=utf-8');
      const dataBuffer = fs.readFileSync(filePath);
      return dataBuffer;
    } else if (params.type === 'xls') {
      const filePath = path.resolve(__dirname, '../../public/response_test/office/res.xls');
      this.ctx.set('Content-Type', 'application/vnd.ms-excel; charset=utf-8');
      const dataBuffer = fs.readFileSync(filePath);
      return dataBuffer;
    } else if (params.type === 'xlsx') {
      const filePath = path.resolve(__dirname, '../../public/response_test/office/res.xlsx');
      this.ctx.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=utf-8');
      const dataBuffer = fs.readFileSync(filePath);
      return dataBuffer;
    } else if (params.type === 'ppt') {
      const filePath = path.resolve(__dirname, '../../public/response_test/office/res.ppt');
      this.ctx.set('Content-Type', 'application/vnd.ms-powerpoint; charset=utf-8');
      const dataBuffer = fs.readFileSync(filePath);
      return dataBuffer;
    } else if (params.type === 'pptx') {
      const filePath = path.resolve(__dirname, '../../public/response_test/office/res.pptx');
      this.ctx.set('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation; charset=utf-8');
      const dataBuffer = fs.readFileSync(filePath);
      return dataBuffer;
    } else if (params.type === 'jpg') {
      const filePath = path.resolve(__dirname, '../../public/response_test/img/res.jpg');
      this.ctx.set('Content-Type', 'image/jpeg');
      const dataBuffer = fs.readFileSync(filePath);
      return dataBuffer;
    } else if (params.type === 'png') {
      const filePath = path.resolve(__dirname, '../../public/response_test/img/res.png');
      this.ctx.set('Content-Type', 'image/png');
      const dataBuffer = fs.readFileSync(filePath);
      return dataBuffer;
    } else if (params.type === 'gif') {
      const filePath = path.resolve(__dirname, '../../public/response_test/img/res.gif');
      this.ctx.set('Content-Type', 'image/gif');
      const dataBuffer = fs.readFileSync(filePath);
      return dataBuffer;
    } else if (params.type === 'webp') {
      const filePath = path.resolve(__dirname, '../../public/response_test/img/res.webp');
      this.ctx.set('Content-Type', 'image/webp');
      const dataBuffer = fs.readFileSync(filePath);
      return dataBuffer;
    } else if (params.type === 'bmp') {
      const filePath = path.resolve(__dirname, '../../public/response_test/img/res.bmp');
      this.ctx.set('Content-Type', 'image/bmp');
      const dataBuffer = fs.readFileSync(filePath);
      return dataBuffer;
    } else if (params.type === 'svg') {
      const filePath = path.resolve(__dirname, '../../public/response_test/img/res.svg');
      this.ctx.set('Content-Type', 'image/svg+xml');
      const dataBuffer = fs.readFileSync(filePath);
      return dataBuffer;
    } else if (params.type === 'ico') {
      const filePath = path.resolve(__dirname, '../../public/response_test/img/res.ico');
      this.ctx.set('Content-Type', 'image/x-icon');
      const dataBuffer = fs.readFileSync(filePath);
      return dataBuffer;
    } else if (params.type === 'wav') {
      const filePath = path.resolve(__dirname, '../../public/response_test/video_audio/res.wav');
      this.ctx.set('Content-Type', 'audio/wav');
      const dataBuffer = fs.readFileSync(filePath);
      return dataBuffer;
    } else if (params.type === 'mp3') {
      const filePath = path.resolve(__dirname, '../../public/response_test/video_audio/res.mp3');
      this.ctx.set('Content-Type', 'audio/mpeg');
      const dataBuffer = fs.readFileSync(filePath);
      return dataBuffer;
    } else if (params.type === 'flac') {
      const filePath = path.resolve(__dirname, '../../public/response_test/video_audio/res.flac');
      this.ctx.set('Content-Type', 'audio/flac');
      const dataBuffer = fs.readFileSync(filePath);
      return dataBuffer;
    } else if (params.type === 'ogg') {
      const filePath = path.resolve(__dirname, '../../public/response_test/video_audio/res.ogg');
      this.ctx.set('Content-Type', 'audio/ogg');
      const dataBuffer = fs.readFileSync(filePath);
      return dataBuffer;
    } else if (params.type === 'mp4') {
      const filePath = path.resolve(__dirname, '../../public/response_test/video_audio/res.mp4');
      this.ctx.set('Content-Type', 'video/mp4');
      const dataBuffer = fs.readFileSync(filePath);
      return dataBuffer;
    } else if (params.type === 'avi') {
      const filePath = path.resolve(__dirname, '../../public/response_test/video_audio/res.avi');
      this.ctx.set('Content-Type', 'video/x-msvideo');
      const dataBuffer = fs.readFileSync(filePath);
      return dataBuffer;
    } else if (params.type === 'mkv') {
      const filePath = path.resolve(__dirname, '../../public/response_test/video_audio/res.mkv');
      this.ctx.set('Content-Type', 'video/x-matroska');
      const dataBuffer = fs.readFileSync(filePath);
      return dataBuffer;
    } else if (params.type === 'mov') {
      const filePath = path.resolve(__dirname, '../../public/response_test/video_audio/res.mov');
      this.ctx.set('Content-Type', 'video/quicktime');
      const dataBuffer = fs.readFileSync(filePath);
      return dataBuffer;
    } else if (params.type === 'webm') {
      const filePath = path.resolve(__dirname, '../../public/response_test/video_audio/res.webm');
      this.ctx.set('Content-Type', 'video/webm');
      const dataBuffer = fs.readFileSync(filePath);
      return dataBuffer;
    } else if (params.type === 'zip') {
      const filePath = path.resolve(__dirname, '../../public/response_test/archive/res.zip');
      this.ctx.set('Content-Type', 'application/zip');
      const dataBuffer = fs.readFileSync(filePath);
      return dataBuffer;
    } else if (params.type === 'rar') {
      const filePath = path.resolve(__dirname, '../../public/response_test/archive/res.rar');
      this.ctx.set('Content-Type', 'application/vnd.rar');
      const dataBuffer = fs.readFileSync(filePath);
      return dataBuffer;
    } else if (params.type === '7z') {
      const filePath = path.resolve(__dirname, '../../public/response_test/archive/res.7z');
      this.ctx.set('Content-Type', 'application/x-7z-compressed');
      const dataBuffer = fs.readFileSync(filePath);
      return dataBuffer;
    } else if (params.type === 'tar') {
      const filePath = path.resolve(__dirname, '../../public/response_test/archive/res.tar');
      this.ctx.set('Content-Type', 'application/x-tar');
      const dataBuffer = fs.readFileSync(filePath);
      return dataBuffer;
    } else if (params.type === 'exe') {
      const filePath = path.resolve(__dirname, '../../public/response_test/other/res.exe');
      this.ctx.set('Content-Type', 'application/x-msdownload');
      const dataBuffer = fs.readFileSync(filePath);
      return dataBuffer;
    } else if (params.type === 'epub') {
      const filePath = path.resolve(__dirname, '../../public/response_test/other/res.epub');
      this.ctx.set('Content-Type', 'application/epub');
      const dataBuffer = fs.readFileSync(filePath);
      return dataBuffer;
    }
  }
  @All('/test/redirect/**')
  async redirectTest() {
    console.log('redirect test')
    const url = this.ctx.query.url;
    if (!url) {
      return { error: 'No URL provided for redirect' };
    }
    this.ctx.redirect(url as string);
    return { message: 'Redirecting to ' + url };
  }
  @All('/test/redirect2/**')
  async redirectTest2() {
    this.ctx.redirect('https://www.baidu.com');
    return { message: 'Redirecting to ' + 'https://www.baidu.com' };
  }
  @Post('/test/cookies/**')
  async cookiesTest() {
    // 设置多种cookie，全部去除 signed
    this.ctx.cookies.set('name_value_cookie', 'name_value_value', { httpOnly: false, signed: false });
    this.ctx.cookies.set('domain_cookie', 'domain_value', { httpOnly: false, signed: false, domain: 'demo.com' });
    this.ctx.cookies.set('domain_cookie2', 'domain_value2', { httpOnly: false, signed: false, domain: '.demo.com' });
    this.ctx.cookies.set('local_domain_cookie', 'domain_value', { httpOnly: false, signed: false, domain: '127.0.0.1' });
    this.ctx.cookies.set('path_cookie', 'path_value', { path: '/api/test/cookies', httpOnly: false, signed: false });
    this.ctx.cookies.set('http_only_cookie', 'http_only_value', { httpOnly: true, signed: false });
    this.ctx.cookies.set('expires_cookie', 'expires_value', { maxAge: 60 * 1000, signed: false }); // 1分钟
    // this.ctx.cookies.set('secure_cookie', 'secure_cookie', { secure: true, signed: false });
    this.ctx.cookies.set('same_site_lax', 'lax_value', { sameSite: 'lax', signed: false });
    this.ctx.cookies.set('same_site_strict', 'strict_value', { sameSite: 'strict', signed: false });
    // this.ctx.cookies.set('same_site_none', 'none_value', { sameSite: 'none', signed: false, secure: true });

    // 返回所有请求中的cookie
    return {
      headers: this.ctx.headers,
    };
  }
  /**
   * 域名相同的同path下的cookie测试
   */
  @Get('/test/cookies/**')
  async sameDomainAndPathCookiesTest() {
    return {
      query: this.ctx.query,
      path: this.ctx.path,
      body: this.ctx.request.body,
      files: this.ctx.files,
      fields: this.ctx.fields,
      headers: this.ctx.headers,
    };
  }
  /**
   * 不同path下的cookie
   */
  @All('/test/cookies2/**')
  async differentPathCookieTest() {
    return {
      query: this.ctx.query,
      path: this.ctx.path,
      body: this.ctx.request.body,
      files: this.ctx.files,
      fields: this.ctx.fields,
      headers: this.ctx.headers,
    };
  }

  @All('/test/img')
  async testImg(@Body() body: { size?: number; imgType?: string }) {
    const { size = 2 * 1024 * 1024, imgType = 'png' } = body; // 默认2MB, PNG格式

    // 设置对应的Content-Type
    const contentTypes = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'bmp': 'image/bmp',
      'webp': 'image/webp'
    };
    const contentType = contentTypes[imgType.toLowerCase()] || 'image/png';
    this.ctx.set('Content-Type', contentType);

    // 生成指定大小的模拟图片数据
    let imageBuffer: Buffer;
    if (imgType.toLowerCase() === 'png') {
      // PNG文件头 (89 50 4E 47 0D 0A 1A 0A)
      const pngHeader = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
      // IHDR chunk (简化版)
      const ihdrChunk = Buffer.from([
        0x00, 0x00, 0x00, 0x0D, // chunk length
        0x49, 0x48, 0x44, 0x52, // "IHDR"
        0x00, 0x00, 0x00, 0x64, // width: 100px
        0x00, 0x00, 0x00, 0x64, // height: 100px
        0x08, 0x02, 0x00, 0x00, 0x00, // bit depth, color type, compression, filter, interlace
        0x4C, 0x8D, 0x2A, 0x53  // CRC
      ]);
      // IEND chunk
      const iendChunk = Buffer.from([
        0x00, 0x00, 0x00, 0x00, // chunk length
        0x49, 0x45, 0x4E, 0x44, // "IEND"
        0xAE, 0x42, 0x60, 0x82  // CRC
      ]);
      const headerSize = pngHeader.length + ihdrChunk.length + iendChunk.length;
      const dataSize = Math.max(0, size - headerSize);
      const dataBuffer = Buffer.alloc(dataSize);
      // 填充渐变数据模式
      for (let i = 0; i < dataSize; i++) {
        dataBuffer[i] = (i % 256);
      }
      imageBuffer = Buffer.concat([pngHeader, ihdrChunk, dataBuffer, iendChunk]);
    } else {
      // 对于其他格式，直接生成指定大小的二进制数据
      imageBuffer = Buffer.alloc(size);
      // 填充一些模拟的图片数据模式
      for (let i = 0; i < size; i++) {
        imageBuffer[i] = (i % 256);
      }
    }
    this.ctx.set('Content-Length', imageBuffer.length.toString());
    return imageBuffer;
  }

  @Post('/test/sse')
  async testSse(@Body() body: { stream?: boolean; size?: number, speed: number, jsonData?: 'json' | 'string' }) {
    const { stream = false, size = 200, speed = 100, jsonData = 'json' } = body;
    this.ctx.status = 200;
    this.ctx.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });
    if (stream) {
      // 循环发送消息
      for (let i = 1; i <= size; i++) {
        let payload;
        if (jsonData === 'json') {
          // 生成约1KB的JSON数据
          payload = {
            id: i,
            timestamp: new Date().toISOString(),
            message: `这是第 ${i} 条消息`,
            user: {
              id: Math.floor(Math.random() * 1000),
              name: `用户${i}`,
              email: `user${i}@example.com`,
              profile: {
                age: 20 + (i % 50),
                city: `城市${i % 10}`,
                interests: [`兴趣${i % 5}`, `爱好${i % 3}`, `技能${i % 7}`]
              }
            },
            content: {
              title: `标题${i}`,
              description: `这是一段描述文本，用于增加数据大小。消息编号：${i}，包含更多详细信息和内容描述。`,
              tags: Array.from({length: 10}, (_, idx) => `标签${idx + i}`),
              metadata: {
                created: new Date().toISOString(),
                updated: new Date().toISOString(),
                version: `v1.${i}`,
                status: i % 2 === 0 ? '活跃' : '待处理'
              }
            },
            statistics: {
              views: Math.floor(Math.random() * 10000),
              likes: Math.floor(Math.random() * 1000),
              shares: Math.floor(Math.random() * 100)
            }
          };
        } else {
          // 生成字符串数据
          payload = `消息ID: ${i}, 时间戳: ${new Date().toISOString()}, 内容: 这是第${i}条字符串消息，包含一些额外的文本内容来增加数据大小。用户信息、统计数据、元数据等都以字符串形式展示。`;
        }

        // SSE 格式：标准字段
        this.ctx.res.write(': 注释信息\n');
        this.ctx.res.write('event: message\n');
        this.ctx.res.write(`data: ${JSON.stringify(payload)}\n`);
        // this.ctx.res.write(Buffer.from('hello word', 'utf8'));
        this.ctx.res.write('retry: 3000\n');
        this.ctx.res.write(`id: ${i}\n\n`);
        // 间隔延时
        await new Promise(resolve => setTimeout(resolve, speed));
      }
      console.log(stream)
      // 发送结束标记并关闭连接
      this.ctx.res.write('event: complete\n');
      this.ctx.res.write('data: [done]\n');
      this.ctx.res.write('id: complete\n\n');
      this.ctx.res.end();
    } else {
      this.ctx.set({
        'Content-Type': 'text/event-stream',
      });
      this.ctx.res.write(JSON.stringify({ message: 'SSE test completed' }));
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.ctx.res.end();
    }
  }
}

