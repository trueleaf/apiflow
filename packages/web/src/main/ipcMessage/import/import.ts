import { dialog, BrowserWindow, WebContentsView } from "electron";
import { ImportStatus } from "@src/types/types.ts";
import fs from "fs/promises";
import yauzl from "yauzl";
import { createHash } from "crypto";

// 全局导入状态
let importStatus: ImportStatus = {
  status: 'notStarted',
  progress: 0,
  itemNum: 0,
  processedNum: 0
};

let mainWindow: BrowserWindow | null = null;
let contentView: WebContentsView | null = null;
let importInProgress = false;

/**
 * 设置主窗口和内容视图引用
 */
export const setMainWindow = (window: BrowserWindow) => {
  mainWindow = window;
};

export const setContentView = (view: WebContentsView) => {
  contentView = view;
};

/**
 * 选择导入文件
 */
export const selectImportFile = async () => {
  if (!mainWindow) {
    throw new Error('主窗口未初始化');
  }

  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: '选择要导入的备份文件',
      filters: [
        { name: 'API Flow 备份文件', extensions: ['zip'] },
        { name: '所有文件', extensions: ['*'] }
      ],
      properties: ['openFile']
    });

    if (result.canceled || result.filePaths.length === 0) {
      return { success: false, error: '用户取消选择' };
    }

    const filePath = result.filePaths[0];
    
    // 检查文件是否存在
    try {
      await fs.access(filePath, fs.constants.F_OK);
    } catch {
      return { success: false, error: '文件不存在或无法访问' };
    }

    // 检查文件扩展名
    if (!filePath.toLowerCase().endsWith('.zip')) {
      return { success: false, error: '请选择有效的备份文件（.zip格式）' };
    }

    return { success: true, filePath };
  } catch (error) {
    console.error('选择导入文件失败:', error);
    return { success: false, error: (error as Error).message };
  }
};

/**
 * 分析导入文件
 */
export const analyzeImportFile = async (filePath: string) => {
  if (!contentView) {
    throw new Error('内容视图未初始化');
  }

  try {
    // 检查文件是否存在
    await fs.access(filePath, fs.constants.F_OK);
    
    const itemCount = await getArchiveItemCount(filePath);
    
    contentView.webContents.send('import-file-analyzed', {
      success: true,
      itemCount
    });
  } catch (error) {
    console.error('分析导入文件失败:', error);
    contentView.webContents.send('import-file-analyzed', {
      success: false,
      error: (error as Error).message
    });
  }
};

/**
 * 获取压缩包中的项目数量
 */
const getArchiveItemCount = async (filePath: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    yauzl.open(filePath, { lazyEntries: true }, (err, zipfile) => {
      if (err) {
        reject(new Error('无法打开压缩文件'));
        return;
      }
      let itemCount = 0;
      zipfile.readEntry();
      zipfile.on('entry', (entry) => {
        // 跳过目录和元数据文件
        if (!entry.fileName.endsWith('/') && 
            entry.fileName.startsWith('batch-') && 
            entry.fileName.endsWith('.dat')) {
          itemCount++;
        }
        zipfile.readEntry();
      });
      
      zipfile.on('end', () => {
        resolve(itemCount * 100); // 假设每个批次文件包含约100个数据项
      });
      
      zipfile.on('error', (error) => {
        reject(error);
      });
    });
  });
};

/**
 * 开始导入
 */
export const startImport = async (
  filePath: string, 
  itemNum: number
) => {
  if (!contentView) {
    throw new Error('内容视图未初始化');
  }

  if (importInProgress) {
    throw new Error('导入正在进行中');
  }

  try {
    importInProgress = true;
    importStatus = {
      status: 'inProgress',
      progress: 0,
      itemNum,
      processedNum: 0,
      filePath
    };

    // 开始解压和导入数据
    await extractAndImportData(filePath, itemNum);

  } catch (error) {
    console.error('导入失败:', error);
    importStatus.status = 'error';
    importInProgress = false;
    contentView.webContents.send('import-main-error', (error as Error).message);
  }
};

/**
 * 解压并导入数据
 */
