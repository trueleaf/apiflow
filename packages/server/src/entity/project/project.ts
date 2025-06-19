import { modelOptions, prop } from '@typegoose/typegoose';
import { Timestamps } from '../common/common.js';
/*
|--------------------------------------------------------------------------
| 创建者信息
|--------------------------------------------------------------------------
*/
class Creator {
  /**
   * 用户id
   */
  @prop()
  public id: string;
  /**
   * 用户名称
   */
  @prop()
  public name: string;
}
/*
|--------------------------------------------------------------------------
| 成员信息
|--------------------------------------------------------------------------
*/
class UserItem {
  /**
   * 用户id
   */
  @prop()
  public userId: string;
  /**
   * 用户名称
   */
  @prop()
  public userName: string;
  /**
   * 权限
   */
  @prop({ enum: ['readOnly', 'readAndWrite', 'admin'] })
  public permission: 'readOnly' | 'readAndWrite' | 'admin';
}
export class GroupItem {
  /**
   * 群组id
   */
  @prop()
  public groupId: string;
  /**
   * 群组名称
   */
  @prop()
  public groupName: string;
  /**
   * 组成员
   */
  @prop({ type: () => [UserItem], _id: false })
  public groupUsers: UserItem[];
}



@modelOptions({
  schemaOptions: { timestamps: true, collection: 'projects' },
})
export class Project extends Timestamps {
  /**
   * 项目名称
   */
  @prop({ minlength: 1, maxlength: 30, trim: true })
  public projectName: string;
  /**
   * 备注
   */
  @prop()
  public remark: string;
  /**
   * 文档数量
   */
  @prop()
  public docNum: number;
  /**
   * 创建者
   */
  @prop({_id: false})
  public owner: Creator;
  /**
   * 成员信息
   */
  @prop({type: () => [UserItem], _id: false})
  public users: UserItem[];

  /**
   * 群组信息
   */
  @prop({ type: () => [GroupItem], _id: false })
  public groups: GroupItem[];

  /**
   * 是否启用
   */
  @prop({ default: true })
  public isEnabled: boolean;
}
