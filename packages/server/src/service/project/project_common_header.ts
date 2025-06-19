import { Inject, Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { CommonController } from '../../controller/common/common.js';
import { GetProjectCommonHeaderByIdDto, UpsertProjectCommonHeaderDto, GetProjectCommonHeadersDto, UpsertGlobalProjectCommonHeaderDto, GetGlobalProjectCommonHeadersDto } from '../../types/dto/project/project.common.header.dto.js';
import { Doc } from '../../entity/doc/doc.js';
import { Types } from 'mongoose';
import { GlobalCommonHeader } from '../../entity/project/project_common_headers.js';

@Provide()
export class ProjectCommonHeaderService {
  @InjectEntityModel(Doc)
    docModel: ReturnModelType<typeof Doc>;
  @InjectEntityModel(GlobalCommonHeader)
    globalCommonHeaderModel: ReturnModelType<typeof GlobalCommonHeader>;
  @Inject()
    commonControl: CommonController
  /**
   * 根据id获取某个请求头
   */
  async getProjectCommonHeaderById(params: GetProjectCommonHeaderByIdDto) {
    const { id } = params;
    const result = await this.docModel.findOne({ _id: id }, { commonHeaders: 1 }).lean();
    return {
      _id: result._id,
      commonHeaders: result.commonHeaders.map(v => ({
        ...v,
        _id: new Types.ObjectId().toString()
      }))
    };
  }
  /**
   * 修改公共请求头
   */
  async upsertProjectCommonHeader(params: UpsertProjectCommonHeaderDto) {
    const { commonHeaders, id  } = params;
    await this.docModel.findByIdAndUpdate({ _id: id }, {
      $set: {
        commonHeaders
      }
    });
    return;
  }
  /**
   * 获取公共请求头
   */
  async getProjectCommonHeaders(params: GetProjectCommonHeadersDto) {
    const { projectId } = params;
    const result = [];
    const docsInfo = await this.docModel.find({
      projectId,
      isEnabled: true,
    }, {
      pid: 1,
      info: 1,
      isFolder: 1,
      sort: 1,
      commonHeaders: 1,
      children: 1,
    }).sort({
      isFolder: -1,
      sort: 1
    }).lean();
    const pickedData =  docsInfo.map(val => {
      if (val.isFolder) {
        return {
          _id: val._id,
          pid: val.pid,
          name: val.info.name,
          isFolder: val.isFolder,
          commonHeaders: val.commonHeaders,
          children: [],
        };
      } else {
        return {
          _id: val._id,
          pid: val.pid,
          name: val.info.name,
          isFolder: val.isFolder,
          commonHeaders: val.commonHeaders,
          children: [],
        };
      }
    })
    for (let i = 0; i < pickedData.length; i++) {
      const docInfo = pickedData[i];
      if (!docInfo.pid) { //根元素
        docInfo.children = [];
        result.push(docInfo);
      }
      const id = docInfo._id.toString();
      for (let j = 0; j < pickedData.length; j++) {
        if (id === pickedData[j].pid) { //项目中新增的数据使用标准id
          if (docInfo.children == null) {
            docInfo.children = [];
          }
          docInfo.children.push(pickedData[j]);
        }
      }
    }
    return result;
  }
  /**
   * 获取全局公共请求头
   */
  async getGlobalProjectCommonHeaders(params: GetGlobalProjectCommonHeadersDto) {
    const { projectId } = params;
    const result = await this.globalCommonHeaderModel.findOne({ projectId }, { __v: 0 }).lean();
    if (!result) {
      return [];
    }
    return result.commonHeaders;
  }
  /**
   * 修改全局公共请求头
   */
  async upsertGlobalProjectCommonHeaders(params: UpsertGlobalProjectCommonHeaderDto) {
    const { projectId, commonHeaders } = params;
    await this.globalCommonHeaderModel.updateOne({ projectId }, {
      $set: {
        commonHeaders
      }
    }, {
      upsert: true
    });
    return;
  }
}
