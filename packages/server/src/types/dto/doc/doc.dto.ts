import { Rule, RuleType, getSchema } from '@midwayjs/validate';
import { RequestMethod } from '../../types.js';
import { WebsocketItem } from './websocket.dto.js';
import { HttpMockItem } from './httpMock.dto.js';

/*
|--------------------------------------------------------------------------
| 通用校验
|--------------------------------------------------------------------------
*/
class CommonHeaderItem {
  @Rule(RuleType.string().required())
  _id: string;
  /**
   * 字段名称
   */
  @Rule(RuleType.string().required().allow(''))
  key: string;
  /**
 * 字段描述
 */
  @Rule(RuleType.string().allow(''))
  description?: string;
  /**
   * 字段值
   */
  @Rule(RuleType.string().required().allow(''))
  value: string;
  /**
* 业务参数，是否选中
*/
  @Rule(RuleType.boolean())
  select?: boolean;
  /**
 * 字段类型
 */
  @Rule(RuleType.string())
  type?: string;
}
//基础请求参数元信息
class BaseProperty {
  @Rule(RuleType.string().required())
  _id: string;
  /**
   * 字段名称
   */
  @Rule(RuleType.string().required().allow(''))
  key: string;
  /**
   * 字段类型
   */
  @Rule(RuleType.string().valid('string', 'number', 'boolean', 'array', 'object', 'file').required())
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'file';
  /**
   * 字段描述
   */
  @Rule(RuleType.string().required().allow(''))
  description: string;
  /**
   * 字段值
   */
  @Rule(RuleType.string().required().allow(''))
  value: string;
  /**
   * 是否必填
   */
  @Rule(RuleType.boolean().required())
  required: boolean;
  /**
   * 业务参数，是否选中
   */
  @Rule(RuleType.boolean())
  select?: boolean;
  /**
   * 业务参数，文件变量类型
   */
  @Rule(RuleType.string().valid('var', 'file'))
  fileValueType?: string;
}
class MockImage {
  @Rule(RuleType.valid('png', 'jpg', 'gif', 'svg').required())
  type: 'png' | 'jpg' | 'gif' | 'svg';
  @Rule(RuleType.number())
  width: number;
  @Rule(RuleType.number())
  height: number;
  /**
   * 图片额外大小,可以mock较大数据图片来测试网络延迟
   */
  @Rule(RuleType.number().required())
  size: number;
  @Rule(RuleType.number().required())
  fontSize: number;
  @Rule(RuleType.string().required().allow(''))
  color: string;
  @Rule(RuleType.string().required().allow(''))
  backgroundColor: string;
}

class MockFile {
  @Rule(RuleType.valid('doc', 'docx', 'xls', 'xlsx', 'pdf', 'zip', 'custom'))
  type: 'doc' | 'docx' | 'xls' | 'xlsx' | 'pdf' | 'zip' | 'custom';
  /**
   * 自定义mock文件路径
   */
  @Rule(RuleType.string().allow(''))
  filePath: string;
}

class MockInfo {
  /**
   * mock地址
   */
  @Rule(RuleType.string().required().allow(''))
  path: string;
  /**
   * http状态码
   */
  @Rule(RuleType.number().required())
  httpStatusCode: number;
  /**
   * 自定义返回头
   */
  @Rule(RuleType.array().items(getSchema(BaseProperty)).required())
  responseHeaders: BaseProperty[];
  /**
   * 返回延时
   */
  @Rule(RuleType.number().required())
  responseDelay: number;
  /**
   * 返回数据类型
   */
  @Rule(RuleType.valid('json', 'image', 'file', 'text', 'customJson').required())
  responseType: 'json' | 'image' | 'file' | 'text' | 'customJson';
  /**
   * 返回json数据
   */
  @Rule(RuleType.string().required().allow(''))
  json: string;
  /**
   * 图片返回
   */
  @Rule(getSchema(MockImage).required())
  image: MockImage;
  /**
   * 文件相关数据
   */
  @Rule(getSchema(MockFile).required())
  file: MockFile;
  /**
   * 纯文本，html，css等
   */
  @Rule(RuleType.string().required().allow(''))
  text: string;
  /**
   * 自定义json返回
   */
  @Rule(RuleType.string().required().allow(''))
  customResponseScript: string;
}