const extractAndImportData = async (filePath: string, totalItems: number) => {
  return new Promise<void>((resolve, reject) => {
    yauzl.open(filePath, { lazyEntries: true }, (err, zipfile) => {
      if (err) {
        reject(new Error('无法打开导入文件'));
        return;
      }

      let processedItems = 0;
      const processedFiles = new Set<string>();

      zipfile.readEntry();

      zipfile.on('entry', (entry) => {
        // 跳过目录和非数据文件
        if (entry.fileName.endsWith('/') || 
            entry.fileName === 'export-metadata.dat' ||
            !entry.fileName.startsWith('batch-')) {
          zipfile.readEntry();
          return;
        }

        // 避免重复处理
        if (processedFiles.has(entry.fileName)) {
          zipfile.readEntry();
          return;
        }
        processedFiles.add(entry.fileName);

        zipfile.openReadStream(entry, (err, readStream) => {
          if (err) {
            console.error('读取文件失败:', err);
            zipfile.readEntry();
            return;
          }

          const chunks: Buffer[] = [];
          
          readStream.on('data', (chunk) => {
            chunks.push(chunk);
          });
          
          readStream.on('end', async () => {
            try {
              const buffer = Buffer.concat(chunks);
              const batchData = deserializeData(buffer);
              
              if (batchData && batchData.items) {
                // 发送数据到渲染进程进行导入
                await importBatchData(batchData.items);
                
                processedItems += batchData.items.length;
                importStatus.processedNum = processedItems;
                importStatus.progress = Math.min(Math.round((processedItems / totalItems) * 100), 100);
                
                if (contentView) {
                  contentView.webContents.send('import-progress', {
                    processed: processedItems,
                    total: totalItems,
                    message: `正在导入数据... ${processedItems}/${totalItems}`
                  });
                }
              }
              
              zipfile.readEntry();
            } catch (error) {
              console.error('处理批次数据失败:', error);
              zipfile.readEntry();
            }
          });
          
          readStream.on('error', (err) => {
            console.error('读取流错误:', err);
            zipfile.readEntry();
          });
        });
      });

      zipfile.on('end', () => {
        importStatus.status = 'completed';
        importStatus.progress = 100;
        importInProgress = false;
        
        if (contentView) {
          contentView.webContents.send('import-finish', {
            success: true,
            totalItems: processedItems,
            message: `导入成功！共导入 ${processedItems} 项数据`
          });
        }
        
        resolve();
      });

      zipfile.on('error', (error) => {
        importInProgress = false;
        reject(error);
      });
    });
  });
};

/**
 * 反序列化数据
 */
const deserializeData = (buffer: Buffer): any => {
  try {
    // 尝试新格式（带元数据）
    if (buffer.length >= 4) {
      const metadataLength = buffer.readUInt32BE(0);
      if (metadataLength > 0 && metadataLength < buffer.length) {
        const metadataBuffer = buffer.slice(4, 4 + metadataLength);
        const dataBuffer = buffer.slice(4 + metadataLength);
        
        try {
          const metadata = JSON.parse(metadataBuffer.toString('utf8'));
          const jsonString = dataBuffer.toString('utf8');
          const data = JSON.parse(jsonString);
          
          // 验证校验和（如果存在）
          if (metadata.checksum) {
            const checksum = createHash('md5').update(dataBuffer).digest('hex');
            if (checksum !== metadata.checksum) {
              console.warn('数据校验和不匹配');
            }
          }
          
          return data;
        } catch {
          // 如果元数据解析失败，尝试将整个buffer作为JSON解析
        }
      }
    }
    
    // 降级到基础JSON格式
    const jsonString = buffer.toString('utf8');
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('数据反序列化失败:', error);
    return null;
  }
};

/**
 * 导入批次数据到IndexedDB
 */
const importBatchData = async (items: any[]) => {
  if (!contentView) return;

  // 发送数据到渲染进程进行导入
  for (const item of items) {
    contentView.webContents.send('import-data-item', item);
  }
};

/**
 * 获取导入状态
 */
export const getImportStatus = () => {
  return { ...importStatus };
};

/**
 * 重置导入状态
 */
export const resetImport = () => {
  importInProgress = false;
  importStatus = {
    status: 'notStarted',
    progress: 0,
    itemNum: 0,
    processedNum: 0
  };
};
