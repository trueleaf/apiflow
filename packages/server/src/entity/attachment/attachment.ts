// src/entity/attachment.entity.ts
import { modelOptions, prop } from '@typegoose/typegoose';
import { Types } from 'mongoose';
import { StorageService } from '../../types/types.js';
import { Timestamps } from '../common/common.js';



class UserInfo {
  @prop({ required: true })
  userName: string;

  @prop({ required: true })
  userId: string;
}

@modelOptions({
  schemaOptions: {
    timestamps: true,
    collection: 'attachments',
  }
})
export class Attachment extends Timestamps {
  @prop({ auto: true })
  _id: Types.ObjectId;

  @prop({ required: true })
  fileName: string; // 存储后的文件名（带扩展名）

  @prop({ required: true })
  url: string; // 完整访问地址

  @prop({ required: true })
  mimeType: string; // MIME 类型

  @prop({ required: true })
  size: number; // 文件大小（字节）

  @prop({ required: true })
  hash: string; // 文件哈希（建议 SHA-256）

  @prop({ enum: StorageService, default: StorageService.LOCAL })
  storageService: StorageService; // 存储服务标识

  @prop({ required: true })
  projectId: string; // 所属项目ID

  @prop({ required: true })
  uploader: UserInfo; // 上传者（关联用户）

  @prop({ default: true })
  isEnabled: boolean;
}
