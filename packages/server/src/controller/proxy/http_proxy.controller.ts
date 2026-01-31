import { Controller, Post, Body, Inject, Files } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { HttpProxyService } from '../../service/proxy/http_proxy.service.js';
import { ProxyRequestParams } from '../../types/proxy.js';
import FormData from 'form-data';
import fs from 'fs/promises';
import { basename } from 'path';
import { fileTypeFromBuffer } from 'file-type';
import mime from 'mime';

@Controller('/api/proxy')
export class HttpProxyController {
  @Inject()
  ctx: Context;

  @Inject()
  httpProxyService: HttpProxyService;

  //普通HTTP请求
  @Post('/http')
  async proxyHttp(@Body() body: ProxyRequestParams, @Files() files?: Record<string, unknown[]>) {
    //处理FormData类型的请求体
    if (body.bodyType === 'formdata' && body.formDataFields && files) {
      try {
        const formData = new FormData();

        //处理字段
        for (const field of body.formDataFields) {
          if (field.type === 'string') {
            formData.append(field.key, field.value);
          } else if (field.type === 'file') {
            //从上传的文件中查找
            const uploadedFiles = files[field.id];
            if (uploadedFiles && uploadedFiles.length > 0) {
              const file = uploadedFiles[0] as { path: string; originalname: string };
              const buffer = await fs.readFile(file.path);
              const fileType = await fileTypeFromBuffer(buffer.buffer as ArrayBuffer);
              const filename = file.originalname || basename(file.path);
              let mimeType = fileType?.mime || '';
              
              if (!mimeType && file.originalname?.match(/\.ts$/)) {
                mimeType = 'text/plain';
              } else if (!mimeType) {
                mimeType = mime.getType(file.originalname || '') || 'text/plain';
              }

              formData.append(field.key, buffer, {
                contentType: mimeType,
                filename: filename
              });
            }
          }
        }

        //设置Content-Type为FormData的boundary
        body.headers['content-type'] = formData.getHeaders()['content-type'];
        
        //将FormData作为body（Service层会处理）
        const modifiedParams = {
          ...body,
          body: formData.getBuffer().toString()
        };

        //SSE流式响应
        if (body.enableStream) {
          const result = await this.httpProxyService.proxyStreamRequest(modifiedParams);
          
          if ('error' in result) {
            return {
              success: false,
              code: result.code,
              message: result.message,
              statusCode: result.statusCode
            };
          }

          this.ctx.set('Content-Type', result.headers['content-type'] || 'text/event-stream');
          this.ctx.set('Cache-Control', 'no-cache');
          this.ctx.set('Connection', 'keep-alive');
          this.ctx.set('X-Accel-Buffering', 'no');
          
          this.ctx.body = result.stream;
          return;
        }

        //普通请求
        const result = await this.httpProxyService.proxyRequest(modifiedParams);
        
        if ('error' in result) {
          return {
            success: false,
            code: result.code,
            message: result.message,
            statusCode: result.statusCode
          };
        }

        //将 Buffer 转为 base64 字符串
        if (Buffer.isBuffer(result.body)) {
          result.body = result.body.toString('base64');
        }

        return {
          success: true,
          data: result
        };
      } catch (error) {
        return {
          success: false,
          code: 'FORMDATA_ERROR',
          message: (error as Error).message
        };
      }
    }

    //处理Binary类型的请求体
    if (body.bodyType === 'binary' && files) {
      try {
        //从上传的文件中获取第一个文件
        const fileList = Object.values(files).flat();
        if (fileList.length > 0) {
          const file = fileList[0] as { path: string };
          const buffer = await fs.readFile(file.path);
          const fileType = await fileTypeFromBuffer(buffer.buffer as ArrayBuffer);
          
          if (fileType?.mime) {
            body.headers['content-type'] = fileType.mime;
          }

          //将Buffer转为base64字符串传递
          const modifiedParams = {
            ...body,
            body: buffer.toString('base64')
          };

          //SSE流式响应
          if (body.enableStream) {
            const result = await this.httpProxyService.proxyStreamRequest(modifiedParams);
            
            if ('error' in result) {
              return {
                success: false,
                code: result.code,
                message: result.message,
                statusCode: result.statusCode
              };
            }

            this.ctx.set('Content-Type', result.headers['content-type'] || 'text/event-stream');
            this.ctx.set('Cache-Control', 'no-cache');
            this.ctx.set('Connection', 'keep-alive');
            this.ctx.set('X-Accel-Buffering', 'no');
            
            this.ctx.body = result.stream;
            return;
          }

          //普通请求
          const result = await this.httpProxyService.proxyRequest(modifiedParams);
          
          if ('error' in result) {
            return {
              success: false,
              code: result.code,
              message: result.message,
              statusCode: result.statusCode
            };
          }

          //将 Buffer 转为 base64 字符串
          if (Buffer.isBuffer(result.body)) {
            result.body = result.body.toString('base64');
          }

          return {
            success: true,
            data: result
          };
        }
      } catch (error) {
        return {
          success: false,
          code: 'BINARY_ERROR',
          message: (error as Error).message
        };
      }
    }

    //处理SSE流式请求
    if (body.enableStream) {
      const result = await this.httpProxyService.proxyStreamRequest(body);
      
      if ('error' in result) {
        return {
          success: false,
          code: result.code,
          message: result.message,
          statusCode: result.statusCode
        };
      }

      //设置SSE响应头
      this.ctx.set('Content-Type', result.headers['content-type'] || 'text/event-stream');
      this.ctx.set('Cache-Control', 'no-cache');
      this.ctx.set('Connection', 'keep-alive');
      this.ctx.set('X-Accel-Buffering', 'no');
      
      this.ctx.body = result.stream;
      return;
    }

    //处理普通请求
    const result = await this.httpProxyService.proxyRequest(body);
    
    if ('error' in result) {
      return {
        success: false,
        code: result.code,
        message: result.message,
        statusCode: result.statusCode
      };
    }

    //将 Buffer 转为 base64 字符串
    if (Buffer.isBuffer(result.body)) {
      result.body = result.body.toString('base64');
    }

    return {
      success: true,
      data: result
    };
  }
}
