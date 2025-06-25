import { modelOptions, prop } from '@typegoose/typegoose';
import { Timestamps } from '../common/common.js';
import { RequestMethod } from '../../types/types.js';
import { nanoid } from 'nanoid';

class FileInfo {
  /**
   * 文件路径
   */
  @prop()
  public url: string;
  /**
   * 原始数据
   */
  @prop()
  public raw: string;
}
class MockImageInfo {
  /**
   * 图片类型
   */
  @prop({ default: 'png' })
  public type: 'png' | 'jpg' | 'gif' | 'svg';
  /**
   * 图片宽度
   */
  @prop({ default: 200 })
  public width: number;
  /**
   * 图片宽度
   */
  @prop({ default: 200 })
  public height: number;
  /**
   * 图片额外大小
   */
  @prop({ default: 0 })
  public size: number;
  /**
   * 文字大小
   */
  @prop({ default: 16 })
  public fontSize: number;
  /**
   * 文字颜色
   */
  @prop({ default: '#fff' })
  public color: string;
  /**
   * 背景颜色
   */
  @prop({ default: '#aaa' })
  public backgroundColor: string;
}
class MockFileInfo {
  /**
   * 文件类型
   */
  @prop({ default: 'doc' })
  public type: 'doc' | 'docx' | 'xls' | 'xlsx' | 'pdf' | 'zip' | 'custom';
  /**
   * 文件类型
   */
  @prop({ default: '' })
  public filePath: string;
}
/*
|--------------------------------------------------------------------------
| mock信息
|--------------------------------------------------------------------------
*/
class MockInfo {
  /**
   * mock地址
   */
  @prop()
  public path: string;
  /**
   * http状态码
   */
  @prop()
  public httpStatusCode: number;
  /**
   * 自定义返回头
   */
  @prop({type: () => [BaseProperty]})
  public responseHeaders: BaseProperty[];
  /**
   * 返回延时
   */
  @prop({default: 0})
  public responseDelay: number;
  /**
   * 返回数据类型
   */
  @prop({default: 'json'})
  public responseType: 'json' | 'image' | 'file' | 'text' | 'customJson';
  /**
   * json数据
   */
  @prop()
  public json: string;
  /**
   * 纯文本，html，css等
   */
  @prop()
  public text: string;
  /**
   * mock图片信息
   */
  @prop({type: () => MockImageInfo, _id: false})
  public image: MockImageInfo;
  /**
   * mock文件信息
   */
  @prop({type: () => MockFileInfo, _id: false})
  public file: MockFileInfo;
  /**
   * 自定义json返回
   */
  @prop()
  public customResponseScript: string;
}

