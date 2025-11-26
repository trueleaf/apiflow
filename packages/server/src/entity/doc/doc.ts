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
   * 文档类型,   1.文件夹 2.HTTP接口 3.HTTP Mock 4.WebSocket 5.Markdown文档
   */
  @prop()
  public type: 'folder' | 'http' | 'httpMock' | 'websocket' | 'markdown';
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

/*
|--------------------------------------------------------------------------
| WebSocket消息块
|--------------------------------------------------------------------------
*/
class WebsocketMessageBlock {
  @prop()
  public id: string;
  @prop()
  public name: string;
  @prop()
  public content: string;
  @prop({ default: 'json' })
  public messageType: 'text' | 'json' | 'xml' | 'html' | 'binary-base64' | 'binary-hex';
  @prop({ default: 0 })
  public order: number;
}

/*
|--------------------------------------------------------------------------
| WebSocket URL信息
|--------------------------------------------------------------------------
*/
class WebsocketUrl {
  @prop({ default: '' })
  public path: string;
  @prop({ default: '' })
  public prefix: string;
}

/*
|--------------------------------------------------------------------------
| WebSocket配置
|--------------------------------------------------------------------------
*/
class WebsocketConfig {
  @prop({ default: false })
  public autoSend: boolean;
  @prop({ default: 1000 })
  public autoSendInterval: number;
  @prop({ default: '' })
  public autoSendContent: string;
  @prop({ default: 'json' })
  public autoSendMessageType: 'text' | 'json' | 'xml' | 'html' | 'binary-base64' | 'binary-hex';
  @prop({ default: false })
  public autoReconnect: boolean;
}

/*
|--------------------------------------------------------------------------
| WebSocket Item信息
|--------------------------------------------------------------------------
*/
class WebsocketItemInfo {
  @prop({ default: 'ws' })
  public protocol: 'ws' | 'wss';
  @prop({ _id: false, default: { path: '', prefix: '' } })
  public url: WebsocketUrl;
  @prop({ type: () => [BaseProperty] })
  public queryParams: BaseProperty[];
  @prop({ type: () => [BaseProperty] })
  public headers: BaseProperty[];
  @prop({ type: () => [WebsocketMessageBlock], _id: false })
  public messageBlocks: WebsocketMessageBlock[];
}

/*
|--------------------------------------------------------------------------
| WebSocket节点数据
|--------------------------------------------------------------------------
*/
class WebsocketItem {
  @prop({ _id: false })
  public item: WebsocketItemInfo;
  @prop({ _id: false })
  public config: WebsocketConfig;
  @prop({ _id: false })
  public preRequest: RequestScript;
  @prop({ _id: false })
  public afterRequest: RequestScript;
}

/*
|--------------------------------------------------------------------------
| HttpMock请求条件
|--------------------------------------------------------------------------
*/
class HttpMockRequestCondition {
  @prop({ type: () => [String], default: ['ALL'] })
  public method: string[];
  @prop({ default: '' })
  public url: string;
  @prop({ default: 3000 })
  public port: number;
}

/*
|--------------------------------------------------------------------------
| HttpMock配置
|--------------------------------------------------------------------------
*/
class HttpMockConfig {
  @prop({ default: 0 })
  public delay: number;
}

/*
|--------------------------------------------------------------------------
| HttpMock SSE配置
|--------------------------------------------------------------------------
*/
class SseEventId {
  @prop({ default: false })
  public enable: boolean;
  @prop({ default: 'increment' })
  public valueMode: 'increment' | 'random' | 'timestamp';
}

class SseEventName {
  @prop({ default: false })
  public enable: boolean;
  @prop({ default: '' })
  public value: string;
}

class SseEventData {
  @prop({ default: 'json' })
  public mode: 'json' | 'string';
  @prop({ default: '' })
  public value: string;
}

class SseRetry {
  @prop({ default: false })
  public enable: boolean;
  @prop({ default: 0 })
  public value: number;
}

class SseEvent {
  @prop({ _id: false })
  public id: SseEventId;
  @prop({ _id: false })
  public event: SseEventName;
  @prop({ _id: false })
  public data: SseEventData;
  @prop({ _id: false })
  public retry: SseRetry;
}

