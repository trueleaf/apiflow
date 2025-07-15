import { StandaloneExportHtmlParams } from "@src/types/standalone";
import path from "path";
import fs from "fs/promises";
import * as docx from 'docx';
import type { Paragraph as ParagraphType, Table as TableType } from 'docx';
import { dfsForest, arrayToTree } from "../../utils/index";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const exportHtml = async (exportHtmlParams: StandaloneExportHtmlParams) => {
  try {
    const htmlPath = path.join(__dirname, '../public/share.html');
    let strParams = JSON.stringify(exportHtmlParams);
    strParams = strParams.replace(/<\/script>/gi, '\\u003c/script>')
    let htmlContent = await fs.readFile(htmlPath, 'utf-8');
    htmlContent = htmlContent.replace(/<title>[^<]*<\/title>/, `<title>${exportHtmlParams.projectInfo.projectName}</title>`)
    return htmlContent.replace(/window.SHARE_DATA = null/g, `window.SHARE_DATA = ${strParams}`);
  } catch (error) {
    console.error('Export HTML failed:', error);
    throw error;
  }
}
export const exportWord = async (exportHtmlParams: StandaloneExportHtmlParams) => {
  try {
    const { projectInfo, nodes } = exportHtmlParams;
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
    const nestDocs = arrayToTree(nodes) as any;
    dfsForest(nestDocs, (data, level) => {
      let headingLevel: any = HeadingLevel.HEADING_1;
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
    const buffer = await Packer.toBuffer(doc);
    return buffer;
  } catch (error) {
    console.error('Export Word failed:', error);
    throw error;
  }

}