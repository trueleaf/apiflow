import { StandaloneExportHtmlParams } from "@src/types/standalone";
import path from "path";
import fs from "fs/promises";
import fsSync from "fs";
import * as docx from "docx";
import type { Paragraph as ParagraphType, Table as TableType } from "docx";
import { dfsForest, arrayToTree } from "../../utils/index";
import { fileURLToPath } from "url";
import archiver from "archiver";
import { dialog, BrowserWindow, WebContentsView } from "electron";
import { ExportStatus } from "@src/types/types.ts";
import { createHash } from "crypto";
import dayjs from "dayjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



// 全局导出状态
let exportStatus: ExportStatus = {
  status: 'notStarted',
  progress: 0,
  itemNum: 0
};

// 存储接收到的数据
let receivedDataLength = 0;
let archive: archiver.Archiver | null = null;
let tempFilePath: string = ''; // 临时文件路径
let finalFilePath: string = ''; // 最终zip文件路径
let mainWindow: BrowserWindow | null = null;
let contentView: WebContentsView | null = null;
let batchBuffer: any[] = []; // 批量处理缓冲区
let batchCounter: number = 0; // 批次计数器
const BATCH_SIZE = 100; // 每批处理的数据数量

/**
 * 高效的二进制数据序列化
 * 使用压缩的JSON格式，移除不必要的空格和格式化
 */
const serializeData = (data: any): Buffer => {
  try {
    // 使用压缩的JSON格式（去除空格）
    const jsonString = JSON.stringify(data);
    
    // 创建数据头信息，包含校验和和长度
    const dataBuffer = Buffer.from(jsonString, 'utf8');
    const checksum = createHash('md5').update(dataBuffer).digest('hex');
    
    // 创建元数据
    const metadata = {
      version: '1.0',
      timestamp: Date.now(),
      checksum: checksum,
      originalSize: dataBuffer.length,
      compression: 'none' // 可以后续扩展为gzip压缩
    };
    
    const metadataBuffer = Buffer.from(JSON.stringify(metadata), 'utf8');
    const metadataLength = Buffer.alloc(4);
    metadataLength.writeUInt32BE(metadataBuffer.length, 0);
    
    // 组合：[metadata长度(4字节)] + [metadata] + [数据]
    return Buffer.concat([metadataLength, metadataBuffer, dataBuffer]);
  } catch (error) {
    console.error('数据序列化失败:', error);
    // 降级到基础JSON格式
    return Buffer.from(JSON.stringify(data), 'utf8');
  }
};

/**
 * 批量处理数据以提高性能
 */
const processBatch = (): void => {
  if (batchBuffer.length === 0 || !archive) return;
  try {
    // 将批次数据合并
    const batchData = {
      batchId: ++batchCounter,
      timestamp: Date.now(),
      items: batchBuffer.splice(0, BATCH_SIZE) // 取出并清空缓冲区
    };
    // 序列化批次数据
    const serializedData = serializeData(batchData);
    const fileName = `batch-${String(batchCounter).padStart(6, '0')}.dat`;
    
    // 添加到压缩包
    archive.append(serializedData, { name: fileName });
  } catch (error) {
    console.error('批量处理失败:', error);
  }
};