//文档基本信息
class DocBaseInfo {
  /**
   * 文档名称
   */
  @Rule(RuleType.string().required())
  name: string;
  /**
   * 文档描述
   */
  @Rule(RuleType.string().allow(''))
  description: string;
  /**
   * 文档版本信息
   */
  @Rule(RuleType.string().empty('').default('1.0'))
  version: string;
  /**
   * 文档类型,   1.文件夹 2.HTTP接口 3.HTTP Mock 4.WebSocket 5.Markdown文档
   */
  @Rule(RuleType.string().valid('folder', 'http', 'httpMock', 'websocket', 'markdown').required())
  type: 'folder' | 'http' | 'httpMock' | 'websocket' | 'markdown';
  /**
   * 创建者
   */
  @Rule(RuleType.string())
  creator: string;
  /**
   * 维护人员，最近一次更新人员
   */
  @Rule(RuleType.string().empty(''))
  maintainer: string;
  /**
   * 删除文档的人
   */
  @Rule(RuleType.string().empty(''))
  deletePerson: string;
    /**
   * 删除文档的id
   */
    @Rule(RuleType.string().empty(''))
  deletePersonId: string;
}
class FileInfo {
  @Rule(RuleType.string().allow(''))
  url: string;
  @Rule(RuleType.string().allow(''))
  raw: string;
}
class BinaryValue {
  /**
   * 文件路径
   */
  @Rule(RuleType.string().allow(''))
  path: string;
  /**
   * 文件唯一id，文件将会统一存放服务端，使用这个id来索引文件
   */
  @Rule(RuleType.string().allow(''))
  id: string;
  /**
   * 如果附件小于配置的大小，直接转换为uint8数组返回
   */
  @Rule(RuleType.string().allow(''))
  raw: string;
}
// 定义一个名为 BinaryInfo 的类，用于存储二进制文件的信息
class BinaryInfo {
  /**
   * 类型
   */
  @Rule(RuleType.string().valid('var', 'file'))
  mode: 'var' | 'file';
  @Rule(RuleType.string().allow(''))
  varValue: string;
  @Rule(getSchema(BinaryValue))
  binaryValue: BinaryValue;

}
class ResonseValue {
  @Rule(RuleType.string().allow(''))
  dataType: string;
  @Rule(RuleType.string().allow(''))
  strJson: string;
  @Rule(RuleType.string().allow(''))
  text: string;
  @Rule(getSchema(FileInfo))
  file: FileInfo;
}
//返回参数
class ResponseParams {
  @Rule(RuleType.string())
  _id: string;
  @Rule(RuleType.boolean())
  isMock?: boolean;
  @Rule(RuleType.string())
  title: string;
  @Rule(RuleType.number().allow(200))
  statusCode: number;
  @Rule(getSchema(ResonseValue))
  value: ResonseValue;
}
//请求脚本信息
class RequestScript {
  /**
   * 请求脚本信息
   */
  @Rule(RuleType.string().allow(''))
  raw: string;
}
class RequestUrl {
  /**
   * 接口路径
   */
  @Rule(RuleType.string().allow(''))
  public path: string;
  /**
   * 接口前缀
   */
  @Rule(RuleType.string().allow(''))
  public host: string;
}
class RawBody {
  /**
   * 原始数据值
   */
  @Rule(RuleType.string().required().allow(''))
  public data: string;
  /**
   * 原始数据类型
   */
  @Rule(RuleType.string().required().allow(''))
  public dataType: string;
}
class RequestBody {
  /**
   * 请求模式
   */
  @Rule(RuleType.string().valid('json', 'raw', 'formdata', 'urlencoded', 'binary', 'none'))
  public mode: 'json' | 'raw' | 'formdata' | 'urlencoded' | 'binary' | 'none';
  /**
   * 原始json数据(字符串)
   */
  @Rule(RuleType.string().required().allow(''))
  public rawJson: string;
  /**
   * formData数据
   */
  @Rule(RuleType.array().items(getSchema(BaseProperty)).required())
  public formdata: BaseProperty[];
  /**
   * urlencoded数据
   */
  @Rule(RuleType.array().items(getSchema(BaseProperty)).required())
  public urlencoded: BaseProperty[];
  /**
   * raw数据
   */
  @Rule(getSchema(RawBody).required())
  public raw: RawBody;
  /**
   * binary数据
   */
  @Rule(getSchema(BinaryInfo))
  public binary: BinaryInfo;
}
class ItemInfo {
  /**
   * 请求方法
   */
  @Rule(RuleType.string().default('GET'))
  public method: RequestMethod;
  /**
   * 请求地址信息
   */
  @Rule(getSchema(RequestUrl))
  public url: RequestUrl;
  /**
   * 路径参数
   */
  @Rule(RuleType.array().items(getSchema(BaseProperty)))
  public paths: BaseProperty[];
  /**
   * query参数
   */
  @Rule(RuleType.array().items(getSchema(BaseProperty)))
  public queryParams: BaseProperty[];
  /**
   * body参数
   */
  @Rule(getSchema(RequestBody).required())
  public requestBody: RequestBody;
  /**
   * 返回参数
   */
  @Rule(RuleType.array().items(getSchema(ResponseParams)))
  responseParams: ResponseParams[];
  /**
   * 请求头
   */
  @Rule(RuleType.array().items(getSchema(BaseProperty)))
  public headers: BaseProperty[];
  /**
   * contentType
   */
  @Rule(RuleType.string().allow(''))
  public contentType: string;
}
export class DocInfo {
  /**
   * 文档id
   */
  @Rule(RuleType.string())
  _id: string;
  /**
   * 父元素id
   */
  @Rule(RuleType.string())
  pid: string;
  /**
   * 项目id
   */
  @Rule(RuleType.string().required())
  projectId: string;
  /**
   * 是否为文件夹
   */
  @Rule(RuleType.boolean().required())
  isFolder: boolean;
  /**
   * 排序字段，时间戳
   */
  @Rule(RuleType.number().required().default(Date.now()))
  sort: number;
  /**
   * 文档基本信息
   */
  @Rule(getSchema(DocBaseInfo))
  info: DocBaseInfo;
  /**
   * 前置脚本信息
   */
  @Rule(getSchema(RequestScript))
  preRequest: RequestScript;
  /**
   * 后置脚本信息
   */
  @Rule(getSchema(RequestScript))
  afterRequest: RequestScript;
  /**
   * 公共请求头
   */
  @Rule(RuleType.array().items(getSchema(CommonHeaderItem)))
  commonHeaders: CommonHeaderItem[];
  /**
   * 接口相关元素
   */
  @Rule(getSchema(ItemInfo))
  item: ItemInfo;
  /**
   * 返回参数
   */
  @Rule(RuleType.array().items(getSchema(ResponseParams)))
  responseParams: ResponseParams[];
  /**
   * mock信息
  */
  @Rule(getSchema(MockInfo))
  mockInfo: MockInfo;
}
export class ImportedDocInfo {
  /**
   * 文档id
   */
  @Rule(RuleType.string())
  _id: string;
  /**
   * 版本信息
   */
  @Rule(RuleType.number())
  __v: number;
  /**
   * 父元素id
   */
  @Rule(RuleType.string())
  pid: string;
  /**
   * 项目id
   */
  @Rule(RuleType.string().required())
  projectId: string;
  /**
   * 是否为文件夹
   */
  @Rule(RuleType.boolean().required())
  isFolder: boolean;
  /**
   * 排序字段，时间戳
   */
  @Rule(RuleType.number().required().default(Date.now()))
  sort: number;
  /**
   * 文档基本信息
   */
  @Rule(getSchema(DocBaseInfo))
  info: DocBaseInfo;
  /**
   * 前置脚本信息
   */
  @Rule(getSchema(RequestScript))
  preRequest: RequestScript;
  /**
   * 后置脚本信息
   */
  @Rule(getSchema(RequestScript))
  afterRequest: RequestScript;
  /**
   * 公共请求头
   */
  @Rule(RuleType.array().items(getSchema(CommonHeaderItem)))
  commonHeaders: CommonHeaderItem[];
  /**
   * 接口相关元素
   */
  @Rule(getSchema(ItemInfo))
  item: ItemInfo;
  /**
   * 返回参数
   */
  @Rule(RuleType.array().items(getSchema(ResponseParams)))
  responseParams: ResponseParams[];
  /**
   * mock信息
  */
  @Rule(getSchema(MockInfo))
  mockInfo: MockInfo;
  /**
   * 创建时间
   */
  @Rule(RuleType.string())
  createdAt: string;
  /**
   * 更新时间
   */
  @Rule(RuleType.string())
  updatedAt: string;
  /**
   * 是否删除
   */
  @Rule(RuleType.boolean())
  isEnabled: boolean;
  /**
   * 子元素
   */
  @Rule(RuleType.array().items(RuleType.link('...')).optional())
  children?: ImportedDocInfo[];
}
/*
|--------------------------------------------------------------------------
| DTO
|--------------------------------------------------------------------------
*/

