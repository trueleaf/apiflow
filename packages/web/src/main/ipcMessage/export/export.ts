import { StandaloneExportHtmlParams } from "@src/types/standalone";
import path from "path";
import fs from "fs/promises";
import * as docx from "docx";
import type { Paragraph as ParagraphType, Table as TableType } from "docx";
import { dfsForest, arrayToTree } from "../../utils/index";
import { fileURLToPath } from "url";
import JSZip from "jszip";
import { dialog, BrowserWindow, WebContentsView, app } from "electron";
import { ExportStatus } from "@src/types/index.ts";
import { CommonResponse } from "@src/types/project";
import { createHash } from "crypto";
import dayjs from "dayjs";
import type { HttpNode, FolderNode } from "@src/types/httpNode/httpNode";
import type { WebSocketNode } from "@src/types/websocketNode";
import type { HttpMockNode, WebSocketMockNode } from "@src/types/mockNode";
import type { ApidocProperty } from "@src/types/httpNode/types";

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
let zip: JSZip | null = null;
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
  if (batchBuffer.length === 0 || !zip) return;
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
    if (zip) {
      zip.file(fileName, serializedData);
    }
  } catch (error) {
    console.error('批量处理失败:', error);
  }
};

export const exportHtml = async (
  exportHtmlParams: StandaloneExportHtmlParams
) => {
  try {
    const htmlPath = app.isPackaged
      ? path.join(process.resourcesPath, 'public/share.html')
      : path.join(__dirname, '../../public/share.html');
    console.log(htmlPath, "htmlPath");
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
    const components: DocxComponents = {
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
    };
    const nestDocs = arrayToTree(nodes);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dfsForest(nestDocs as any, (item: any, level: number) => {
      const data = item as HttpNode | WebSocketNode | HttpMockNode | WebSocketMockNode | FolderNode;
      let content: (ParagraphType | TableType)[] = [];
      switch (data.info.type) {
        case 'folder':
          content = generateFolderNodeContent(data as FolderNode, level, components);
          break;
        case 'http':
          content = generateHttpNodeContent(data as HttpNode, components);
          break;
        case 'websocket':
          content = generateWebSocketNodeContent(data as WebSocketNode, components);
          break;
        case 'httpMock':
          content = generateHttpMockNodeContent(data as HttpMockNode, components);
          break;
        case 'websocketMock':
          content = generateWebSocketMockNodeContent(data as WebSocketMockNode, components);
          break;
        default:
          break;
      }
      document.sections[0].children.push(...content);
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
export const selectExportPath = async (): Promise<CommonResponse<{ filePath?: string; tempPath?: string }>> => {
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
      return { code: 1, msg: '用户取消选择', data: {} };
    }
    finalFilePath = result.filePath;
    // JSZip 不需要临时文件，但保留变量以兼容现有逻辑
    const pathWithoutExt = finalFilePath.replace(/\.zip$/, '');
    tempFilePath = `${pathWithoutExt}.tmp`;
    exportStatus.status = 'pathSelected';

    return {
      code: 0,
      msg: '选择路径成功',
      data: {
        filePath: finalFilePath,
        tempPath: tempFilePath
      }
    };
    
  } catch (error) {
    console.error('选择保存路径失败:', error);
    return { code: 1, msg: (error as Error).message, data: {} };
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
    // 创建 JSZip 实例
    zip = new JSZip();
    
    // 通知渲染进程准备发送数据
    contentView?.webContents.send('export-ready-to-receive');
    
  } catch (error) {
    console.error('开始导出失败:', error);
    exportStatus.status = 'error';
    contentView?.webContents.send('export-main-error', (error as Error).message);
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
    contentView?.webContents.send('export-main-error', (error as Error).message);
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
    if (zip) {
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
      zip.file('export-metadata.dat', metadataBuffer);
    }
    
    // 检查是否所有数据都已处理
    if (receivedDataLength >= exportStatus.itemNum) {
      // 完成压缩
      if (zip) {
        try {
          // 生成 ZIP 文件的 Buffer
          const zipBuffer = await zip.generateAsync({
            type: 'nodebuffer',
            compression: 'DEFLATE',
            compressionOptions: {
              level: 9 // 最高压缩级别
            }
          });
          
          // 写入文件
          await fs.writeFile(finalFilePath, zipBuffer);
        } catch (zipError) {
          console.error('生成ZIP文件失败:', zipError);
          throw new Error(`ZIP文件生成失败: ${(zipError as Error).message}`);
        }
        
        exportStatus.status = 'completed';
        exportStatus.progress = 100;
        
        // 通知渲染进程导出完成
        contentView?.webContents.send('export-finish', {
          filePath: finalFilePath,
          totalItems: receivedDataLength,
          batches: batchCounter,
          format: 'binary-optimized'
        });
        
        // 重置变量
        zip = null;
      }
    }

  } catch (error) {
    console.error('完成导出失败:', error);
    exportStatus.status = 'error';
    
    // 清理临时文件(使用JSZip不需要临时文件)
    // JSZip 在内存中生成，不需要清理临时文件
    
    contentView?.webContents.send('export-main-error', (error as Error).message);
  }
};

// 重置导出状态和清理内存
export const resetExport = (): void => {
  try {
    // 如果有正在进行的压缩，先销毁它
    if (zip) {
      // JSZip 不需要显式销毁，直接置空即可
      zip = null;
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
    contentView?.webContents.send('export-reset-complete');
    
  } catch (error) {
    console.error('重置导出状态失败:', error);
  }
};

// ============================================================================
// Word 导出辅助函数
// ============================================================================

type DocxComponents = {
  Document: typeof docx.Document;
  TextRun: typeof docx.TextRun;
  ShadingType: typeof docx.ShadingType;
  TabStopType: typeof docx.TabStopType;
  Packer: typeof docx.Packer;
  Table: typeof docx.Table;
  Paragraph: typeof docx.Paragraph;
  TableRow: typeof docx.TableRow;
  TableCell: typeof docx.TableCell;
  VerticalAlign: typeof docx.VerticalAlign;
  WidthType: typeof docx.WidthType;
  HeadingLevel: typeof docx.HeadingLevel;
  AlignmentType: typeof docx.AlignmentType;
};

//创建参数表格（通用函数）
const createParamsTable = (params: ApidocProperty[], components: DocxComponents): TableType => {
  const { Table, TableRow, TableCell, Paragraph, VerticalAlign, WidthType } = components;
  const paramsRows = params
    .filter((v) => v.key)
    .map((v) => {
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

  return new Table({
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
      ...paramsRows,
    ],
  });
};

//创建代码块段落
//尝试格式化JSON字符串
const formatJsonIfPossible = (str: string): string => {
  if (!str || typeof str !== 'string') {
    return str;
  }
  const trimmed = str.trim();
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      const parsed = JSON.parse(trimmed);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return str;
    }
  }
  return str;
};

const createCodeBlock = (code: string, components: DocxComponents): ParagraphType => {
  const { Paragraph, TextRun, ShadingType } = components;
  const formattedCode = formatJsonIfPossible(code);
  return new Paragraph({
    shading: {
      type: ShadingType.SOLID,
      color: "f3f3f3",
    },
    children: [
      new TextRun({
        text: formattedCode,
        font: "Consolas",
      }),
    ],
  });
};

//生成 Folder 节点内容
const generateFolderNodeContent = (
  data: FolderNode,
  level: number,
  components: DocxComponents
): (ParagraphType | TableType)[] => {
  const { Paragraph, HeadingLevel } = components;
  const result: (ParagraphType | TableType)[] = [];
  let headingLevel: typeof HeadingLevel.HEADING_1 | typeof HeadingLevel.HEADING_2 = HeadingLevel.HEADING_1;
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
  const title = new Paragraph({
    text: `${data.info.name}`,
    heading: headingLevel,
    spacing: {
      before: 400,
    },
  });
  result.push(title);
  if (data.commonHeaders && Array.isArray(data.commonHeaders) && data.commonHeaders.length > 0) {
    result.push(
      new Paragraph({
        text: "公共请求头",
        spacing: { before: 150, after: 30 },
      })
    );
    result.push(createParamsTable(data.commonHeaders, components));
  }
  return result;
};

//生成 HTTP 节点内容
const generateHttpNodeContent = (
  data: HttpNode,
  components: DocxComponents
): (ParagraphType | TableType)[] => {
  const { Paragraph, TextRun, HeadingLevel, TabStopType } = components;
  const result: (ParagraphType | TableType)[] = [];
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
  const requestMethod = data.item.method;
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
    children: [new TextRun({ text: "请求方法：" }), methodText],
  });
  const url = new Paragraph({
    text: `请求地址：${data.item.url.prefix + data.item.url.path}`,
  });
  const contentType = new Paragraph({
    text: `参数类型：${data.item.contentType}`,
  });
  result.push(docName);
  result.push(method);
  result.push(url);
  if (contentType) {
    result.push(contentType);
  }
  result.push(
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
  const queryParamsOfDoc = data.item.queryParams.filter((v) => v.key);
  if (queryParamsOfDoc.length > 0) {
    result.push(
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
    result.push(createParamsTable(queryParamsOfDoc, components));
  }
  const pathParamsOfDoc = data.item.paths.filter((v) => v.key);
  if (pathParamsOfDoc.length > 0) {
    result.push(
      new Paragraph({
        text: "Path参数",
        spacing: { before: 150, after: 30 },
      })
    );
    result.push(createParamsTable(pathParamsOfDoc, components));
  }
  if (data.item.contentType === "application/json") {
    result.push(
      new Paragraph({
        text: "Body参数(JSON)",
        spacing: { before: 150, after: 30 },
      })
    );
    result.push(createCodeBlock(data.item.requestBody.rawJson, components));
  } else if (data.item.contentType === "multipart/form-data") {
    const formDataParams = data.item.requestBody.formdata.filter((v) => v.key);
    if (formDataParams.length > 0) {
      result.push(
        new Paragraph({
          text: "Body参数(multipart/*)",
          spacing: { before: 150, after: 30 },
        })
      );
      result.push(createParamsTable(formDataParams, components));
    }
  } else if (data.item.contentType === "application/x-www-form-urlencoded") {
    const urlencodedParams = data.item.requestBody.urlencoded.filter((v) => v.key);
    if (urlencodedParams.length > 0) {
      result.push(
        new Paragraph({
          text: "Body参数(x-www-form-urlencoded)",
          spacing: { before: 150, after: 30 },
        })
      );
      result.push(createParamsTable(urlencodedParams, components));
    }
  } else if (data.item.contentType) {
    result.push(
      new Paragraph({
        text: `Body参数(${data.item.contentType})`,
        spacing: { before: 150, after: 30 },
      })
    );
    result.push(new Paragraph({ text: data.item.requestBody.raw.data }));
  }
  const headerParams = data.item.headers.filter((v) => v.key);
  if (headerParams.length > 0) {
    result.push(
      new Paragraph({
        text: "请求头",
        spacing: { before: 150, after: 30 },
      })
    );
    result.push(createParamsTable(headerParams, components));
  }
  result.push(
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
  data.item.responseParams.forEach((res) => {
    result.push(
      new Paragraph({
        text: `名称：${res.title}`,
        spacing: {
          before: 200,
        },
      })
    );
    result.push(
      new Paragraph({
        text: `状态码：${res.statusCode}`,
      })
    );
    result.push(
      new Paragraph({
        text: `参数类型：${res.value.dataType}`,
      })
    );
    if (res.value.dataType === "application/json") {
      result.push(createCodeBlock(res.value.strJson, components));
    } else {
      result.push(new Paragraph({ text: res.value.text }));
    }
  });
  return result;
};

//生成 WebSocket 节点内容
const generateWebSocketNodeContent = (
  data: WebSocketNode,
  components: DocxComponents
): (ParagraphType | TableType)[] => {
  const { Paragraph, TextRun, HeadingLevel } = components;
  const result: (ParagraphType | TableType)[] = [];
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
  const protocol = new Paragraph({
    children: [
      new TextRun({ text: "协议类型：" }),
      new TextRun({
        text: data.item.protocol.toUpperCase(),
        color: "0070c0",
      }),
    ],
  });
  const url = new Paragraph({
    text: `连接地址：${data.item.url.prefix + data.item.url.path}`,
  });
  result.push(docName);
  result.push(
    new Paragraph({
      text: "节点类型：WebSocket",
      spacing: {
        after: 200,
      },
    })
  );
  result.push(protocol);
  result.push(url);
  result.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "连接参数",
          bold: true,
        }),
      ],
      spacing: {
        before: 250,
      },
    })
  );
  const queryParams = data.item.queryParams.filter((v) => v.key);
  if (queryParams.length > 0) {
    result.push(
      new Paragraph({
        text: "请求参数",
        spacing: { before: 150, after: 30 },
      })
    );
    result.push(createParamsTable(queryParams, components));
  }
  const headerParams = data.item.headers.filter((v) => v.key);
  if (headerParams.length > 0) {
    result.push(
      new Paragraph({
        text: "请求头",
        spacing: { before: 150, after: 30 },
      })
    );
    result.push(createParamsTable(headerParams, components));
  }
  result.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "连接配置",
          bold: true,
        }),
      ],
      spacing: {
        before: 250,
      },
    })
  );
  result.push(
    new Paragraph({
      text: `自动发送：${data.config.autoSend ? "是" : "否"}`,
    })
  );
  if (data.config.autoSend) {
    result.push(
      new Paragraph({
        text: `发送间隔：${data.config.autoSendInterval}ms`,
      })
    );
    result.push(
      new Paragraph({
        text: `消息类型：${data.config.autoSendMessageType}`,
      })
    );
  }
  result.push(
    new Paragraph({
      text: `自动重连：${data.config.autoReconnect ? "是" : "否"}`,
    })
  );
  return result;
};