export const exportHtml = async (
  exportHtmlParams: StandaloneExportHtmlParams
) => {
  try {
    const htmlPath = path.join(__dirname, "../public/share.html");
    let strParams = JSON.stringify(exportHtmlParams);
    strParams = strParams.replace(/<\/script>/gi, "\\u003c/script>");
    let htmlContent = await fs.readFile(htmlPath, "utf-8");
    htmlContent = htmlContent.replace(
      /<title>[^<]*<\/title>/,
      `<title>${exportHtmlParams.projectInfo.projectName}</title>`
    );
    return htmlContent.replace(
      /window.SHARE_DATA = null/g,
      `window.SHARE_DATA = ${strParams}`
    );
  } catch (error) {
    console.error("Export HTML failed:", error);
    throw error;
  }
};
export const exportWord = async (
  exportHtmlParams: StandaloneExportHtmlParams
) => {
  try {
    const { projectInfo, nodes } = exportHtmlParams;
    const {
      Document,
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
      AlignmentType,
    } = docx;
    const document: {
      sections: {
        children: (ParagraphType | TableType)[];
      }[];
    } = {
      sections: [
        {
          children: [
            new Paragraph({
              text: `${projectInfo.projectName}`,
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER,
            }),
          ],
        },
      ],
    };
    const nestDocs = arrayToTree(nodes) as any;
    dfsForest(nestDocs, (data: any, level: number) => {
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
      if (data.info.type === 'folder') {
        //文件夹
        const title = new Paragraph({
          text: `${data.info.name}`,
          heading: headingLevel,
          spacing: {
            before: 400,
          },
        });
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
        });
        const requestMethod = (data.item as any).method;
        const methodText = new TextRun({
          text: `${requestMethod}`,
          color:
            requestMethod === "GET"
              ? "28a745"
              : requestMethod === "POST"
                ? "ffc107"
                : requestMethod === "PUT"
                  ? "#ff4400"
                  : requestMethod === "DELETE"
                    ? "f56c6c"
                    : "444444",
        });
        const method = new Paragraph({
          //请求方法
          children: [new TextRun({ text: "请求方法：" }), methodText],
        });
        const url = new Paragraph({
          //请求方法
          text: `请求地址：${(data.item as any).url.prefix + (data.item as any).url.path}`,
        });
        const contentType = new Paragraph({
          //contentType
          text: `参数类型：${(data.item as any).contentType}`,
        });
        //=====================================queryParams====================================//
        const queryParamsOfDoc = (data.item as any).queryParams
          .filter((v: any) => v.key)
          .map((v: any) => {
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
                  children: [new Paragraph(v.required ? "必填" : "非必填")],
                  verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                  children: [new Paragraph(v.description)],
                  verticalAlign: VerticalAlign.CENTER,
                }),
              ],
            });
          });

        //=====================================pathParams====================================//
        const pathParamsOfDoc = (data.item as any).queryParams
          .filter((v: any) => v.key)
          .map((v: any) => {
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
                  children: [new Paragraph(v.required ? "必填" : "非必填")],
                  verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                  children: [new Paragraph(v.description)],
                  verticalAlign: VerticalAlign.CENTER,
                }),
              ],
            });
          });
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
                  children: [new Paragraph("参数名称")],
                  verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                  children: [new Paragraph("参数值")],
                  verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                  children: [new Paragraph("是否必填")],
                  verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                  children: [new Paragraph("备注")],
                  verticalAlign: VerticalAlign.CENTER,
                }),
              ],
            }),
            ...pathParamsOfDoc,
          ],
        });
        //=====================================json类型bodyParams====================================//
        const jsonParamsOfDoc: ParagraphType[] = [];
        jsonParamsOfDoc.push(
          new Paragraph({
            shading: {
              type: ShadingType.SOLID,
              color: "f3f3f3",
            },
            children: [
              new TextRun({
                text: (data.item as any).requestBody.rawJson,
              }),
            ],
          })
        );
        //=====================================formData类型bodyParams====================================//
        const formDataParamsOfDoc = (data.item as any).requestBody.formdata
          .filter((v: any) => v.key)
          .map((v: any) => {
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
                  children: [new Paragraph(v.required ? "必填" : "非必填")],
                  verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                  children: [new Paragraph(v.description)],
                  verticalAlign: VerticalAlign.CENTER,
                }),
              ],
            });
          });
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
                  children: [new Paragraph("参数名称")],
                  verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                  children: [new Paragraph("参数值")],
                  verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                  children: [new Paragraph("是否必填")],
                  verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                  children: [new Paragraph("备注")],
                  verticalAlign: VerticalAlign.CENTER,
                }),
              ],
            }),
            ...formDataParamsOfDoc,
          ],
        });
        //=====================================urlencoded类型bodyParams====================================//
        const urlencodedParamsOfDoc = (data.item as any).requestBody.urlencoded
          .filter((v: any) => v.key)
          .map((v: any) => {
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
                  children: [new Paragraph(v.required ? "必填" : "非必填")],
                  verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                  children: [new Paragraph(v.description)],
                  verticalAlign: VerticalAlign.CENTER,
                }),
              ],
            });
          });
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
                  children: [new Paragraph("参数名称")],
                  verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                  children: [new Paragraph("参数值")],
                  verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                  children: [new Paragraph("是否必填")],
                  verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                  children: [new Paragraph("备注")],
                  verticalAlign: VerticalAlign.CENTER,
                }),
              ],
            }),
            ...urlencodedParamsOfDoc,
          ],
        });
        //=====================================请求头====================================//
        const headerParamsOfDoc = (data.item as any).headers
          .filter((v: any) => v.key)
          .map((v: any) => {
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
                  children: [new Paragraph(v.required ? "必填" : "非必填")],
                  verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                  children: [new Paragraph(v.description)],
                  verticalAlign: VerticalAlign.CENTER,
                }),
              ],
            });
          });
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
                  children: [new Paragraph("参数名称")],
                  verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                  children: [new Paragraph("参数值")],
                  verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                  children: [new Paragraph("是否必填")],
                  verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                  children: [new Paragraph("备注")],
                  verticalAlign: VerticalAlign.CENTER,
                }),
              ],
            }),
            ...headerParamsOfDoc,
          ],
        });

        //=========================================================================//
        document.sections[0].children.push(docName);
        document.sections[0].children.push(method);
        document.sections[0].children.push(url);
        if (contentType) {
          document.sections[0].children.push(contentType);
        }
        document.sections[0].children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "请求参数",
                bold: true,
              }),
            ],
            spacing: {
              before: 250,
            },
          })
        );
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
                  children: [new Paragraph("参数名称")],
                  verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                  children: [new Paragraph("参数值")],
                  verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                  children: [new Paragraph("是否必填")],
                  verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                  children: [new Paragraph("备注")],
                  verticalAlign: VerticalAlign.CENTER,
                }),
              ],
            }),
            ...queryParamsOfDoc,
          ],
        });
        if (queryParamsOfDoc.length > 0) {
          document.sections[0].children.push(
            new Paragraph({
              text: "Query参数",
              spacing: { before: 150, after: 30 },
              tabStops: [
                {
                  type: TabStopType.CENTER,
                  position: 2268,
                },
              ],
            })
          );
          document.sections[0].children.push(tableOfQueryParams);
        }
        if (pathParamsOfDoc.length > 0) {
          document.sections[0].children.push(
            new Paragraph({
              text: "Path参数",
              spacing: { before: 150, after: 30 },
            })
          );
          document.sections[0].children.push(tableOfPathParams);
        }
        if ((data.item as any).contentType === "application/json") {
          document.sections[0].children.push(
            new Paragraph({
              text: "Body参数(JSON)",
              spacing: { before: 150, after: 30 },
            })
          );
          document.sections[0].children.push(...jsonParamsOfDoc);
        } else if ((data.item as any).contentType === "multipart/form-data") {
          document.sections[0].children.push(
            new Paragraph({
              text: "Body参数(multipart/*)",
              spacing: { before: 150, after: 30 },
            })
          );
          document.sections[0].children.push(tableOfFormDataParams);
        } else if (
          (data.item as any).contentType === "application/x-www-form-urlencoded"
        ) {
          document.sections[0].children.push(
            new Paragraph({
              text: "Body参数(x-www-form-urlencoded)",
              spacing: { before: 150, after: 30 },
            })
          );
          document.sections[0].children.push(tableOfUrlencoedParams);
        } else if ((data.item as any).contentType) {
          document.sections[0].children.push(
            new Paragraph({
              text: `Body参数(${(data.item as any).contentType})`,
              spacing: { before: 150, after: 30 },
            })
          );
          document.sections[0].children.push(
            new Paragraph({ text: (data.item as any).requestBody.raw.data })
          );
        }
        if (headerParamsOfDoc.length > 0) {
          document.sections[0].children.push(
            new Paragraph({
              text: "请求头",
              spacing: { before: 150, after: 30 },
            })
          );
          document.sections[0].children.push(tableOfHeaderParams);
        }
        //=====================================返回参数====================================//
        document.sections[0].children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "返回参数",
                bold: true,
              }),
            ],
            spacing: {
              before: 250,
            },
          })
        );
        (data.item as any).responseParams.forEach((res: any) => {
          document.sections[0].children.push(
            new Paragraph({
              text: `名称：${res.title}`,
              spacing: {
                before: 200,
              },
            })
          );
          document.sections[0].children.push(
            new Paragraph({
              text: `状态码：${res.statusCode}`,
            })
          );
          document.sections[0].children.push(
            new Paragraph({
              text: `参数类型：${res.value.dataType}`,
            })
          );
          if (res.value.dataType === "application/json") {
            const jsonDoc = [];
            jsonDoc.push(
              new Paragraph({
                shading: {
                  type: ShadingType.SOLID,
                  color: "f3f3f3",
                },
                children: [
                  new TextRun({
                    text: res.value.strJson,
                  }),
                ],
              })
            );
            document.sections[0].children.push(...jsonDoc);
          } else {
            document.sections[0].children.push(
              new Paragraph({ text: res.value.text })
            );
          }
        });
      }
    });
    const doc = new Document(document);
    const buffer = await Packer.toBuffer(doc);
    return buffer;
  } catch (error) {
    console.error("Export Word failed:", error);
    throw error;
  }
};

