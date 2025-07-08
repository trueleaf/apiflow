import { Provide, Inject } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { CommonController } from '../../controller/common/common.js';
import { LoginTokenInfo, RequestMethod } from '../../types/types.js';
import { Doc } from '../../entity/doc/doc.js';
import { ExportAsApiflowDto, ExportAsHTMLDto, ExportAsWordDto, ExportAsOpenApiDto, ExportAsMarkdownDto, ImportApiflowDto } from '../../types/dto/doc/doc.import.export.js';
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
    let jsonResult = JSON.stringify(result);
    jsonResult = jsonResult.replace(/<\/script>/gi, '\\u003c/script>');
    file = file.replace(/window.SHARE_DATA = null/g, `window.SHARE_DATA = ${jsonResult}`);
    file = file.replace(/<title>[^<]*<\/title>/, `<title>${projectInfo.projectName}</title>`);
    this.ctx.set('content-type', 'application/force-download');
    this.ctx.set('content-disposition', `attachment;filename=${encodeURIComponent(`${projectInfo.projectName}.html`)}`);
    return Buffer.from(file, 'utf-8');
    // return result
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
   * 导出为OpenAPI 3.0文档
   */
  async exportAsOpenApi(params: ExportAsOpenApiDto) {
    const { projectId, selectedNodes = [] } = params;
    await this.commonControl.checkDocOperationPermissions(projectId);
    const projectInfo = await this.projectService.getProjectFullInfoById({ _id: projectId });
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

    // 过滤出非文件夹的API文档
    const apiDocs = docs.filter(doc => !doc.isFolder);

    // 构建OpenAPI 3.0规范
    const openApiSpec = {
      openapi: '3.0.0',
      info: {
        title: projectInfo.projectName,
        description: '',
        version: '1.0.0',
        contact: {
          name: '',
        }
      },
      servers: hosts.map(host => ({
        url: host.url,
        description: host.name
      })),
      paths: {},
      components: {
        schemas: {},
        securitySchemes: {}
      }
    };

    // 处理每个API文档
    apiDocs.forEach(doc => {
      const path = doc.item.url.path;
      const method = doc.item.method.toLowerCase();
      
      if (!openApiSpec.paths[path]) {
        openApiSpec.paths[path] = {};
      }

      const operation = {
        summary: doc.info.name,
        description: doc.info.description || '',
        tags: [doc.info.type || 'api'],
        parameters: [],
        requestBody: null,
        responses: {}
      };

      // 处理路径参数
      if (doc.item.paths && doc.item.paths.length > 0) {
        doc.item.paths.forEach(param => {
          if (param.key) {
            operation.parameters.push({
              name: param.key,
              in: 'path',
              required: param.required,
              description: param.description || '',
              schema: {
                type: param.type || 'string'
              }
            });
          }
        });
      }

      // 处理查询参数
      if (doc.item.queryParams && doc.item.queryParams.length > 0) {
        doc.item.queryParams.forEach(param => {
          if (param.key) {
            operation.parameters.push({
              name: param.key,
              in: 'query',
              required: param.required,
              description: param.description || '',
              schema: {
                type: param.type || 'string'
              }
            });
          }
        });
      }

      // 处理请求头
      if (doc.item.headers && doc.item.headers.length > 0) {
        doc.item.headers.forEach(header => {
          if (header.key) {
            operation.parameters.push({
              name: header.key,
              in: 'header',
              required: header.required,
              description: header.description || '',
              schema: {
                type: header.type || 'string'
              }
            });
          }
        });
      }

      // 处理请求体
      if (doc.item.requestBody && doc.item.requestBody.mode !== 'none') {
        const requestBody = {
          required: true,
          content: {}
        };

        switch (doc.item.requestBody.mode) {
          case 'json':
            if (doc.item.requestBody.rawJson) {
              try {
                const jsonSchema = this.parseJsonToSchema(doc.item.requestBody.rawJson);
                requestBody.content['application/json'] = {
                  schema: jsonSchema
                };
              } catch (error) {
                requestBody.content['application/json'] = {
                  schema: {
                    type: 'object',
                    description: 'JSON请求体'
                  }
                };
              }
            }
            break;
          case 'formdata':
            if (doc.item.requestBody.formdata && doc.item.requestBody.formdata.length > 0) {
              const formDataSchema = {
                type: 'object',
                properties: {},
                required: []
              };
              
              doc.item.requestBody.formdata.forEach(field => {
                if (field.key) {
                  formDataSchema.properties[field.key] = {
                    type: field.type || 'string',
                    description: field.description || ''
                  };
                  if (field.required) {
                    formDataSchema.required.push(field.key);
                  }
                }
              });
              
              requestBody.content['multipart/form-data'] = {
                schema: formDataSchema
              };
            }
            break;
          case 'urlencoded':
            if (doc.item.requestBody.urlencoded && doc.item.requestBody.urlencoded.length > 0) {
              const urlencodedSchema = {
                type: 'object',
                properties: {},
                required: []
              };
              
              doc.item.requestBody.urlencoded.forEach(field => {
                if (field.key) {
                  urlencodedSchema.properties[field.key] = {
                    type: field.type || 'string',
                    description: field.description || ''
                  };
                  if (field.required) {
                    urlencodedSchema.required.push(field.key);
                  }
                }
              });
              
              requestBody.content['application/x-www-form-urlencoded'] = {
                schema: urlencodedSchema
              };
            }
            break;
          case 'raw':
            if (doc.item.requestBody.raw && doc.item.requestBody.raw.data) {
              requestBody.content[doc.item.requestBody.raw.dataType || 'text/plain'] = {
                schema: {
                  type: 'string',
                  description: '原始数据'
                }
              };
            }
            break;
        }

        if (Object.keys(requestBody.content).length > 0) {
          operation.requestBody = requestBody;
        }
      }

      // 处理响应
      if (doc.item.responseParams && doc.item.responseParams.length > 0) {
        doc.item.responseParams.forEach(response => {
          const responseObj = {
            description: response.title,
            content: {}
          };

          if (response.value.dataType === 'application/json' && response.value.strJson) {
            try {
              const jsonSchema = this.parseJsonToSchema(response.value.strJson);
              responseObj.content['application/json'] = {
                schema: jsonSchema
              };
            } catch (error) {
              responseObj.content['application/json'] = {
                schema: {
                  type: 'object',
                  description: 'JSON响应'
                }
              };
            }
          } else if (response.value.text) {
            responseObj.content['text/plain'] = {
              schema: {
                type: 'string',
                description: '文本响应'
              }
            };
          }

          operation.responses[response.statusCode] = responseObj;
        });
      }

      openApiSpec.paths[path][method] = operation;
    });

    this.ctx.set('content-type', 'application/force-download');
    this.ctx.set('content-disposition', `attachment;filename=${encodeURIComponent(`${projectInfo.projectName}.openapi.json`)}`);
    return Buffer.from(JSON.stringify(openApiSpec, null, 2), 'utf-8');
  }

  /**
   * 解析JSON字符串为OpenAPI Schema
   */
  private parseJsonToSchema(jsonString: string): any {
    try {
      const jsonObj = JSON.parse(jsonString);
      return this.convertJsonToSchema(jsonObj);
    } catch (error) {
      return {
        type: 'object',
        description: 'JSON对象'
      };
    }
  }

  /**
   * 将JSON对象转换为OpenAPI Schema
   */
  private convertJsonToSchema(obj: any): any {
    if (obj === null) {
      return { type: 'null' };
    }
    
    if (Array.isArray(obj)) {
      if (obj.length === 0) {
        return { type: 'array', items: {} };
      }
      return {
        type: 'array',
        items: this.convertJsonToSchema(obj[0])
      };
    }
    
    if (typeof obj === 'object') {
      const schema = {
        type: 'object',
        properties: {},
        required: []
      };
      
      for (const [key, value] of Object.entries(obj)) {
        schema.properties[key] = this.convertJsonToSchema(value);
        if (value !== null && value !== undefined) {
          schema.required.push(key);
        }
      }
      
      return schema;
    }
    
    if (typeof obj === 'string') {
      return { type: 'string' };
    }
    
    if (typeof obj === 'number') {
      return { type: 'number' };
    }
    
    if (typeof obj === 'boolean') {
      return { type: 'boolean' };
    }
    
    return { type: 'string' };
  }

  /**
   * 导出为Markdown格式
   */
  async exportAsMarkdown(params: ExportAsMarkdownDto) {
    const { projectId, selectedNodes = [] } = params;
    await this.commonControl.checkDocOperationPermissions(projectId);
    const projectInfo = await this.projectService.getProjectFullInfoById({ _id: projectId });
    
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

    // 构建Markdown内容
    let markdownContent = `# ${projectInfo.projectName}\n\n`;
    
    // 添加项目信息
    // 注意：getProjectFullInfoById方法返回的对象不包含remark字段

    // 添加变量信息
    if (projectInfo.variables && projectInfo.variables.length > 0) {
      markdownContent += `## 全局变量\n\n`;
      projectInfo.variables.forEach(variable => {
        markdownContent += `- **${variable.name}**: ${variable.value}\n`;
      });
      markdownContent += `\n`;
    }

    // 将文档转换为树形结构
    const nestDocs = convertPlainArrayDataToTreeData(docs);
    
    // 递归生成Markdown内容
    const generateMarkdown = (docList: any[], level: number = 1): string => {
      let content = '';
      
      docList.forEach(doc => {
        const indent = '  '.repeat(level - 1);
        const headingPrefix = '#'.repeat(level + 1);
        
        if (doc.isFolder) {
          // 文件夹
          content += `${indent}${headingPrefix} ${doc.info.name}\n\n`;
          if (doc.children && doc.children.length > 0) {
            content += generateMarkdown(doc.children, level + 1);
          }
        } else {
          // API文档
          content += `${indent}${headingPrefix} ${doc.info.name}\n\n`;
          
          if (doc.info.description) {
            content += `${indent}**描述**: ${doc.info.description}\n\n`;
          }
          
          // 请求信息
          content += `${indent}### 请求信息\n\n`;
          content += `${indent}- **请求方法**: \`${doc.item.method}\`\n`;
          content += `${indent}- **请求地址**: \`${doc.item.url.host}${doc.item.url.path}\`\n`;
          
          if (doc.item.contentType) {
            content += `${indent}- **参数类型**: \`${doc.item.contentType}\`\n`;
          }
          content += `\n`;
          
          // 请求参数
          let hasParams = false;
          
          // Query参数
          if (doc.item.queryParams && doc.item.queryParams.length > 0) {
            const queryParams = doc.item.queryParams.filter(v => v.key);
            if (queryParams.length > 0) {
              hasParams = true;
              content += `${indent}#### Query参数\n\n`;
              content += `${indent}| 参数名称 | 参数值 | 是否必填 | 备注 |\n`;
              content += `${indent}|---------|--------|----------|------|\n`;
              queryParams.forEach(param => {
                content += `${indent}| ${param.key} | ${param.value || '-'} | ${param.required ? '是' : '否'} | ${param.description || '-'} |\n`;
              });
              content += `\n`;
            }
          }
          
          // Path参数
          if (doc.item.paths && doc.item.paths.length > 0) {
            const pathParams = doc.item.paths.filter(v => v.key);
            if (pathParams.length > 0) {
              hasParams = true;
              content += `${indent}#### Path参数\n\n`;
              content += `${indent}| 参数名称 | 参数值 | 是否必填 | 备注 |\n`;
              content += `${indent}|---------|--------|----------|------|\n`;
              pathParams.forEach(param => {
                content += `${indent}| ${param.key} | ${param.value || '-'} | ${param.required ? '是' : '否'} | ${param.description || '-'} |\n`;
              });
              content += `\n`;
            }
          }
          
          // 请求头
          if (doc.item.headers && doc.item.headers.length > 0) {
            const headers = doc.item.headers.filter(v => v.key);
            if (headers.length > 0) {
              hasParams = true;
              content += `${indent}#### 请求头\n\n`;
              content += `${indent}| 参数名称 | 参数值 | 是否必填 | 备注 |\n`;
              content += `${indent}|---------|--------|----------|------|\n`;
              headers.forEach(header => {
                content += `${indent}| ${header.key} | ${header.value || '-'} | ${header.required ? '是' : '否'} | ${header.description || '-'} |\n`;
              });
              content += `\n`;
            }
          }
          
          // 请求体
          if (doc.item.requestBody && doc.item.requestBody.mode !== 'none') {
            hasParams = true;
            content += `${indent}#### 请求体\n\n`;
            
            switch (doc.item.requestBody.mode) {
              case 'json':
                if (doc.item.requestBody.rawJson) {
                  content += `${indent}**JSON格式**:\n\n`;
                  content += `${indent}\`\`\`json\n${doc.item.requestBody.rawJson}\n\`\`\`\n\n`;
                }
                break;
              case 'formdata':
                if (doc.item.requestBody.formdata && doc.item.requestBody.formdata.length > 0) {
                  const formData = doc.item.requestBody.formdata.filter(v => v.key);
                  if (formData.length > 0) {
                    content += `${indent}**Form Data格式**:\n\n`;
                    content += `${indent}| 参数名称 | 参数值 | 是否必填 | 备注 |\n`;
                    content += `${indent}|---------|--------|----------|------|\n`;
                    formData.forEach(field => {
                      content += `${indent}| ${field.key} | ${field.value || '-'} | ${field.required ? '是' : '否'} | ${field.description || '-'} |\n`;
                    });
                    content += `\n`;
                  }
                }
                break;
              case 'urlencoded':
                if (doc.item.requestBody.urlencoded && doc.item.requestBody.urlencoded.length > 0) {
                  const urlencoded = doc.item.requestBody.urlencoded.filter(v => v.key);
                  if (urlencoded.length > 0) {
                    content += `${indent}**URL Encoded格式**:\n\n`;
                    content += `${indent}| 参数名称 | 参数值 | 是否必填 | 备注 |\n`;
                    content += `${indent}|---------|--------|----------|------|\n`;
                    urlencoded.forEach(field => {
                      content += `${indent}| ${field.key} | ${field.value || '-'} | ${field.required ? '是' : '否'} | ${field.description || '-'} |\n`;
                    });
                    content += `\n`;
                  }
                }
                break;
              case 'raw':
                if (doc.item.requestBody.raw && doc.item.requestBody.raw.data) {
                  content += `${indent}**原始数据**:\n\n`;
                  content += `${indent}\`\`\`\n${doc.item.requestBody.raw.data}\n\`\`\`\n\n`;
                }
                break;
            }
          }
          
          if (!hasParams) {
            content += `${indent}无请求参数\n\n`;
          }
          
          // 响应参数
          if (doc.item.responseParams && doc.item.responseParams.length > 0) {
            content += `${indent}### 响应参数\n\n`;
            doc.item.responseParams.forEach((response, index) => {
              content += `${indent}#### ${response.title}\n\n`;
              content += `${indent}- **状态码**: \`${response.statusCode}\`\n`;
              content += `${indent}- **参数类型**: \`${response.value.dataType}\`\n\n`;
              
              if (response.value.dataType === 'application/json' && response.value.strJson) {
                content += `${indent}**响应示例**:\n\n`;
                content += `${indent}\`\`\`json\n${response.value.strJson}\n\`\`\`\n\n`;
              } else if (response.value.text) {
                content += `${indent}**响应内容**:\n\n`;
                content += `${indent}\`\`\`\n${response.value.text}\n\`\`\`\n\n`;
              }
            });
          } else {
            content += `${indent}### 响应参数\n\n${indent}暂无响应参数\n\n`;
          }
          
          content += `${indent}---\n\n`;
        }
      });
      
      return content;
    };
    
    markdownContent += generateMarkdown(nestDocs);
    
    this.ctx.set('content-type', 'application/force-download');
    this.ctx.set('content-disposition', `attachment;filename=${encodeURIComponent(`${projectInfo.projectName}.md`)}`);
    return Buffer.from(markdownContent, 'utf-8');
  }

  /**
   * 导入apiflow格式文档
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