/**
 * 修改项目脚本代码
 */
export class AddEmptyDocDto {
  /**
   * 文档名称
   */
  @Rule(RuleType.string().required())
  name: string;
  /**
   * 文档类型
   */
  @Rule(RuleType.string().valid('folder', 'http', 'httpMock', 'websocket', 'markdown').required())
  type: 'folder' | 'http' | 'httpMock' | 'websocket' | 'markdown';
  /**
   * 父元素id
   */
  @Rule(RuleType.string().empty(''))
  pid: string;
  /**
   * 所属项目id
   */
  @Rule(RuleType.string().required())
  projectId: string;
}

/**
 * 拷贝一个节点
 */
export class GenerateDocCopyDto {
  /**
   * 节点id
   */
  @Rule(RuleType.string().required())
  _id: string;
  /**
   * 项目id
   */
  @Rule(RuleType.string().required())
  projectId: string;
}
class IdMap {
  @Rule(RuleType.string().required())
  _id: string;
}
/**
 * 粘贴文档
 */
export class PasteDocsDto {
  /**
   * 当前项目id
   */
  @Rule(RuleType.string().required())
  projectId: string;
  /**
   * 来源项目id
   */
  @Rule(RuleType.string().required())
  fromProjectId: string;
  /**
   * 挂载节点id
   */
  @Rule(RuleType.string())
  mountedId: string;
  /**
   * docs
   */
  @Rule(RuleType.array().items(getSchema(IdMap)).required())
  docs: IdMap[];
}
/**
 * 改变文档位置信息 todo 迁移前用于历史记录
 */
