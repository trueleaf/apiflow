import { Controller, Post, Inject, Files, Fields, Config } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { FileUploadDTO } from '../../types/dto/attachment/attachment.dto.js';
import { AttachmentService } from '../../service/attachment/attachment.js';
import { LoginTokenInfo, UploadConfig } from '../../types/types.js';
import { UploadFileInfo } from '@midwayjs/upload';
import { extname, join } from 'node:path';
import { nanoid } from 'nanoid';
import fs from 'fs/promises';
import { formatBytes } from '../../utils/utils.js';

@Controller('/api/attachment')
export class AttachmentController {
  @Inject()
  ctx: Context & { tokenInfo: LoginTokenInfo };

  @Inject()
  attachmentService: AttachmentService;

  @Config('uploadConfig')
  uploadConfig: UploadConfig

  // 文件上传
  @Post('/upload')
  async upload(
    @Files() files: UploadFileInfo<string>[],
    @Fields() body: FileUploadDTO
  ) {
    const file = files[0];
    const { tokenInfo } = this.ctx;
    const storageDir = this.uploadConfig.dir;
    // 生成唯一文件名
    const ext = extname(file.filename);
    const newFilename = `${nanoid()}${ext}`;
    const targetPath = join(storageDir, newFilename);
    // 判断文件大小
    const fileState = await fs.stat(file.data);
    if (fileState.size > this.uploadConfig.fileSize) {
      return this.ctx.throw(400, `文件大小不能超过 ${formatBytes(this.uploadConfig.fileSize)}`);
    }
    return this.attachmentService.create({
      file,
      fileName: body.fileName,
      projectId: body.projectId,
      targetPath,
      uploader: {
        userId: tokenInfo.id,
        userName: tokenInfo.loginName
      }
    });
  }

  // 其他接口见下方补充
}