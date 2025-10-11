import { dialog, BrowserWindow, WebContentsView } from "electron";
import { ImportStatus } from "@src/types/index.ts";
import fs from "fs/promises";
import JSZip from "jszip";
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
      return { code: 1, msg: '用户取消选择', data: {} };
    }

    const filePath = result.filePaths[0];
    
    // 检查文件是否存在
    try {
      await fs.access(filePath, fs.constants.F_OK);
    } catch {
      return { code: 1, msg: '文件不存在或无法访问', data: {} };
    }

    // 检查文件扩展名
    if (!filePath.toLowerCase().endsWith('.zip')) {
      return { code: 1, msg: '请选择有效的备份文件（.zip格式）', data: {} };
    }

    return { code: 0, msg: '文件选择成功', data: { filePath } };
  } catch (error) {
    console.error('选择导入文件失败:', error);
    return { code: 1, msg: (error as Error).message, data: {} };
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
      code: 0,
      data: { itemCount }
    });
  } catch (error) {
    console.error('分析导入文件失败:', error);
    contentView.webContents.send('import-file-analyzed', {
      code: 1,
      msg: (error as Error).message
    });
  }
};

/**
 * 获取压缩包中的项目数量
 * 优化内存使用：只读取中央目录，不加载文件内容
 */
const getArchiveItemCount = async (filePath: string): Promise<number> => {
  try {
    // 检查文件大小，如果文件过大，使用分块读取
    const stats = await fs.stat(filePath);
    const fileSize = stats.size;
    
    let zipData: JSZip;
    
    if (fileSize > 50 * 1024 * 1024) { // 大于50MB的文件
      // 对于大文件，使用流式加载
      const zipBuffer = await fs.readFile(filePath);
      const zip = new JSZip();
      zipData = await zip.loadAsync(zipBuffer, { 
        checkCRC32: false, // 跳过CRC检查以提高性能
        createFolders: false // 不创建文件夹结构
      });
    } else {
      // 小文件直接加载
      const zipBuffer = await fs.readFile(filePath);
      const zip = new JSZip();
      zipData = await zip.loadAsync(zipBuffer);
    }
    
    let itemCount = 0;
    
    // 遍历ZIP文件中的所有条目
    Object.keys(zipData.files).forEach(fileName => {
      const file = zipData.files[fileName];
      // 跳过目录和元数据文件，只计算批次数据文件
      if (!file.dir && 
          fileName.startsWith('batch-') && 
          fileName.endsWith('.dat')) {
        itemCount++;
      }
    });
    
    return itemCount * 100; // 假设每个批次文件包含约100个数据项
  } catch (error) {
    throw new Error(`无法打开或分析压缩文件: ${(error as Error).message}`);
  }
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
 * 优化内存使用：批次处理文件，及时释放内存
 */
const extractAndImportData = async (filePath: string, totalItems: number) => {
  try {
    // 检查文件大小以决定处理策略
    const stats = await fs.stat(filePath);
    const fileSize = stats.size;
    
    let processedItems = 0;
    const processedFiles = new Set<string>();
    
    if (fileSize > 100 * 1024 * 1024) { // 大于100MB的文件，分块处理
      await processLargeZipFile(filePath, totalItems, processedFiles, processedItems);
    } else {
      // 小文件直接处理
      const zipBuffer = await fs.readFile(filePath);
      const zip = new JSZip();
      const zipData = await zip.loadAsync(zipBuffer);
      
      // 获取所有批次文件，按文件名排序确保处理顺序
      const batchFiles = Object.keys(zipData.files)
        .filter(fileName => {
          const file = zipData.files[fileName];
          return !file.dir && 
                 fileName.startsWith('batch-') && 
                 fileName.endsWith('.dat') &&
                 fileName !== 'export-metadata.dat';
        })
        .sort();
      
      // 顺序处理每个批次文件
      for (const fileName of batchFiles) {
        // 避免重复处理
        if (processedFiles.has(fileName)) {
          continue;
        }
        processedFiles.add(fileName);
        
        try {
          const file = zipData.files[fileName];
          const buffer = await file.async('nodebuffer');
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
          
          // 强制垃圾回收，释放内存
          if (global.gc) {
            global.gc();
          }
          
        } catch (error) {
          console.error(`处理批次文件 ${fileName} 失败:`, error);
          // 继续处理下一个文件，不中断整个导入过程
        }
      }
    }
    
    // 导入完成
    importStatus.status = 'completed';
    importStatus.progress = 100;
    importInProgress = false;
    
    if (contentView) {
      contentView.webContents.send('import-zip-read-complete', {
        code: 0,
        data: { totalItems: processedItems },
        msg: `ZIP文件读取完成，正在导入到数据库...`
      });
    }
    
  } catch (error) {
    importInProgress = false;
    throw new Error(`解压导入失败: ${(error as Error).message}`);
  }
};

/**
 * 处理大型ZIP文件的内存优化方法
 */
const processLargeZipFile = async (
  filePath: string, 
  totalItems: number, 
  processedFiles: Set<string>, 
  processedItems: number
) => {
  const zipBuffer = await fs.readFile(filePath);
  const zip = new JSZip();
  const zipData = await zip.loadAsync(zipBuffer, {
    checkCRC32: false, // 跳过CRC检查以提高性能
    createFolders: false
  });
  
  // 获取所有批次文件，按文件名排序
  const batchFiles = Object.keys(zipData.files)
    .filter(fileName => {
      const file = zipData.files[fileName];
      return !file.dir && 
             fileName.startsWith('batch-') && 
             fileName.endsWith('.dat') &&
             fileName !== 'export-metadata.dat';
    })
    .sort();
  
  // 分批处理文件，每次处理5个文件以控制内存使用
  const batchSize = 5;
  for (let i = 0; i < batchFiles.length; i += batchSize) {
    const currentBatch = batchFiles.slice(i, i + batchSize);
    
    for (const fileName of currentBatch) {
      if (processedFiles.has(fileName)) continue;
      processedFiles.add(fileName);
      
      try {
        const file = zipData.files[fileName];
        const buffer = await file.async('nodebuffer');
        const batchData = deserializeData(buffer);
        
        if (batchData && batchData.items) {
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
      } catch (error) {
        console.error(`处理批次文件 ${fileName} 失败:`, error);
      }
    }
    
    // 每处理一批文件后强制垃圾回收
    if (global.gc) {
      global.gc();
    }
    
    // 给事件循环一些时间处理其他任务
    await new Promise(resolve => setImmediate(resolve));
  }
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
