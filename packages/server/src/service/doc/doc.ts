import { Context, Inject, Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { Doc } from '../../entity/doc/doc.js';
import { CommonController } from '../../controller/common/common.js';
import { LoginTokenInfo, RequestMethod } from '../../types/types.js';
import { AddEmptyDocDto,
  ChangeDocBaseInfoDto,
  ChangeDocPositionDto,
  CreateDocDto,
  DeleteDocDto,
  GenerateDocCopyDto,
  GetDocDetailDto,
  GetMockDataDto,
  PasteDocsDto,
  UpdateDoc,
  GetDocsAsTreeDto,
  GetDeletedDocListDto,
  GetDocHistoryOperatorsDto,
  RestoreDocDto
} from '../../types/dto/doc/doc.dto.js';
import { throwError } from '../../utils/utils.js';
import { Project } from '../../entity/project/project.js';
import { Types } from 'mongoose';
import lodash from 'lodash';
import { User } from '../../entity/security/user.js';

@Provide()
export class DocService {
  @InjectEntityModel(Doc)
    docModel: ReturnModelType<typeof Doc>;
  @InjectEntityModel(Project)
    projectModel: ReturnModelType<typeof Project>;
  @InjectEntityModel(User)
    userModel: ReturnModelType<typeof User>;
  @Inject()
    commonControl: CommonController
  @Inject()
    ctx: Context & { tokenInfo: LoginTokenInfo };
  /**
   * 新增空白文档
   */
  async addEmptyDoc(params: AddEmptyDocDto) {
    const { name, type, pid, projectId} = params;
    const userInfo = this.ctx.tokenInfo;
    await this.commonControl.checkDocOperationPermissions(projectId);
    if (pid) { //不允许在非folder类型文档下面插入文档
      const parentDoc = await this.docModel.findOne({ _id: pid });
      if (parentDoc.info.type !== 'folder') {
        throwError(4001, '操作不被允许，文件下面不允许嵌套文件夹')
      }
    }
    
    // 基础文档信息
    const baseDoc = {
      pid,
      projectId,
      isFolder: type === 'folder',
      sort: Date.now(),
      info: {
        name,
        type,
        version: '1.0',
        creator: userInfo.loginName,
      },
    };
    
    // 根据类型初始化不同的数据结构
    let doc: Record<string, any> = { ...baseDoc };
    
    switch (type) {
      case 'folder':
        // 文件夹不需要额外的请求数据
        break;
        
      case 'http':
        // HTTP节点初始化
        doc.item = {
          method: 'GET',
          url: {
            host: '',
            path: ''
          },
          paths: [],
          queryParams: [],
          requestBody: {
            mode: 'json',
            rawJson: '',
            formdata: [],
            urlencoded: [],
            raw: {
              data: '',
              dataType: 'text/plain'
            },
            binary: {
              mode: 'file',
              varValue: '',
              binaryValue: {
                path: '',
                id: '',
                raw: ''
              }
            }
          },
          headers: [],
          contentType: '',
          responseParams: [
            {
              _id: new Types.ObjectId().toString(),
              title: '成功返回',
              statusCode: 200,
              value: {
                dataType: 'application/json',
                strJson: '',
                file: {
                  url: '',
                  raw: ''
                },
                text: ''
              }
            }
          ]
        };
        doc.preRequest = { raw: '' };
        doc.afterRequest = { raw: '' };
        break;
        
      case 'websocket':
        // WebSocket节点初始化
        doc.websocketItem = {
          item: {
            protocol: 'ws',
            url: {
              path: '',
              prefix: ''
            },
            queryParams: [],
            headers: [],
            messageBlocks: [
              {
                id: new Types.ObjectId().toString(),
                name: '',
                content: '',
                messageType: 'json',
                order: 0
              }
            ]
          },
          config: {
            autoSend: false,
            autoSendInterval: 30000,
            autoSendContent: 'ping',
            autoSendMessageType: 'json',
            autoReconnect: false
          },
          preRequest: { raw: '' },
          afterRequest: { raw: '' }
        };
        break;
        
      case 'httpMock':
        // HttpMock节点初始化
        doc.httpMockItem = {
          requestCondition: {
            method: ['ALL'],
            url: '/mock/v1',
            port: 4000
          },
          config: {
            delay: 0
          },
          response: [
            {
              name: '默认返回',
              isDefault: true,
              conditions: {
                name: '',
                scriptCode: '',
                enabled: false
              },
              statusCode: 200,
              headers: {
                enabled: false,
                defaultHeaders: [
                  { _id: new Types.ObjectId().toString(), key: 'Content-Type', value: 'application/json; charset=utf-8', type: 'string', description: '响应内容类型', required: true, select: true }
                ],
                customHeaders: []
              },
              dataType: 'json',
              sseConfig: {
                event: {
                  id: { enable: false, valueMode: 'increment' },
                  event: { enable: true, value: 'message' },
                  data: { mode: 'json', value: '' },
                  retry: { enable: false, value: 3000 }
                },
                interval: 100,
                maxNum: 10
              },
              jsonConfig: {
                mode: 'fixed',
                fixedData: '',
                randomSize: 0,
                prompt: ''
              },
              textConfig: {
                mode: 'fixed',
                textType: 'text/plain',
                fixedData: '',
                randomSize: 0,
                prompt: ''
              },
              imageConfig: {
                mode: 'fixed',
                imageConfig: 'png',
                randomSize: 10,
                randomWidth: 100,
                randomHeight: 100,
                fixedFilePath: ''
              },
              fileConfig: {
                fileType: 'doc'
              },
              binaryConfig: {
                filePath: ''
              },
              redirectConfig: {
                statusCode: 302,
                location: ''
              }
            }
          ]
        };
        break;

      case 'websocketMock':
        doc.websocketMockItem = {
          requestCondition: {
            port: 4001,
            path: '/ws',
          },
          config: {
            delay: 0,
            echoMode: false,
          },
          response: {
            content: '',
          },
        };
        break;

      default:
        // 默认情况（包括 markdown 等其他类型），只保留基础信息
        break;
    }
    
    const result = await this.docModel.create(doc);
    const docLen = await this.docModel.find({ projectId, isFolder: false, isEnabled: true }).countDocuments();
    //=====================================添加历史记录====================================//
    if (type !== 'folder') {
      await this.projectModel.findByIdAndUpdate({ _id: projectId }, { $set: { docNum: docLen }});
    }
    //=========================================================================//
    
    // 根据类型返回不同的数据结构
    const baseReturn = {
      _id: result._id,
      pid: result.pid,
      sort: result.sort,
      name: result.info.name,
      type: result.info.type,
      maintainer: result.info.maintainer,
      updatedAt: result.updatedAt,
      isFolder: result.isFolder,
      children: [],
    };
    
    switch (type) {
      case 'folder':
        return baseReturn;
        
      case 'http':
        return {
          ...baseReturn,
          method: result.item?.method || 'GET',
          url: result.item?.url?.path || '',
          customMockUrl: result.mockInfo?.path || '',
        };
        
      case 'websocket':
        return {
          ...baseReturn,
          protocol: result.websocketItem?.item?.protocol || 'ws',
          url: {
            path: result.websocketItem?.item?.url?.path || '',
            prefix: result.websocketItem?.item?.url?.prefix || '',
          },
        };
        
      case 'httpMock':
        return {
          ...baseReturn,
          method: result.httpMockItem?.requestCondition?.method?.[0] || 'ALL',  
          url: result.httpMockItem?.requestCondition?.url || '',
          port: result.httpMockItem?.requestCondition?.port || 4000,
          state: 'stopped',
        };

      case 'websocketMock':
        return {
          ...baseReturn,
          path: result.websocketMockItem?.requestCondition?.path || '',
          port: result.websocketMockItem?.requestCondition?.port || 4001,
          state: 'stopped',
        };

      default:
        return baseReturn;
    }
  }
  /**
   * 生成文档副本
   */
  async generateDocCopy(params: GenerateDocCopyDto) {
    const { _id, projectId } = params;
    await this.commonControl.checkDocOperationPermissions(projectId);
    const doc = await this.docModel.findOne({ _id }).lean();
    doc.item.method = doc.item.method.toUpperCase() as RequestMethod;
    doc.info.name = '副本-' + doc.info.name;
    doc._id = new Types.ObjectId();
    doc.sort += 1;
    const result = await this.docModel.create(doc);
    if (!doc.isFolder) {
      await this.projectModel.findByIdAndUpdate({ _id: doc.projectId }, { $inc: { docNum: 1 }});
    }
    return {
      _id: result._id,
      pid: result.pid,
      sort: result.sort,
      isFolder: result.isFolder,
      updatedAt: result.updatedAt,
      type: result.info.type,
      name: result.info.name,
      maintainer: result.info.maintainer,
      method: result.item.method,
      url: result.item.url.path,
    };
  }
  /**
   * 粘贴文档
   */
  async pasteDocs(params: PasteDocsDto) {
    const { projectId, docs, mountedId = '', fromProjectId } = params;
    await this.commonControl.checkDocOperationPermissions(projectId);
    await this.commonControl.checkDocOperationPermissions(fromProjectId);
    const docIds = docs.map(v => v._id);
    const matchedDocs = await this.docModel.find({ projectId: fromProjectId, _id: { $in: docIds } }).lean();
    const idMap: {
      newId: string;
      oldId: string;
      newPid: string;
    }[] = [];
    //先重新绑定pid
    matchedDocs.forEach((docInfo) => {
      const newId = new Types.ObjectId().toString();
      const oldId = docInfo._id.toString();
      const oldPid = docInfo.pid;
      docInfo.sort = Date.now();
      const mapInfo = {
        newId,
        newPid: '',
        oldId,
        oldPid,
      };
      matchedDocs.forEach((docInfo2) => {
        const pid2 = docInfo2.pid;
        if (pid2 === oldId) { //说明这个是子元素
          docInfo2.pid = newId;
          mapInfo.newPid = newId;
        }
      })
      const hasParent = matchedDocs.find((v) => v._id.toString() === docInfo.pid);
      if (!hasParent) {
        docInfo.pid = mountedId;
        mapInfo.newPid = mountedId;
      }
      idMap.push(mapInfo);
      docInfo._id = new Types.ObjectId(newId);
      docInfo.projectId = projectId;
      docInfo.sort = Date.now();
    })
    await this.docModel.insertMany(matchedDocs);
    return idMap;
  }
  /**
   * 改变文档位置信息
   */
  async changeDocPosition(params: ChangeDocPositionDto) {
    const { _id, pid, sort, projectId } = params;
    await this.commonControl.checkDocOperationPermissions(projectId);
    const updateDoc = { $set: {
      pid: '',
      sort: 0
    }};
    let parentDoc = null;
    let isFolder = null;
    updateDoc.$set.pid = pid;
    updateDoc.$set.sort = sort;
    if (pid) {
      parentDoc = await this.docModel.findById({ _id: pid });
      isFolder = parentDoc.isFolder;
    }
    if (parentDoc && !isFolder) {
      throwError(4001, '操作不被允许，pid对应的父元素不是文件夹')
    }
    await this.docModel.findByIdAndUpdate({ _id }, updateDoc);
    return;
  }
  /**
   * 修改文档基础信息
   */
  async changeDocBaseInfo(params: ChangeDocBaseInfoDto) {
    const { _id, name, projectId } = params;
    await this.commonControl.checkDocOperationPermissions(projectId);
    await this.docModel.findByIdAndUpdate({ _id }, { $set: { 'info.name': name }});
    return { _id };
  }
  /**
   * 改变文档请求相关数据
   */
  async updateDoc(params: UpdateDoc) {
    const { _id, info, item, preRequest, afterRequest, projectId, mockInfo, websocketItem, httpMockItem, websocketMockItem} = params;
    await this.commonControl.checkDocOperationPermissions(projectId);
    const { tokenInfo } = this.ctx;
    
    // 先获取文档类型
    const doc = await this.docModel.findById({ _id }).lean();
    if (!doc) {
      throwError(4001, '文档不存在');
    }
    
    const docType = info?.type || doc.info?.type;
    
    // 根据文档类型构建更新数据
    const updateInfo: Record<string, any> = {
      $set: {
        'info.description': info.description,
        'info.maintainer': tokenInfo.loginName,
      },
    };
    
    // HTTP节点更新
    if (docType === 'http') {
      if (item) updateInfo.$set.item = item;
      if (preRequest) updateInfo.$set.preRequest = preRequest;
      if (afterRequest) updateInfo.$set.afterRequest = afterRequest;
      if (mockInfo) updateInfo.$set.mockInfo = mockInfo;
    }
    
    // WebSocket节点更新
    if (docType === 'websocket' && websocketItem) {
      updateInfo.$set.websocketItem = websocketItem;
    }
    
    // HttpMock节点更新
    if (docType === 'httpMock' && httpMockItem) {
      updateInfo.$set.httpMockItem = httpMockItem;
    }

    // WebSocketMock节点更新
    if (docType === 'websocketMock' && websocketMockItem) {
      updateInfo.$set.websocketMockItem = websocketMockItem;
    }

    await this.docModel.findByIdAndUpdate({ _id }, updateInfo);
    return;
  }
  /**
   * 创建文档
   */
  async createDoc(params: CreateDocDto) {
    const { docInfo } = params;
    await this.commonControl.checkDocOperationPermissions(docInfo.projectId);
    const _id = new Types.ObjectId().toString();
    docInfo._id = _id
    const result = await this.docModel.create(docInfo);
    return result._id;
  }
  /**
   * 获取文档详情
   */
  async getDocDetail(params: GetDocDetailDto) {
    const { _id, projectId } = params;
    await this.commonControl.checkDocOperationPermissions(projectId, 'readOnly');
    const result = await this.docModel.findOne({ _id }, { pid: 0, sort: 0, isEnabled: 0 }).lean();
    if (!result) {
      throwError(4001, '暂无文档信息')
    }
    result.preRequest = result.preRequest ? result.preRequest : {
      raw: ''
    }
    result.afterRequest = result.afterRequest ? result.afterRequest : {
      raw: ''
    }
    
    // 根据节点类型处理返回数据
    const nodeType = result.info?.type;
    if (nodeType === 'websocket' && result.websocketItem) {
      // WebSocket节点：将websocketItem的内容提取到根级别
      const wsItem = result.websocketItem.item;
      const websocketData = {
        _id: result._id,
        pid: result.pid || '',
        projectId: result.projectId,
        sort: result.sort || 0,
        isFolder: result.isFolder,
        info: result.info,
        item: {
          protocol: wsItem?.protocol || 'ws',
          url: wsItem?.url || { path: '', prefix: '' },
          queryParams: wsItem?.queryParams || [],
          headers: wsItem?.headers || [],
          messageBlocks: wsItem?.messageBlocks || [],
        },
        config: result.websocketItem.config || {
          autoSend: false,
          autoSendInterval: 30000,
          autoSendContent: 'ping',
          autoSendMessageType: 'json',
          autoReconnect: false,
        },
        preRequest: result.websocketItem.preRequest || result.preRequest,
        afterRequest: result.websocketItem.afterRequest || result.afterRequest,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        isDeleted: !result.isEnabled,
      };
      return websocketData;
    } else if (nodeType === 'httpMock' && result.httpMockItem) {
      // HttpMock节点：将httpMockItem的内容提取到根级别
      const httpMockData = {
        _id: result._id,
        projectId: result.projectId,
        isFolder: result.isFolder,
        info: result.info,
        requestCondition: result.httpMockItem.requestCondition || {
          method: ['ALL'],
          url: '',
          port: 3000,
        },
        config: result.httpMockItem.config || {
          delay: 0,
        },
        response: result.httpMockItem.response || [],
        preRequest: result.preRequest,
        afterRequest: result.afterRequest,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      };
      return httpMockData;
    } else if (nodeType === 'websocketMock' && result.websocketMockItem) {
      const websocketMockData = {
        _id: result._id,
        pid: result.pid || '',
        projectId: result.projectId,
        sort: result.sort || 0,
        isFolder: result.isFolder,
        info: result.info,
        requestCondition: result.websocketMockItem.requestCondition || {
          port: 4001,
          path: '/ws',
        },
        config: result.websocketMockItem.config || {
          delay: 0,
          echoMode: false,
        },
        response: result.websocketMockItem.response || {
          content: '',
        },
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        isDeleted: !result.isEnabled,
      };
      return websocketMockData;
    }

    return result;
  }
  /**
   * 删除文档
   */
  async deleteDoc(params: DeleteDocDto) {
    const { ids, projectId } = params;
    const { tokenInfo } = this.ctx;
    const result = await this.docModel.updateMany({
      projectId,
      _id: { $in: ids }
    }, {
      $set: {
        isEnabled: false,
        'info.deletePerson': tokenInfo.loginName,
        'info.deletePersonId': tokenInfo.id
      }
    }); //文档祖先包含删除元素，那么该文档也需要被删除
    const docLen = await this.docModel.find({ projectId, isFolder: false, isEnabled: true }).countDocuments();
    await this.projectModel.findByIdAndUpdate({ _id: projectId }, { $set: { docNum: docLen }});
    return result;
  }
  /**
   * 获取mock文档数据
   */
  async getMockData(params: GetMockDataDto) {
    // const { _id } = params;
    // const doc = await this.docModel.findOne({ _id, isEnabled: true }).lean();
    // const result = this.convertPlainParamsToTreeData(doc.item.responseParams);
    return params;
  }
  /**
   * 以树形结构获取文档
   */
  async getDocsAsTree(params: GetDocsAsTreeDto, ignorePermission?: boolean) {   
    const { projectId } = params;
    if (!ignorePermission) {
      await this.commonControl.checkDocOperationPermissions(projectId, 'readOnly');
    }
    const result: Partial<Doc>[] = [];
    const docsInfo = await this.docModel.find({
      projectId: projectId,
      isEnabled: true
    }, {
      pid: 1,
      info: 1,
      'item.method': 1,
      'item.url': 1,
      'mockInfo.path': 1,
      'websocketItem.item.protocol': 1,
      'websocketItem.item.url': 1,
      'httpMockItem.requestCondition': 1,
      'websocketMockItem.requestCondition': 1,
      isFolder: 1,
      sort: 1,
      updatedAt: 1,
    }).sort({
      isFolder: -1,
      sort: 1
    }).lean();
    const pickedData =  docsInfo.map(val => {
      const baseData = {
        _id: val._id,
        pid: val.pid,
        sort: val.sort,
        name: val.info.name,
        type: val.info.type,
        maintainer: val.info.maintainer,
        updatedAt: val.updatedAt,
        isFolder: val.isFolder,
        children: [],
      };
      // 文件夹
      if (val.isFolder) {
        return baseData;
      }
      // WebSocket 节点
      if (val.info.type === 'websocket') {
        return {
          ...baseData,
          protocol: val.websocketItem?.item?.protocol || 'ws',
          url: {
            path: val.websocketItem?.item?.url?.path || '',
            prefix: val.websocketItem?.item?.url?.prefix || '',
          },
        };
      }
      // HttpMock 节点
      if (val.info.type === 'httpMock') {
        return {
          ...baseData,
          method: val.httpMockItem?.requestCondition?.method?.[0] || 'ALL',     
          url: val.httpMockItem?.requestCondition?.url || '',
          port: val.httpMockItem?.requestCondition?.port || 3000,
          state: 'stopped',
        };
      }
      // WebSocketMock 节点
      if (val.info.type === 'websocketMock') {
        return {
          ...baseData,
          path: val.websocketMockItem?.requestCondition?.path || '',
          port: val.websocketMockItem?.requestCondition?.port || 4001,
          state: 'stopped',
        };
      }
      // HTTP 节点（默认）
      return {
        ...baseData,
        method: val.item.method,
        url: val.item.url ? val.item.url.path : '',
        customMockUrl: val.mockInfo?.path || '',
      };
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
   * 以树形结构获取文件夹信息
   */
  async getFoldersAsTree(params: GetDocsAsTreeDto) {
    const { projectId } = params;
    await this.commonControl.checkDocOperationPermissions(projectId, 'readOnly');
    const result: Partial<Doc>[] = [];
    const docsInfo = await this.docModel.find({
      projectId: projectId,
      isFolder: true,
      isEnabled: true,
    }).sort({
      isFolder: -1,
      sort: 1
    }).lean();
    const pickedData =  docsInfo.map(val => {
      if (val.isFolder) {
        return {
          _id: val._id,
          pid: val.pid,
          sort: val.sort,
          name: val.info.name,
          type: val.info.type,
          maintainer: val.info.maintainer,
          isFolder: val.isFolder,
          children: [],
        };
      } else {
        return {
          _id: val._id,
          pid: val.pid,
          sort: val.sort,
          name: val.info.name,
          type: val.info.type,
          method: val.item.method,
          maintainer: val.info.maintainer,
          isFolder: val.isFolder,
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
   * 获取已删除文档列表
   */
  async getDeletedDocList(params: GetDeletedDocListDto) {
    const {
      projectId,
      pageNum = 1,
      pageSize = 10,
      startTime,
      endTime,
      url = '',
      docName = '',
      operators = []
    } = params;
    await this.commonControl.checkDocOperationPermissions(projectId, 'readOnly');
    let skipNum = 0;
    let limit = 100;
    const filter: Record<string, any> = {
      projectId,
      isEnabled: false
    };
    if (operators.length > 0) {
      filter['info.deletePersonId'] = { $in: operators };
    }
    if (pageSize != null && pageNum != null) {
      skipNum = (pageNum - 1) * pageSize;
      limit = pageSize;
    }
    if (startTime != null && endTime != null) {
      filter.updatedAt = {
        $gte: new Date(startTime),
        $lte: new Date(endTime)
      };
    }
    if (url) {
      const urlReg = new RegExp(lodash.escapeRegExp(url));
      filter.$or = [
        { 'item.url.path': urlReg },
        { 'websocketItem.item.url.path': urlReg },
        { 'httpMockItem.requestCondition.url': urlReg },
        { 'websocketMockItem.requestCondition.path': urlReg },
      ];
    }
    if (docName) {
      filter['info.name'] = new RegExp(lodash.escapeRegExp(docName));
    }
    const [rows, total] = await Promise.all([
      this.docModel.find(filter, {
        "item.url": 1,
        "item.method": 1,
        "websocketItem.item.url": 1,
        "websocketItem.item.protocol": 1,
        "httpMockItem.requestCondition.url": 1,
        "httpMockItem.requestCondition.method": 1,
        "websocketMockItem.requestCondition.path": 1,
        "info.name": 1,
        "info.type": 1,
        "info.deletePerson": 1,
        "updatedAt": 1,
        pid: 1,
        isFolder: 1,
      })
        .skip(skipNum)
        .sort({ updatedAt: -1 })
        .limit(limit)
        .lean(),
      this.docModel.countDocuments(filter)
    ]);
    // 字段兼容处理
    const result = rows.map(data => {
      const base = {
        name: data.info.name,
        type: data.info.type,
        deletePerson: data.info.deletePerson || '',
        isFolder: data.isFolder,
        updatedAt: data.updatedAt,
        _id: data._id,
        pid: data.pid,
      };
      // WebSocket 节点
      if (data.info.type === 'websocket') {
        return {
          ...base,
          host: '',
          path: data.websocketItem?.item?.url?.path || data.item?.url?.path || '',
          method: 'GET',
          protocol: data.websocketItem?.item?.protocol || 'ws',
        };
      }
      // HttpMock 节点
      if (data.info.type === 'httpMock') {
        const mockMethod = data.httpMockItem?.requestCondition?.method?.[0];
        return {
          ...base,
          host: '',
          path: data.httpMockItem?.requestCondition?.url || '',
          method: mockMethod === 'ALL' ? 'GET' : (mockMethod || 'GET'),
        };
      }
      // WebSocketMock 节点
      if (data.info.type === 'websocketMock') {
        return {
          ...base,
          host: '',
          path: data.websocketMockItem?.requestCondition?.path || '',
          method: 'GET',
        };
      }
      // HTTP / folder(兜底)
      return {
        ...base,
        host: data.item?.url?.host || '',
        path: data.item?.url?.path || '',
        method: data.item?.method || 'GET',
      };
    });
    return {
      rows: result,
      total
    };
  }
  /**
   * 获取文档操作人员信息
   */
  async getDocHistoryOperators(params: GetDocHistoryOperatorsDto) {
    const { projectId } = params;
    await this.commonControl.checkDocOperationPermissions(projectId, 'readOnly');
    const deletedDocs = await this.docModel.find({
      projectId: projectId,
      isEnabled: false
    }).lean();
    const deletePersonIds = deletedDocs.map(doc => doc.info.deletePersonId);
    const result = await this.userModel.find({
      _id: { $in: deletePersonIds }
    }, { loginName: 1 }).lean();
    return result;
  }
  /**
   * 恢复文档
   */
  async restoreDoc(params: RestoreDocDto): Promise<string[]> {
    const { _id, projectId } = params;
    await this.commonControl.checkDocOperationPermissions(projectId);

    const targetDoc = await this.docModel.findOne({ _id, projectId }, { isFolder: 1 }).lean();
    if (!targetDoc) return [];

    const restoredSet = new Set<string>();
    const restoredIds: string[] = [];
    const addRestoredId = (id: unknown) => {
      const stringId = String(id);
      if (!restoredSet.has(stringId)) {
        restoredSet.add(stringId);
        restoredIds.push(stringId);
      }
    };

    // 1) 恢复父链（确保节点挂载路径存在）
    let currentId = _id;
    while (currentId) {
      const doc = await this.docModel.findById(currentId, { pid: 1, isEnabled: 1 }).lean();
      if (!doc) break;
      if (doc.isEnabled) break; // 已经恢复，无需再处理
      await this.docModel.findByIdAndUpdate(currentId, { $set: { isEnabled: true } });
      addRestoredId(currentId);
      currentId = doc.pid;
    }

    // 2) 如果恢复的是文件夹，则同时恢复其下所有被删除的子孙节点
    if (targetDoc.isFolder) {
      const queue: string[] = [String(targetDoc._id)];
      const visitedFolders = new Set<string>(queue);
      while (queue.length > 0) {
        const pid = queue.shift();
        if (!pid) continue;

        const children = await this.docModel.find(
          { projectId, pid },
          { _id: 1, isEnabled: 1, isFolder: 1 }
        ).lean();

        for (const child of children) {
          const childId = String(child._id);
          if (!child.isEnabled) {
            await this.docModel.findByIdAndUpdate(child._id, { $set: { isEnabled: true } });
            addRestoredId(childId);
          }
          if (child.isFolder && !visitedFolders.has(childId)) {
            visitedFolders.add(childId);
            queue.push(childId);
          }
        }
      }
    }

    const docLen = await this.docModel.find({ projectId, isFolder: false, isEnabled: true }).countDocuments();
    await this.projectModel.findByIdAndUpdate({ _id: projectId }, { $set: { docNum: docLen }});
    return restoredIds;
  }
}
