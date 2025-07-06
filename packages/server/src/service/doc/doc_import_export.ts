import { Provide, Inject } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { CommonController } from '../../controller/common/common.js';
import { LoginTokenInfo, RequestMethod } from '../../types/types.js';
import { Doc } from '../../entity/doc/doc.js';
import { ExportAsApiflowDto, ExportAsHTMLDto, ExportAsWordDto, ImportApiflowDto } from '../../types/dto/doc/doc.import.export.js';
import { ProjectService } from '../project/project.js';
import { Context } from '@midwayjs/koa';
import fsExtra from 'fs-extra'
import path from 'path'
import docx from 'docx'
import type { Paragraph as ParagraphType, Table as TableType } from 'docx';
import { convertPlainArrayDataToTreeData, dfsForest } from '../../utils/utils.js';
import { Project } from '../../entity/project/project.js';
import { DocPrefixServer } from './doc_prefix.js';
import { Types } from 'mongoose';
import { DocPrefix } from '../../entity/doc/doc_prefix.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

@Provide()
export class DocImportAndExportService {
  @InjectEntityModel(Doc)
    docModel: ReturnModelType<typeof Doc>;
  @InjectEntityModel(Project)
    projectModel: ReturnModelType<typeof Project>;
  @InjectEntityModel(DocPrefix)
    docPrefixModel: ReturnModelType<typeof DocPrefix>;
  @Inject()
    projectService: ProjectService;
  @Inject()
    docPrefixService: DocPrefixServer;
  @Inject()
    commonControl: CommonController;
  @Inject()
    ctx: Context & { tokenInfo: LoginTokenInfo };
  /**
   * 导出为html
   */
  async exportAsHTML(params: ExportAsHTMLDto) {
    const { projectId, selectedNodes = [] } = params;
    await this.commonControl.checkDocOperationPermissions(projectId);
    const projectInfo = await this.projectService.getProjectFullInfoById({ _id: projectId });
    let docs = [];
    if (selectedNodes.length > 0) { //选择导出
      docs = await this.docModel.find({
        projectId,
        isEnabled: true,
        _id: { $in: selectedNodes }
      }).lean();
    } else { //直接导出
      docs = await this.docModel.find({
        projectId,
        isEnabled: true,
      }).lean();
    }
    const result = {
      projectInfo: {
        projectName: projectInfo.projectName,
        projectId: projectInfo._id,
      },
      nodes: docs.map(doc => {
        return {
          _id: doc._id,
          pid: doc.pid,
          projectId: doc.projectId,
          isFolder: doc.isFolder,
          sort: doc.sort,
          info: doc.info,
          item: doc.item,
          isEnabled: doc.isEnabled,
        };
      }),
      variables: projectInfo.variables,
    };
    let file = await fsExtra.readFile(path.resolve(__dirname, '../../assets/index.html'), 'utf-8');
    file = file.replace(/window.SHARE_DATA = null/, `window.SHARE_DATA = ${JSON.stringify(result)}`);
    file = file.replace(/<title>[^<]*<\/title>/, `<title>${projectInfo.projectName}</title>`);
    this.ctx.set('content-type', 'application/force-download');
    this.ctx.set('content-disposition', `attachment;filename=${encodeURIComponent(`${projectInfo.projectName}.html`)}`);
    return Buffer.from(file, 'utf-8');
  }
  /**
   * 导出为word
   */
  async exportAsWord(params: ExportAsWordDto) {
    const { projectId, selectedNodes = [] } = params;
    const { Document,
      TextRun,
      ShadingType,
      TabStopType,
      Packer,
      Table,
      Paragraph,
      TableRow,
      TableCell,
      VerticalAlign,
      WidthType,
      HeadingLevel,
      AlignmentType } = docx;
    await this.commonControl.checkDocOperationPermissions(projectId);
    const projectInfo = await this.projectService.getProjectFullInfoById({ _id: projectId })
    let docs: Partial<Doc>[] = [];
    if (selectedNodes.length > 0) { //选择导出
      docs = await this.docModel.find({
        projectId,
        isEnabled: true,
        _id: { $in: selectedNodes }
      }, {
        preRequest: 0,
        afterRequest: 0,
        isEnabled: 0,
      }).lean();
    } else { //直接导出
      docs = await this.docModel.find({
        projectId,
        isEnabled: true,
      }, {
        preRequest: 0,
        afterRequest: 0,
        isEnabled: 0,
      }).lean();
    }
    //=========================================================================//
    const document: {
      sections: {
        children: (ParagraphType | TableType)[]
      }[]
    } = {
      sections: [{
        children: [
          new Paragraph({
            text: `${projectInfo.projectName}`,
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER
          })
        ]
      }],
    };
    const nestDocs = convertPlainArrayDataToTreeData(docs);
    dfsForest<Partial<Doc> & { children: [] }>(nestDocs, (data, level) => {
      let headingLevel = HeadingLevel.HEADING_1;
      switch (level) {
      case 1:
        headingLevel = HeadingLevel.HEADING_1;
        break;
      case 2:
        headingLevel = HeadingLevel.HEADING_2;
        break;
      default:
        headingLevel = HeadingLevel.HEADING_2;
        break;
      }
      if (data.isFolder) { //文件夹
        const title = new Paragraph({
          text: `${data.info.name}`,
          heading: headingLevel,
          spacing: {
            before: 400,
          },
        })
        document.sections[0].children.push(title); //标题
      } else {
        const docName = new Paragraph({
          heading: HeadingLevel.HEADING_3,
          children: [
            new TextRun({
              text: `${data.info.name}`,
              size: 26,
            }),
          ],
          spacing: {
            before: 250,
            after: 30,
          },
        })
        const requestMethod = data.item.method;
        const methodText = new TextRun({
          text: `${requestMethod}`,
          color: (requestMethod === 'GET') ? '28a745' : (requestMethod === 'POST') ? 'ffc107' : (requestMethod === 'PUT') ? '#ff4400' : (requestMethod === 'DELETE') ? 'f56c6c' : '444444'
        })
        const method = new Paragraph({ //请求方法
          children: [new TextRun({ text: '请求方法：' }), methodText]
        })
        const url = new Paragraph({ //请求方法
          text: `请求地址：${data.item.url.host + data.item.url.path}`,
        })
        const contentType = new Paragraph({ //contentType
          text: `参数类型：${data.item.contentType}`,
        })
        //=====================================queryParams====================================//
        const queryParamsOfDoc = data.item.queryParams.filter(v => v.key).map(v => {
          return new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph(v.key)],
                verticalAlign: VerticalAlign.CENTER,
              }),
              new TableCell({
                children: [new Paragraph(v.value)],
                verticalAlign: VerticalAlign.CENTER,
              }),
              new TableCell({
                children: [new Paragraph(v.required ? '必填' : '非必填')],
                verticalAlign: VerticalAlign.CENTER,
              }),
              new TableCell({
                children: [new Paragraph(v.description)],
                verticalAlign: VerticalAlign.CENTER,
              }),
            ],
          })
        })

        //=====================================pathParams====================================//
        const pathParamsOfDoc = data.item.queryParams.filter(v => v.key).map(v => {
          return new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph(v.key)],
                verticalAlign: VerticalAlign.CENTER,
              }),
              new TableCell({
                children: [new Paragraph(v.value)],
                verticalAlign: VerticalAlign.CENTER,
              }),
              new TableCell({
                children: [new Paragraph(v.required ? '必填' : '非必填')],
                verticalAlign: VerticalAlign.CENTER,
              }),
              new TableCell({
                children: [new Paragraph(v.description)],
                verticalAlign: VerticalAlign.CENTER,
              }),
            ],
          })
        })
        const tableOfPathParams = new Table({
          width: {
            size: 9638,
            type: WidthType.DXA,
          },
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                new TableCell({
                  children: [new Paragraph('参数名称')],
                  verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                  children: [new Paragraph('参数值')],
                  verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                  children: [new Paragraph('是否必填')],
                  verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                  children: [new Paragraph('备注')],
                  verticalAlign: VerticalAlign.CENTER,
                }),
              ],
            }),
            ...pathParamsOfDoc
          ]
        });
        //=====================================json类型bodyParams====================================//
        const jsonParamsOfDoc: (ParagraphType)[] = [];
        jsonParamsOfDoc.push(new Paragraph({
          shading: {
            type: ShadingType.SOLID,
            color: 'f3f3f3',
          },
          children: [
            new TextRun({
              text: data.item.requestBody.rawJson,
            })
          ]
        }))
        //=====================================formData类型bodyParams====================================//
        const formDataParamsOfDoc = data.item.requestBody.formdata.filter(v => v.key).map(v => {
          return new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph(v.key)],
                verticalAlign: VerticalAlign.CENTER,
              }),
              new TableCell({
                children: [new Paragraph(v.value)],
                verticalAlign: VerticalAlign.CENTER,
              }),
              new TableCell({
                children: [new Paragraph(v.required ? '必填' : '非必填')],
                verticalAlign: VerticalAlign.CENTER,
              }),
              new TableCell({
                children: [new Paragraph(v.description)],
                verticalAlign: VerticalAlign.CENTER,
              }),
            ],
          })
        })
        const tableOfFormDataParams = new Table({
          width: {
            size: 9638,
            type: WidthType.DXA,
          },
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                new TableCell({
                  children: [new Paragraph('参数名称')],
                  verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                  children: [new Paragraph('参数值')],
                  verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                  children: [new Paragraph('是否必填')],
                  verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                  children: [new Paragraph('备注')],
                  verticalAlign: VerticalAlign.CENTER,
                }),
              ],
            }),
            ...formDataParamsOfDoc
          ]
        });
        //=====================================urlencoded类型bodyParams====================================//
        const urlencodedParamsOfDoc = data.item.requestBody.urlencoded.filter(v => v.key).map(v => {
          return new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph(v.key)],
                verticalAlign: VerticalAlign.CENTER,
              }),
              new TableCell({
                children: [new Paragraph(v.value)],
                verticalAlign: VerticalAlign.CENTER,
              }),
              new TableCell({
                children: [new Paragraph(v.required ? '必填' : '非必填')],
                verticalAlign: VerticalAlign.CENTER,
              }),
              new TableCell({
                children: [new Paragraph(v.description)],
                verticalAlign: VerticalAlign.CENTER,
              }),
            ],
          })
        })
        const tableOfUrlencoedParams = new Table({
          width: {
            size: 9638,
            type: WidthType.DXA,
          },
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                new TableCell({
                  children: [new Paragraph('参数名称')],
                  verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                  children: [new Paragraph('参数值')],
                  verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                  children: [new Paragraph('是否必填')],
                  verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                  children: [new Paragraph('备注')],
                  verticalAlign: VerticalAlign.CENTER,
                }),
              ],
            }),
            ...urlencodedParamsOfDoc
          ]
        });
        //=====================================请求头====================================//
        const headerParamsOfDoc = data.item.headers.filter(v => v.key).map(v => {
          return new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph(v.key)],
                verticalAlign: VerticalAlign.CENTER,
              }),
              new TableCell({
                children: [new Paragraph(v.value)],
                verticalAlign: VerticalAlign.CENTER,
              }),
              new TableCell({
                children: [new Paragraph(v.required ? '必填' : '非必填')],
                verticalAlign: VerticalAlign.CENTER,
              }),
              new TableCell({
                children: [new Paragraph(v.description)],
                verticalAlign: VerticalAlign.CENTER,
              }),
            ],
          })
        })
        const tableOfHeaderParams = new Table({
          width: {
            size: 9638,
            type: WidthType.DXA,
          },
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                new TableCell({
                  children: [new Paragraph('参数名称')],
                  verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                  children: [new Paragraph('参数值')],
                  verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                  children: [new Paragraph('是否必填')],
                  verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                  children: [new Paragraph('备注')],
                  verticalAlign: VerticalAlign.CENTER,
                }),
              ],
            }),
            ...headerParamsOfDoc
          ]
        });

        //=========================================================================//
        document.sections[0].children.push(docName);
        document.sections[0].children.push(method);
        document.sections[0].children.push(url);
        if (contentType) {
          document.sections[0].children.push(contentType);
        }
        document.sections[0].children.push(new Paragraph({
          children: [
            new TextRun({
              text: '请求参数',
              bold: true,
            })
          ],
          spacing: {
            before: 250
          },
        }));
        const tableOfQueryParams = new Table({
          width: {
            size: 9638,
            type: WidthType.DXA,
          },
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                new TableCell({
                  children: [new Paragraph('参数名称')],
                  verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                  children: [new Paragraph('参数值')],
                  verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                  children: [new Paragraph('是否必填')],
                  verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                  children: [new Paragraph('备注')],
                  verticalAlign: VerticalAlign.CENTER,
                }),
              ],
            }),
            ...queryParamsOfDoc
          ]
        });
        if (queryParamsOfDoc.length > 0) {
          document.sections[0].children.push(new Paragraph({
            text: 'Query参数',
            spacing: { before: 150, after: 30 },
            tabStops: [
              {
                type: TabStopType.CENTER,
                position: 2268,
              },
            ],
          }));
          document.sections[0].children.push(tableOfQueryParams);
        }
        if (pathParamsOfDoc.length > 0) {
          document.sections[0].children.push(new Paragraph({ text: 'Path参数', spacing: { before: 150, after: 30 } }));
          document.sections[0].children.push(tableOfPathParams);
        }
        if (data.item.contentType === 'application/json') {
          document.sections[0].children.push(new Paragraph({ text: 'Body参数(JSON)', spacing: { before: 150, after: 30 } }));
          document.sections[0].children.push(...jsonParamsOfDoc);
        } else if (data.item.contentType === 'multipart/form-data') {
          document.sections[0].children.push(new Paragraph({ text: 'Body参数(multipart/*)', spacing: { before: 150, after: 30 } }));
          document.sections[0].children.push(tableOfFormDataParams);
        } else if (data.item.contentType === 'application/x-www-form-urlencoded') {
          document.sections[0].children.push(new Paragraph({ text: 'Body参数(x-www-form-urlencoded)', spacing: { before: 150, after: 30 } }));
          document.sections[0].children.push(tableOfUrlencoedParams);
        } else if (data.item.contentType) {
          document.sections[0].children.push(new Paragraph({ text: `Body参数(${data.item.contentType})`, spacing: { before: 150, after: 30 } }));
          document.sections[0].children.push(new Paragraph({ text: data.item.requestBody.raw.data }));
        }
        if (headerParamsOfDoc.length > 0) {
          document.sections[0].children.push(new Paragraph({ text: '请求头', spacing: { before: 150, after: 30 } }));
          document.sections[0].children.push(tableOfHeaderParams);
        }
        //=====================================返回参数====================================//
        document.sections[0].children.push(new Paragraph({
          children: [
            new TextRun({
              text: '返回参数',
              bold: true,
            })
          ],
          spacing: {
            before: 250
          },
        }));
        data.item.responseParams.forEach(res => {
          document.sections[0].children.push(new Paragraph({
            text: `名称：${res.title}`,
            spacing: {
              before: 200
            },
          }));
          document.sections[0].children.push(new Paragraph({
            text: `状态码：${res.statusCode}`,
          }));
          document.sections[0].children.push(new Paragraph({
            text: `参数类型：${res.value.dataType}`,
          }));
          if (res.value.dataType === 'application/json') {
            const jsonDoc = [];
            jsonDoc.push(new Paragraph({
              shading: {
                type: ShadingType.SOLID,
                color: 'f3f3f3',
              },
              children: [
                new TextRun({
                  text: res.value.strJson,
                })
              ]
            }))
            document.sections[0].children.push(...jsonDoc);
          } else {
            document.sections[0].children.push(new Paragraph({ text: res.value.text }));
          }
        })
      }
    });
    const doc = new Document(document);
    const file = await Packer.toBuffer(doc);
    this.ctx.set('content-type', 'application/force-download');
    this.ctx.set('content-disposition', `attachment;filename=${encodeURIComponent(`${projectInfo.projectName}.docx`)}`);
    return file;
  }
  /**
   * 导出为apiflow文档
   */
  async exportAsApiflow(params: ExportAsApiflowDto) {
    const { projectId, selectedNodes = [] } = params;
    await this.commonControl.checkDocOperationPermissions(projectId);
    const projectInfo = await this.projectModel.findOne({ _id: projectId });
    const hosts = await this.docPrefixService.getDocPrefixEnum(params);
    let docs: Partial<Doc>[] = [];
    if (selectedNodes.length > 0) { //选择导出
      docs = await this.docModel.find({
        projectId,
        isEnabled: true,
        _id: { $in: selectedNodes }
      }).lean();
    } else { //直接导出
      docs = await this.docModel.find({
        projectId,
        isEnabled: true,
      }).lean();
    }
    const result = {
      type: 'apiflow',
      info: {
        projectName: projectInfo.projectName,
      },
      docs,
      hosts
    };
    this.ctx.set('content-type', 'application/force-download');
    this.ctx.set('content-disposition', `attachment;filename=${encodeURIComponent(`${projectInfo.projectName}.json`)}`);
    return Buffer.from(JSON.stringify(result), 'utf-8');
  }
  /**
   * 导入文档
   */
  async importApiflow(params: ImportApiflowDto) {
    const { projectId, cover, moyuData } = params;
    await this.commonControl.checkDocOperationPermissions(projectId);
    const { docs = [], hosts = [] } = moyuData;
    const convertDocs = docs.map((docInfo) => {
      const newId = new Types.ObjectId().toString()
      const oldId = docInfo._id.toString();
      docs.forEach(originDoc => {
        if (originDoc.pid === oldId) {
          originDoc.pid = newId
        }
      })
      docInfo.projectId = projectId;
      docInfo._id = newId;
      docInfo.item.method = (docInfo.item?.method?.toUpperCase() as RequestMethod) || 'GET';
      return docInfo;
    })
    const convertHosts = hosts && hosts.map(host => {
      host._id = new Types.ObjectId().toString();
      host.projectId = projectId;
      return host;
    })
    if (cover) {
      await this.docModel.updateMany({ projectId }, { $set: { isEnabled: false } })
      await this.docPrefixModel.updateMany({ projectId }, { $set: { isEnabled: false } });
    }
    await this.docPrefixModel.create(convertHosts);
    await this.docModel.create(convertDocs)
    const docLen = await this.docModel.find({ projectId, isFolder: false, isEnabled: true }).countDocuments();
    await this.projectModel.findByIdAndUpdate({ _id: projectId }, { $set: { docNum: docLen }});
    return;
  }
}
