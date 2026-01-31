import { StandaloneExportHtmlParams } from "@src/types/standalone";
import path from "path";
import fs from "fs/promises";
import * as docx from "docx";
import { buildStandaloneWordDocument } from "@src/shared/export/standalone-word";
import { fileURLToPath } from "url";
import JSZip from "jszip";
import { dialog, BrowserWindow, WebContentsView, app } from "electron";
import { ExportStatus } from "@src/types/index.ts";
import { CommonResponse } from "@src/types/project";
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
    const doc = buildStandaloneWordDocument(exportHtmlParams);
    return await docx.Packer.toBuffer(doc);
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