/*
|--------------------------------------------------------------------------
| 文档参数
|--------------------------------------------------------------------------
*/
class BaseProperty {
  @prop()
  public _id: string;
  /**
   * 字段名称
   */
  @prop()
  public key: string;
  /**
   * 字段类型
   */
  @prop()
  public type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'file';
  /**
   * 字段描述
   */
  @prop()
  public description: string;
  /**
   * 字段值
   */
  @prop()
  public value: string;
  /**
   * 是否必填
   */
  @prop()
  public required: boolean;
  /**
   * 业务参数，是否选中
   */
  @prop()
  public select: boolean;
  /**
   * 业务参数，附件类型变量模式
   */
  @prop()
  public fileValueType: 'var' | 'file';
  // /**
  //  * 子元素
  //  */
  // @prop({ ref: () => BaseProperty })
  // public children: BaseProperty[];
}
/*
|--------------------------------------------------------------------------
| 文档信息
|--------------------------------------------------------------------------
*/
class Info {
  /**
   * 文档名称
   */
  @prop({ required: true, maxlength: 100 })
  public name: string;
  /**
   * 文档版本信息
   */
  @prop()
  public version: string;
  /**
   * 文档类型,   1.文件夹 2.普通文档 3.markdown文档
   */
  @prop()
  public type: 'folder' | 'api' | 'markdown';
  /**
   * 创建者
   */
  @prop()
  public creator: string;
  /**
   * 维护人员，最近一次更新人员
   */
  @prop()
  public maintainer?: string;
  /**
   * 删除文档的人
   */
  @prop()
  public deletePerson: string;
  /**
   * 删除文档的id
   */
  @prop()
  public deletePersonId: string;
  /**
   * 备注信息
   */
  @prop({ maxlength: 1024 })
  public description: string;
}
/*
|--------------------------------------------------------------------------
| 请求脚本
|--------------------------------------------------------------------------
*/
class RequestScript {
  /**
   * 请求脚本信息
   */
  @prop({ default: '' })
  public raw: string;
}
/*
|--------------------------------------------------------------------------
| 基本请求参数
|--------------------------------------------------------------------------
*/
class RequestUrl {
  /**
   * host地址(目前理解为接口前缀，可以是任意字符串)
   */
  @prop({ default: '' })
  public host: string;
  /**
   * 请求路径
   */
  @prop({ default: '' })
  public path: string;
}
/*
|--------------------------------------------------------------------------
| 请求body
|--------------------------------------------------------------------------
*/
class RawBody {
  /**
   * 数据
   */
  @prop()
  public data: string;
  /**
   * 数据类型
   */
  @prop()
  public dataType: string;
}
class BinaryValue {
  @prop()
  public id: string;
  @prop()
  public path: string;
  @prop()
  public raw: string;
}
class BinaryBody {
  @prop({ default: 'file' })
  public mode: 'var' | 'file';
  @prop()
  public varValue: string;
  @prop({_id: false})
  public binaryValue: BinaryValue
}
class RequestBody {
  /**
   * 请求模式
   */
  @prop({ default: 'json' })
  public mode: 'json' | 'raw' | 'formdata' | 'urlencoded' | 'binary' | 'none';
  /**
   * 原始json数据(字符串)
   */
  @prop({ default: '' })
  public rawJson: string;
  /**
   * formData数据
   */
  @prop({ type: () => [BaseProperty] })
  public formdata: BaseProperty[];
  /**
   * formData数据
   */
  @prop({ type: () => [BaseProperty] })
  public urlencoded: BaseProperty[];
  /**
   * raw数据
   */
  @prop({ default: { data: '', dataType: 'text/plain' }, _id: false })
  public raw: RawBody;
  /**
   * binary数据
   */
  @prop({_id: false, default: {
    mode: 'file',
    varValue: '',
    binaryValue: {
      path: "",
      id: "",
      raw: ""
    }
  }})
  public binary: BinaryBody;
}
class RequestInfo {
  /**
   * 请求方法
   */
  @prop({ default: 'GET' })
  public method: RequestMethod;
  /**
   * 请求地址信息
   */
  @prop({ default: { path: '', host: '' }, _id: false })
  public url: RequestUrl;
  /**
   * 路径参数
   */
  @prop({ type: () => [BaseProperty] })
  public paths: BaseProperty[];
  /**
   * query参数
   */
  @prop({ type: () => [BaseProperty] })
  public queryParams: BaseProperty[];
  /**
   * body参数
   */
  @prop({_id: false, default: {
    requestBody: {}
  }})
  public requestBody: RequestBody;
  /**
   * 请求头
   */
  @prop({ type: () => [BaseProperty] })
  public headers: BaseProperty[];
  /**
   * contentType
   */
  @prop({ default: '' })
  public contentType: string;
  /**
   * 返回参数
   */
  @prop({
    type: () => [ResponseParams],
    _id: false,
    default: [
      {
        title: '成功返回',
        statusCode: 200,
        _id: nanoid(),
        value: {
          dataType: 'application/json',
          strJson: '',
          file: {
            url: '',
            raw: '',
          },
          text: '',
        },
      },
    ],
  })
  public responseParams: ResponseParams[];
}
/*
|--------------------------------------------------------------------------
| 返回参数
|--------------------------------------------------------------------------
*/
class ResonseValue {
  @prop()
  public dataType: string;
  @prop()
  public strJson: string;
  @prop()
  public text: string;
  @prop({_id: false})
  public file: FileInfo;
}
class ResponseParams {
  @prop()
  public _id: string;
  @prop()
  public title: string;
  @prop({ default: 200 })
  public statusCode: number;
  @prop({_id: false})
  public value: ResonseValue;
}

@modelOptions({
  schemaOptions: { timestamps: true, collection: 'doc' },
})
export class Doc extends Timestamps {
  /**
   * 父元素id
   */
  @prop({ default: '' })
  public pid: string;
  /**
   * 项目id
   */
  @prop({ required: true })
  public projectId: string;
  /**
   * 是否为文件夹
   */
  @prop({ required: true })
  public isFolder: boolean;
  /**
   * 排序字段，时间戳
   */
  @prop({ required: true, default: Date.now() })
  public sort: number;
  /**
   * 文档基本信息
   */
  @prop({_id: false})
  public info: Info;
  /**
   * 前置脚本信息
   */
  @prop({_id: false})
  public preRequest: RequestScript;
  /**
   * 后置脚本信息
   */
  @prop({_id: false})
  public afterRequest: RequestScript;
  /**
   * 公共请求头
   */
  @prop({ type: () => [BaseProperty] })
  public commonHeaders: BaseProperty[];
  /**
   * 接口相关元素
   */
  @prop({_id: false})
  public item: RequestInfo;
  /**
   * mock信息
   */
  @prop({ type: () => MockInfo, _id: false })
  public mockInfo: MockInfo
  /**
   * 是否启用
   */
  @prop({ default: true })
  public isEnabled: boolean;
}
