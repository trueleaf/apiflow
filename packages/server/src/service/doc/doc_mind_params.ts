import { Provide, Inject, Context } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { CommonController } from '../../controller/common/common.js';
import { LoginTokenInfo } from '../../types/types.js';
import { TableResponseWrapper } from '../../types/response/common/common.js';
import { DocMindParams } from '../../entity/doc/doc_mind_params.js';
import { AddDocMindParamsDto, DeleteDocMindParams, GetDocMindParamsList } from '../../types/dto/doc/doc.mind.params.js';

@Provide()
export class DocMindParamsServer {
  @InjectEntityModel(DocMindParams)
    docMindParamsModel: ReturnModelType<typeof DocMindParams>;
  @Inject()
    commonControl: CommonController;
  @Inject()
    ctx: Context & { tokenInfo: LoginTokenInfo };
  /**
   * 新增联想参数
   */
  async addDocMindParams(params: AddDocMindParamsDto) {
    const { projectId, mindParams } = params;
    await this.commonControl.checkDocOperationPermissions(projectId)
    const existMindParams = await this.docMindParamsModel.findOne({ projectId }).lean();
    const mapedExistMindParams = existMindParams?.mindParams.map(mindParams => {
      return {
        key: mindParams.key,
        type: mindParams.type,
        description: mindParams.description,
        value: mindParams.value,
        paramsPosition: mindParams.paramsPosition
      }
    }) as AddDocMindParamsDto['mindParams']
    const allMindParams = mindParams.concat(mapedExistMindParams || []);
    const uniqueMindParams: AddDocMindParamsDto['mindParams'] = [];
    for(let i = 0; i < allMindParams.length; i ++) {
      if (uniqueMindParams.find(v => (v.key === allMindParams[i].key && v.paramsPosition === allMindParams[i].paramsPosition))) {
        continue;
      }
      uniqueMindParams.push(allMindParams[i]);
    }
    await this.docMindParamsModel.updateOne({ projectId }, { mindParams: uniqueMindParams }, { upsert: true });
    return uniqueMindParams;
  }
  /**
   * 删除联想参数
   */
  async deleteDocMindParams(params: DeleteDocMindParams) {
    const { projectId, ids } = params;
    const result = await this.docMindParamsModel.updateMany({
      projectId,
      'mindParams._id': { $in: ids }
    }, {
      $set: { 'mindParams.$[elem].isEnabled': false }
    }, {
      arrayFilters: [{ 'elem._id': { $in: ids } }]
    });
    return result;
  }
  /**
   * 获取联想参数
   */
  async geMindParams(params: GetDocMindParamsList) {
    const { projectId } = params;
    const result = await this.docMindParamsModel.findOne({ projectId });
    if (!result) {
      return [];
    }
    return result.mindParams.filter(v => v.isEnabled);
  }
  /**
   * 列表形式获取前缀
   */
  async getDocMindParamsList(params: GetDocMindParamsList) {
    const { pageNum, pageSize, startTime, endTime, projectId } = params;
    await this.commonControl.checkDocOperationPermissions(projectId)
    const query = { isEnabled: true, projectId } as {
      projectId: string;
      isEnabled: boolean;
      createdAt?: {
        $gt?: number,
        $lt?: number,
      };
      $or: Record<string, string>[]
    };
    let skipNum = 0;
    let limit = 100;
    //基础查询
    if (pageSize != null && pageNum != null) {
      skipNum = (pageNum - 1) * pageSize;
      limit = pageSize;
    }
    if (startTime != null && endTime == null) {
      query.createdAt = { $gt: startTime, $lt: Date.now() };
    } else if (startTime != null && endTime != null) {
      query.createdAt = { $gt: startTime, $lt: endTime };
    }
    const result: TableResponseWrapper = {
      rows: [],
      total: 0
    };
    result.rows = await this.docMindParamsModel.find(query, { name: 1, url: 1 }).skip(skipNum).limit(limit);
    result.total = await this.docMindParamsModel.find(query).countDocuments();
    return result;
  }
}