// 设置窗口引用
export const setMainWindow = (window: BrowserWindow) => {
  mainWindow = window;
};

export const setContentView = (view: WebContentsView) => {
  contentView = view;
};

// 获取导出状态
export const getExportStatus = (): ExportStatus => {
  return { ...exportStatus };
};

// 第一步：选择保存路径
export const selectExportPath = async (): Promise<{ success: boolean; filePath?: string; tempPath?: string; error?: string }> => {
  try {
    if (!mainWindow) {
      throw new Error('主窗口未设置');
    }
    const result = await dialog.showSaveDialog(mainWindow, {
      title: '选择导出路径',
      defaultPath: `apiflow-export-${dayjs(new Date()).format('YYYY-MM-DD-HH-mm')}.zip`,
      filters: [
        { name: 'ZIP 文件', extensions: ['zip'] }
      ]
    });
    if (result.canceled || !result.filePath) {
      return { success: false, error: '用户取消选择' };
    }
    finalFilePath = result.filePath;
    const pathWithoutExt = finalFilePath.replace(/\.zip$/, '');
    tempFilePath = `${pathWithoutExt}.tmp`;
    exportStatus.status = 'pathSelected';
    
    return { 
      success: true, 
      filePath: finalFilePath,
      tempPath: tempFilePath
    };
    
  } catch (error) {
    console.error('选择保存路径失败:', error);
    return { success: false, error: (error as Error).message };
  }
};

