import {
  Inject,
  Controller,
  Body,
  Post,
  Del,
  Get,
  Put,
  Query,
} from '@midwayjs/core';
import { AddDocPrefixDto, DeleteDocPrefix, GetDocPrefixList, GetDocPrefixInfo, EditDocPrefix } from '../../types/dto/doc/doc.prefix.dto.js';
import { DocPrefixServer } from '../../service/doc/doc_prefix.js';

@Controller('/api')
export class DocPrefixController {
  @Inject()
    docPrefixService: DocPrefixServer;

  /**
   * 新增接口前缀
   */
  @Post('/project/doc_service')
  async addDocPrefix(@Body() params: AddDocPrefixDto) {
    const data = await this.docPrefixService.addDocPrefix(params);
    return data;
  }
  /**
   * 删除接口前缀
   */
  @Del('/project/doc_service')
  async deleteDocPrefix(@Body() params: DeleteDocPrefix) {
    const data = await this.docPrefixService.deleteDocPrefix(params);
    return data;
  }
  /**
   * 列表形式获取前缀
   */
  @Get('/project/doc_service')
  async getDocPrefixList(@Query() params: GetDocPrefixList) {
    const data = await this.docPrefixService.getDocPrefixList(params);
    return data;
  }
  /**
   * 获取前缀详情
   */
  @Get('/project/doc_service_info')
  async getDocPrefixInfo(@Query() params: GetDocPrefixInfo) {
    const data = await this.docPrefixService.getDocPrefixInfo(params);
    return data;
  }
  /**
   * 修改前缀信息
   */
  @Put('/project/doc_service')
  async editDocPrefix(@Body() params: EditDocPrefix) {
    const data = await this.docPrefixService.editDocPrefix(params);
    return data;
  }
}