//生成 HttpMock 节点内容
const generateHttpMockNodeContent = (
  data: HttpMockNode,
  components: DocxComponents
): (ParagraphType | TableType)[] => {
  const { Paragraph, TextRun, HeadingLevel } = components;
  const result: (ParagraphType | TableType)[] = [];
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
  result.push(docName);
  result.push(
    new Paragraph({
      text: "节点类型：HTTP Mock",
      spacing: {
        after: 200,
      },
    })
  );
  result.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "匹配条件",
          bold: true,
        }),
      ],
      spacing: {
        before: 250,
      },
    })
  );
  result.push(
    new Paragraph({
      text: `请求方法：${data.requestCondition.method.join(", ")}`,
    })
  );
  result.push(
    new Paragraph({
      text: `匹配路径：${data.requestCondition.url}`,
    })
  );
  result.push(
    new Paragraph({
      text: `监听端口：${data.requestCondition.port}`,
    })
  );
  result.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Mock 配置",
          bold: true,
        }),
      ],
      spacing: {
        before: 250,
      },
    })
  );
  result.push(
    new Paragraph({
      text: `延迟时间：${data.config.delay}ms`,
    })
  );
  result.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "响应配置",
          bold: true,
        }),
      ],
      spacing: {
        before: 250,
      },
    })
  );
  data.response.forEach((res, index) => {
    result.push(
      new Paragraph({
        text: `响应 ${index + 1}：${res.name}${res.isDefault ? " (默认)" : ""}`,
        spacing: {
          before: 200,
        },
      })
    );
    if (res.conditions.scriptCode) {
      result.push(
        new Paragraph({
          text: "条件脚本：",
          spacing: {
            before: 100,
          },
        })
      );
      result.push(createCodeBlock(res.conditions.scriptCode, components));
    }
    result.push(
      new Paragraph({
        text: `状态码：${res.statusCode}`,
      })
    );
    const enabledHeaders = [
      ...res.headers.defaultHeaders.filter(h => res.headers.enabled && h.key),
      ...res.headers.customHeaders.filter(h => h.key)
    ];
    if (enabledHeaders.length > 0) {
      result.push(
        new Paragraph({
          text: "响应头：",
        })
      );
      result.push(createParamsTable(enabledHeaders, components));
    }
    result.push(
      new Paragraph({
        text: `数据类型：${res.dataType}`,
      })
    );
    if (res.dataType === "json" && res.jsonConfig.mode === "fixed") {
      result.push(
        new Paragraph({
          text: "响应数据：",
        })
      );
      result.push(createCodeBlock(res.jsonConfig.fixedData, components));
    } else if (res.dataType === "text" && res.textConfig.mode === "fixed") {
      result.push(
        new Paragraph({
          text: "响应数据：",
        })
      );
      result.push(createCodeBlock(res.textConfig.fixedData, components));
    }
  });
  return result;
};