// 第二步：开始导出流程
export const startExport = async (itemNum: number): Promise<void> => {
  try {
    // 检查是否已选择路径
    if (!tempFilePath) {
      throw new Error('请先选择保存路径');
    }
    
    // 更新状态为导出中
    exportStatus.status = 'inProgress';
    exportStatus.progress = 0;
    exportStatus.itemNum = itemNum;
    receivedDataLength = 0;
    // 创建 archiver 实例，写入临时文件
    archive = archiver('zip', {
      zlib: { level: 9 } // 最高压缩级别
    });
    
    // 监听 archiver 事件
    archive.on('error', (err) => {
      console.error('Archive error:', err);
      exportStatus.status = 'error';
      if (contentView) {
        contentView.webContents.send('export-main-error', err.message);
      }
    });
    
    archive.on('end', () => {
      console.log('Archive finalized');
    });
    
    // 创建输出流到临时文件
    const output = fsSync.createWriteStream(tempFilePath);
    archive.pipe(output);
    
    // 通知渲染进程准备发送数据
    if (contentView) {
      contentView.webContents.send('export-ready-to-receive');
    }
    
  } catch (error) {
    console.error('开始导出失败:', error);
    exportStatus.status = 'error';
    if (contentView) {
      contentView.webContents.send('export-main-error', (error as Error).message);
    }
  }
};