class SseConfig {
  @prop({ _id: false })
  public event: SseEvent;
  @prop({ default: 1000 })
  public interval: number;
  @prop({ default: 10 })
  public maxNum: number;
}

/*
|--------------------------------------------------------------------------
| HttpMock响应配置
|--------------------------------------------------------------------------
*/
class JsonConfig {
  @prop({ default: 'fixed' })
  public mode: 'random' | 'fixed' | 'randomAi';
  @prop({ default: '' })
  public fixedData: string;
  @prop({ default: 10 })
  public randomSize: number;
  @prop({ default: '' })
  public prompt: string;
}

class TextConfig {
  @prop({ default: 'fixed' })
  public mode: 'random' | 'fixed' | 'randomAi';
  @prop({ default: 'text/plain' })
  public textType: 'text/plain' | 'html' | 'xml' | 'yaml' | 'csv' | 'any';
  @prop({ default: '' })
  public fixedData: string;
  @prop({ default: 100 })
  public randomSize: number;
  @prop({ default: '' })
  public prompt: string;
}

class ImageConfigData {
  @prop({ default: 'random' })
  public mode: 'random' | 'fixed';
  @prop({ default: 'png' })
  public imageConfig: 'png' | 'jpg' | 'webp' | 'svg';
  @prop({ default: 1024 })
  public randomSize: number;
  @prop({ default: 200 })
  public randomWidth: number;
  @prop({ default: 200 })
  public randomHeight: number;
  @prop({ default: '' })
  public fixedFilePath: string;
}

class FileConfigData {
  @prop({ default: 'pdf' })
  public fileType: 'doc' | 'docx' | 'xls' | 'xlsx' | 'pdf' | 'ppt' | 'pptx' | 'zip' | '7z';
}

class BinaryConfigData {
  @prop({ default: '' })
  public filePath: string;
}

class RedirectConfig {
  @prop({ default: 302 })
  public statusCode: 301 | 302 | 303 | 307 | 308;
  @prop({ default: '' })
  public location: string;
}

class HttpMockResponseHeaders {
  @prop({ default: true })
  public enabled: boolean;
  @prop({ type: () => [BaseProperty] })
  public defaultHeaders: BaseProperty[];
  @prop({ type: () => [BaseProperty] })
  public customHeaders: BaseProperty[];
}

class HttpMockConditions {
  @prop({ default: '' })
  public name: string;
  @prop({ default: '' })
  public scriptCode: string;
  @prop({ default: false })
  public enabled: boolean;
}

class HttpMockResponseItem {
  @prop({ default: '' })
  public name: string;
  @prop({ default: true })
  public isDefault: boolean;
  @prop({ _id: false })
  public conditions: HttpMockConditions;
  @prop({ default: 200 })
  public statusCode: number;
  @prop({ _id: false })
  public headers: HttpMockResponseHeaders;
  @prop({ default: 'json' })
  public dataType: 'sse' | 'json' | 'text' | 'image' | 'file' | 'binary' | 'redirect';
  @prop({ _id: false })
  public sseConfig: SseConfig;
  @prop({ _id: false })
  public jsonConfig: JsonConfig;
  @prop({ _id: false })
  public textConfig: TextConfig;
  @prop({ _id: false })
  public imageConfig: ImageConfigData;
  @prop({ _id: false })
  public fileConfig: FileConfigData;
  @prop({ _id: false })
  public binaryConfig: BinaryConfigData;
  @prop({ _id: false })
  public redirectConfig: RedirectConfig;
}

/*
|--------------------------------------------------------------------------
| HttpMock节点数据
|--------------------------------------------------------------------------
*/
class HttpMockItem {
  @prop({ _id: false })
  public requestCondition: HttpMockRequestCondition;
  @prop({ _id: false })
  public config: HttpMockConfig;
  @prop({ type: () => [HttpMockResponseItem], _id: false })
  public response: HttpMockResponseItem[];
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
   * WebSocket节点数据
   */
  @prop({ type: () => WebsocketItem, _id: false })
  public websocketItem: WebsocketItem;
  /**
   * HttpMock节点数据
   */
  @prop({ type: () => HttpMockItem, _id: false })
  public httpMockItem: HttpMockItem;
  /**
   * 是否启用
   */
  @prop({ default: true })
  public isEnabled: boolean;
}