//生成 WebSocketMock 节点内容
const generateWebSocketMockNodeContent = (
  data: WebSocketMockNode,
  components: DocxComponents
): (ParagraphType | TableType)[] => {
  const { Paragraph, TextRun, HeadingLevel } = components;
  const result: (ParagraphType | TableType)[] = [];
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
  result.push(docName);
  result.push(
    new Paragraph({
      text: "节点类型：WebSocket Mock",
      spacing: {
        after: 200,
      },
    })
  );
  result.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "匹配条件",
          bold: true,
        }),
      ],
      spacing: {
        before: 250,
      },
    })
  );
  result.push(
    new Paragraph({
      text: `匹配路径：${data.requestCondition.path}`,
    })
  );
  result.push(
    new Paragraph({
      text: `监听端口：${data.requestCondition.port}`,
    })
  );
  result.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Mock 配置",
          bold: true,
        }),
      ],
      spacing: {
        before: 250,
      },
    })
  );
  result.push(
    new Paragraph({
      text: `延迟时间：${data.config.delay}ms`,
    })
  );
  result.push(
    new Paragraph({
      text: `回显模式：${data.config.echoMode ? "开启" : "关闭"}`,
    })
  );
  result.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "响应配置",
          bold: true,
        }),
      ],
      spacing: {
        before: 250,
      },
    })
  );
  if (data.response.content) {
    result.push(
      new Paragraph({
        text: "响应内容：",
      })
    );
    result.push(createCodeBlock(data.response.content, components));
  }
  return result;
};