// 第三步：接受数据并压缩
export const receiveRendererData = (data: any): void => {
  try {
    if (exportStatus.status !== 'inProgress') {
      return;
    }
    
    // 将数据添加到批次缓冲区
    batchBuffer.push({
      ...data,
      receivedAt: Date.now(),
      index: receivedDataLength
    });
    
    receivedDataLength ++;
    exportStatus.progress = Math.round((receivedDataLength / exportStatus.itemNum) * 100);
    
    // 当缓冲区达到批次大小时，处理批次
    if (batchBuffer.length >= BATCH_SIZE) {
      processBatch();
    }
    
  } catch (error) {
    console.error('接收渲染进程数据失败:', error);
    exportStatus.status = 'error';
    if (contentView) {
      contentView.webContents.send('export-main-error', (error as Error).message);
    }
  }
};

// 渲染进程数据发送完毕
export const finishRendererData = async (): Promise<void> => {
  try {
    if (exportStatus.status !== 'inProgress') {
      return;
    }
    
    // 处理剩余的批次数据
    if (batchBuffer.length > 0) {
      processBatch();
    }
    
    // 添加导出元数据文件
    if (archive) {
      const exportMetadata = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        totalItems: receivedDataLength,
        totalBatches: batchCounter,
        batchSize: BATCH_SIZE,
        format: 'binary-batched',
        description: 'APIFlow数据导出文件，使用二进制批处理格式以提高性能'
      };
      
      const metadataBuffer = serializeData(exportMetadata);
      archive.append(metadataBuffer, { name: 'export-metadata.dat' });
    }
    
    // 检查是否所有数据都已处理
    if (receivedDataLength >= exportStatus.itemNum) {
      // 完成压缩
      if (archive) {
        await archive.finalize();
        
        // 等待文件写入完成
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('文件写入超时'));
          }, 30000);
          
          const checkFileExists = () => {
            if (fsSync.existsSync(tempFilePath)) {
              clearTimeout(timeout);
              resolve(void 0);
            } else {
              setTimeout(checkFileExists, 100);
            }
          };
          checkFileExists();
        });
        
        // 将临时文件重命名为最终的zip文件
        try {
          if (fsSync.existsSync(finalFilePath)) {
            // 如果目标文件已存在，先删除
            await fs.unlink(finalFilePath);
          }
          await fs.rename(tempFilePath, finalFilePath);
          console.log(`文件已重命名: ${tempFilePath} -> ${finalFilePath}`);
          console.log(`导出完成，共处理 ${batchCounter} 个批次，${receivedDataLength} 项数据`);
        } catch (renameError) {
          console.error('重命名文件失败:', renameError);
          throw new Error(`文件重命名失败: ${(renameError as Error).message}`);
        }
        
        exportStatus.status = 'completed';
        exportStatus.progress = 100;
        
        // 通知渲染进程导出完成
        if (contentView) {
          contentView.webContents.send('export-finish', {
            filePath: finalFilePath,
            totalItems: receivedDataLength,
            batches: batchCounter,
            format: 'binary-optimized'
          });
        }
        
        // 重置变量
        archive = null;
      }
    }

  } catch (error) {
    console.error('完成导出失败:', error);
    exportStatus.status = 'error';
    
    // 清理临时文件
    try {
      if (tempFilePath && fsSync.existsSync(tempFilePath)) {
        await fs.unlink(tempFilePath);
      }
    } catch (cleanupError) {
      console.warn('清理临时文件失败:', cleanupError);
    }
    
    if (contentView) {
      contentView.webContents.send('export-main-error', (error as Error).message);
    }
  }
};

// 重置导出状态和清理内存
export const resetExport = (): void => {
  try {
    // 如果有正在进行的压缩，先销毁它
    if (archive) {
      try {
        archive.destroy();
      } catch (error) {
        console.warn('销毁archive时出错:', error);
      }
      archive = null;
    }
    
    // 重置状态
    exportStatus = {
      status: 'notStarted',
      progress: 0,
      itemNum: 0
    };
    
    // 清理数据数组，释放内存
    receivedDataLength = 0;
    batchBuffer.length = 0;
    batchBuffer = [];
    batchCounter = 0;
    
    // 清理文件路径
    tempFilePath = '';
    finalFilePath = '';
    
    
    // 通知渲染进程重置完成
    if (contentView) {
      contentView.webContents.send('export-reset-complete');
    }
    
  } catch (error) {
    console.error('重置导出状态失败:', error);
  }
};