// class DropInfo {
//   /**
//    * 被drag节点名称
//    */
//   @Rule(RuleType.string().required())
//     nodeName: string;
//   /**
//    * 被drag节点id
//    */
//   @Rule(RuleType.string().required())
//     nodeId: string;
//   /**
//    * 文档drop时候相对的那个节点id
//    */
//   @Rule(RuleType.string().required())
//     dropNodeId: string;
//   /**
//    * 文档drop时候相对的那个节点名称
//    */
//   @Rule(RuleType.string().required())
//     dropNodeName: string;
//   /**
//    * 文档drop时候类型，
//    */
//   @Rule(RuleType.string().valid('before', 'after', 'inner').required())
//     dropType: 'before' | 'after' | 'inner';
// }
export class ChangeDocPositionDto {
  /**
   * 当前项目id
   */
  @Rule(RuleType.string().required())
  projectId: string;
  /**
   * 需要改变的文档id
   */
  @Rule(RuleType.string().required())
  _id: string;
  /**
   * 需要改变的文档父级id
   */
  @Rule(RuleType.string().allow(''))
  pid: string;
  /**
   * 文档排序
   */
  @Rule(RuleType.number())
  sort: number;
}
/**
 * 改变文档基本信息
 */
export class ChangeDocBaseInfoDto {
  /**
   * 文档id
   */
  @Rule(RuleType.string().required())
  _id: string;
  /**
   * 文档所属项目id
   */
  @Rule(RuleType.string().required())
  projectId: string;
  /**
   * 文档名称
   */
  @Rule(RuleType.string())
  name?: number;
}
/**
 * 更新文档
 */
