import {
  Inject,
  Controller,
  Body,
  Post,
  Del,
  Get,
  Query,
} from '@midwayjs/core';
import { AddDocMindParamsDto, DeleteDocMindParams, GetDocMindParamsList } from '../../types/dto/doc/doc.mind.params.js';
import { DocMindParamsServer } from '../../service/doc/doc_mind_params.js';

@Controller('/api')
export class DocMindParamsController {
  @Inject()
    docMindParamsService: DocMindParamsServer;

  /**
   * 新增联想参数
   */
  @Post('/project/doc_params_mind')
  async addDocMindParams(@Body() params: AddDocMindParamsDto) {
    const data = await this.docMindParamsService.addDocMindParams(params);
    return data;
  }
  /**
   * 删除联想参数
   */
  @Del('/project/doc_params_mind"')
  async deleteDocMindParams(@Body() params: DeleteDocMindParams) {
    const data = await this.docMindParamsService.deleteDocMindParams(params);
    return data;
  }
  /**
   * 列表形式获取前缀
   */
  @Get('/project/doc_params_mind"')
  async getDocMindParamsList(@Query() params: GetDocMindParamsList) {
    const data = await this.docMindParamsService.getDocMindParamsList(params);
    return data;
  }
}
