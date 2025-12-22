import { Provide, Config } from '@midwayjs/core';
// import OSS from 'ali-oss';
import { createHash } from 'crypto';
// import { Readable } from 'stream';
import { Attachment } from '../../entity/attachment/attachment.js';
import { OssConfig, UploadConfig } from '../../types/types.js';
import { InjectEntityModel } from '@midwayjs/typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { UploadFileInfo } from '@midwayjs/upload';
import fs from 'fs/promises';
import { fileTypeFromBuffer } from 'file-type';

@Provide()
export class AttachmentService {

  @InjectEntityModel(Attachment)
  attachmentModel: ReturnModelType<typeof Attachment>;
  
  @Config('ossConfig')
  ossConfig: OssConfig;
  @Config('uploadConfig')
  uploadConfig: UploadConfig

  // 创建文件记录
  async create(params: {
    file: UploadFileInfo<string>;
    fileName: string;
    projectId: string;
    uploader: {
      userId: string;
      userName: string;
    };
    targetPath: string
  }) {
    if (this.uploadConfig.storageService === 'local') {
      const fileBuffer = await fs.readFile(params.file.data)
      const stats = await fs.stat(params.file.data);
      const hash = await this.calculateHash(fileBuffer);
      const mimeType = await fileTypeFromBuffer(fileBuffer);
      // console.log(params, mimeType)
      await this.attachmentModel.create({
        fileName: params.fileName,
        url: params.targetPath,
        mimeType: mimeType.mime,
        size: stats.size,
        hash: hash,
        storageService: 'local',
        projectId: params.projectId,
        uploader: params.uploader,
        isEnabled: true
      });
    }
    // const { file, fileName, projectId, uploader } = params;
    // console.log(1, this.ossConfig, this.calculateHash)
    // 计算文件哈希
    // const hash = await this.calculateHash(file.data);
    
    // 上传到 OSS
    // const ossClient = new OSS(this.ossConfig);
    // const ossFileName = `${Date.now()}_${file.filename}`;
    
    // const ossRes = await ossClient.put(
    //   `attachments/${projectId}/${ossFileName}`,
    //   file.data
    // );

    // 创建数据库记录

  }

  // 计算 SHA-256 哈希
  private async calculateHash(buffer: Buffer) {
    return createHash('sha256')
      .update(new Uint8Array(buffer))
      .digest('hex');
  }

  // 其他方法见下方补充
}