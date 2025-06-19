import { Inject, Controller, Body, Post, Del, Get, Put, Query } from '@midwayjs/core';
import { AddEmptyDocDto, ChangeDocBaseInfoDto, ChangeDocPositionDto, UpdateDoc, GenerateDocCopyDto, PasteDocsDto, CreateDocDto, GetDocDetailDto, DeleteDocDto, GetMockDataDto, GetDocsAsTreeDto, GetDeletedDocListDto } from '../../types/dto/doc/doc.dto.js';
import { DocService } from '../../service/doc/doc.js';
import { ReqLimit } from '../../decorator/req_limit.decorator.js';

@Controller('/api')
export class DocController {
  @Inject()
    docService: DocService;

  /**
   * 新增空白文档
   */
  @Post('/project/new_doc')
  async addEmptyDoc(@Body() params: AddEmptyDocDto) {
    const data = await this.docService.addEmptyDoc(params);
    return data;
  }
  /**
   * 生成文档副本
   */
  @Post('/project/copy_doc')
  async generateDocCopy(@Body() params: GenerateDocCopyDto) {
    const data = await this.docService.generateDocCopy(params);
    return data;
  }
  /**
   * 粘贴文档
   */
  @Post('/project/paste_docs')
  async pasteDocs(@Body() params: PasteDocsDto) {
    const data = await this.docService.pasteDocs(params);
    return data;
  }
  /**
   * 改变文档位置信息
   */
  @Put('/project/change_doc_pos')
  async changeDocPosition(@Body() params: ChangeDocPositionDto) {
    const data = await this.docService.changeDocPosition(params);
    return data;
  }
  /**
   * 修改文档基础信息
   */
  @Put('/project/change_doc_info')
  async changeDocBaseInfo(@Body() params: ChangeDocBaseInfoDto) {
    const data = await this.docService.changeDocBaseInfo(params);
    return data;
  }
  /**
   *更新文档
   */
  @Post('/project/fill_doc')
  async updateDoc(@Body() params: UpdateDoc) {
    const data = await this.docService.updateDoc(params);
    return data;
  }
  /**
   * 创建文档
   */
  @Post('/project/save_doc')
  async createDoc(@Body() params: CreateDocDto) {
    const data = await this.docService.createDoc(params);
    return data;
  }
  /**
   * 获取文档详情
   */
  @Get('/project/doc_detail')
  @ReqLimit({ max: 15, ttl: 10000 })
  async getDocDetail(@Query() params: GetDocDetailDto) {
    const data = await this.docService.getDocDetail(params);
    return data;
  }
  /**
   * 删除文档
   */
  @Del('/project/doc')
  async deleteDoc(@Body() params: DeleteDocDto) {
    const data = await this.docService.deleteDoc(params);
    return data;
  }
  /**
   * 获取mock文档数据
   */
  @Get('/project/doc_mock')
  async getMockData(@Query() params: GetMockDataDto) {
    const data = await this.docService.getMockData(params);
    return data;
  }
  /**
   * 以树形结构获取文档
   */
  @Get('/project/doc_tree_node')
  async getDocsAsTree(@Query() params: GetDocsAsTreeDto) {
    const data = await this.docService.getDocsAsTree(params);
    return data;
  }
  /**
   * 以树形结构获取文件夹信息
   */
  @Get('/project/doc_tree_folder_node')
  async getFoldersAsTree(@Query() params: GetDocsAsTreeDto) {
    const data = await this.docService.getFoldersAsTree(params);
    return data;
  }
  /**
   * 以树形结构获取文件夹信息
   */
  @Post('/docs/docs_deleted_list')
  async getDeletedDocList(@Body() params: GetDeletedDocListDto) {
    const data = await this.docService.getDeletedDocList(params);
    return data;
  }
  /**
   * 获取文档操作人员信息
   */
  @Get('/docs/docs_history_operator_enum')
  async getDocHistoryOperators(@Query('projectId') projectId: string) {
    const data = await this.docService.getDocHistoryOperators(projectId);
    return data;
  }
}
