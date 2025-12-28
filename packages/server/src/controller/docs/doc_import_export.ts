import {
  Controller,
  Body,
  Post,
  Inject,
} from '@midwayjs/core';
import { ExportAsApiflowDto, ExportAsHTMLDto, ExportAsWordDto } from '../../types/dto/doc/doc.import.export.js';
import { DocImportAndExportService } from '../../service/doc/doc_import_export.js';

@Controller('/api')
export class DocImportAndExport {
  @Inject()
    docImportAndExportService: DocImportAndExportService;

  /**
   * 导出为html
   */
  @Post('/project/export/html')
  async exportAsHTML(@Body() params: ExportAsHTMLDto) {
    const data = await this.docImportAndExportService.exportAsHTML(params);
    return data;
  }
  /**
   * 导出为word
   */
  @Post('/project/export/word')
  async exportAsWord(@Body() params: ExportAsWordDto) {
    const data = await this.docImportAndExportService.exportAsWord(params);
    return data;
  }
  /**
   * 导出为apiflow文档
   */
  @Post('/project/export/json')
  async exportAsApiflow(@Body() params: ExportAsApiflowDto) {
    const data = await this.docImportAndExportService.exportAsApiflow(params);  
    return data;
  }
}
