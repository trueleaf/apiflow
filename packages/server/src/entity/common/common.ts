import { prop } from '@typegoose/typegoose';

export class Timestamps {
  /**
   * 创建日期
   */
  @prop()
  public createdAt: Date;
  /**
   * 更新日期
   */
  @prop()
  public updatedAt: Date;
}