export class UpdateDoc {
  /**
   * 文档id
   */
  @Rule(RuleType.string().required())
  _id: string;
  /**
   * 项目id
   */
  @Rule(RuleType.string().required())
  projectId: string;
  /**
   * 文档信息
   */
  @Rule(getSchema(DocBaseInfo).required())
  info: DocBaseInfo;
  /**
   * 接口信息（HTTP节点使用）
   */
  @Rule(getSchema(ItemInfo))
  item: ItemInfo;
  /**
   * 前置脚本信息（HTTP节点使用）
   */
  @Rule(getSchema(RequestScript))
  preRequest: RequestScript;
  /**
   * 后置脚本信息（HTTP节点使用）
   */
  @Rule(getSchema(RequestScript))
  afterRequest: RequestScript;
  /**
   * mock信息（HTTP节点使用）
   */
  @Rule(getSchema(MockInfo))
  mockInfo: MockInfo;
  /**
   * WebSocket节点数据
   */
  @Rule(getSchema(WebsocketItem))
  websocketItem: WebsocketItem;
  /**
   * HttpMock节点数据
   */
  @Rule(getSchema(HttpMockItem))
  httpMockItem: HttpMockItem;
}

/**
 * 创建文档(保存文档)
 */
export class CreateDocDto {
  /**
   * 文档
   */
  @Rule(getSchema(DocInfo))
  docInfo: DocInfo;
}

/**
 * 获取文档详情
 */
export class GetDocDetailDto {
  /**
   * 文档id
   */
  @Rule(RuleType.string().required())
  _id: string;
  /**
   * 项目id
   */
  @Rule(RuleType.string().required())
  projectId: string;
}
/**
 * 删除文档
 */
export class DeleteDocDto {
  /**
   * 需要删除文档的id集合
   */
  @Rule(RuleType.array().items(RuleType.string()).required())
  ids: string;
  /**
   * 项目id
   */
  @Rule(RuleType.string().required())
  projectId: string;
}

/**
 * 获取文档mock数据
 */
export class GetMockDataDto {
  /**
   * 文档id
   */
  @Rule(RuleType.string().required())
  _id: string;
}
/**
 * 以树形结构获取文档
 */
export class GetDocsAsTreeDto {
  /**
   * 项目id
   */
  @Rule(RuleType.string().required())
  projectId: string;
}
/**
 * 获取已删除文档列表
 */
export class GetDeletedDocListDto {
  /**
   * 项目id
   */
  @Rule(RuleType.string().required())
  projectId: string;
  /**
   * 页码
   */
  @Rule(RuleType.number().default(1))
  pageNum: number;
  /**
   * 每页数量
   */
  @Rule(RuleType.number().default(10))
  pageSize: number;
  /**
   * 开始时间
   */
  @Rule(RuleType.number().allow(null))
  startTime: number | null;
  /**
   * 结束时间
   */
  @Rule(RuleType.number().allow(null))
  endTime: number | null;
  /**
   * 请求url
   */
  @Rule(RuleType.string().allow(''))
  url: string;
  /**
   * 接口名称
   */
  @Rule(RuleType.string().allow(''))
  docName: string;
  /**
   * 操作者
   */
  @Rule(RuleType.array().items(RuleType.string()))
  operators: string[];
}

export class GetDocHistoryOperatorsDto {
  /**
   * 项目id
   */
  @Rule(RuleType.string().required())
    projectId: string;
}

/**
 * 恢复文档
 */
export class RestoreDocDto {
  /**
   * 文档id
   */
  @Rule(RuleType.string().required())
  _id: string;
  /**
   * 项目id
   */
  @Rule(RuleType.string().required())
  projectId: string;
}
