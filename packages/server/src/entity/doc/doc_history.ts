import { modelOptions, prop } from '@typegoose/typegoose';

/*
|--------------------------------------------------------------------------
| 被删除节点信息
|--------------------------------------------------------------------------
*/
class DeletedNode {
  @prop()
  public nodeName: string;
  @prop()
  public nodeId: string;
  @prop()
  public isFolder: boolean;
  @prop()
  public method: string;
  @prop()
  public url: string;
}
/*
|--------------------------------------------------------------------------
| 操作记录
|--------------------------------------------------------------------------
*/
class RecordInfo {
  /**
   * 被操作节点id
   */
  @prop()
  public nodeId: string;
  /**
   * 被操作节点名称
   */
  @prop()
  public nodeName: string;
  /**
   * 请求方法
   */
  @prop()
  public method: string;
  /**
   * 请求url
   */
  @prop()
  public url: string;
  @prop()
  /**
   * 修改文档，节点保存期快照
   */
  public nodeSnapshot: Record<string, unknown>;
  /**
   * 文档位置改变，相对节点id
   */
  @prop()
  public dropNodeId: string;
  /**
   * 文档位置改变，相对节点名称
   */
  @prop()
  public dropNodeName: string;
  /**
   * 文档改变位置
   */
  @prop()
  public dropType: 'before' | 'after' | 'inner';
  /**
   * 原始节点名称,适用于修改文档名称
   */
  @prop()
  public orginNodeName: string;
  /**
   * 被删除节点信息
   */
  @prop({ type: () => [DeletedNode] })
  public deleteNodes: DeletedNode[];
  /**
   * 导出文档，导出类型
   */
  public exportType: string;
  /**
   * 导入文档数量
   */
  @prop()
  public importNum: number;
  /**
   * 是否是覆盖导入
   */
  @prop()
  public importIsCover: boolean;
}

@modelOptions({
  schemaOptions: { timestamps: true, collection: 'docs_history' },
})
export class DocHistory {
  /**
   * 项目id
   */
  @prop()
  public projectId: string;
  /**
   * 文档操作类型
   */
  @prop()
  public operation:
    | 'addFolder'
    | 'addDoc'
    | 'copyDoc'
    | 'copyFolder'
    | 'deleteFolder'
    | 'deleteDoc'
    | 'deleteMany'
    | 'editDoc'
    | 'position'
    | 'rename'
    | 'import'
    | 'export'
    | 'addServer'
    | 'deleteServer'
    | 'editServer';
  /**
   * 操作者
   */
  @prop()
  public operator: string;
  /**
   * 操作者id
   */
  @prop()
  public operatorId: string;
  /**
   * 操作记录
   */
  @prop()
  public recordInfo: RecordInfo;
}
