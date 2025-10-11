<template>
  <div class="data-restore">
    <!-- 数据导入配置 -->
    <div class="step-container">
      <div class="step-header">
        <div class="section-title">数据导入</div>
        <div class="gray-600">从备份文件中恢复数据，支持导入离线版本或在线版本导出的数据</div>
      </div>
      <!-- 文件选择配置 -->
      <div class="file-config">
        <div class="config-title required">选择备份文件</div>
          <div class="file-selector d-flex a-center" style="gap: 12px;">
            <el-button 
              v-if="importStatus.status === 'notStarted' || importStatus.status === 'fileSelected'"
              type="primary" 
              size="small"
              @click="handleSelectFile"
            >
              {{ importStatus.filePath ? '重新选择' : '选择文件' }}
            </el-button>
            <span v-if="importStatus.filePath" class="selected-path" style="color: var(--primary); font-size: 13px; word-break: break-all;">
              {{ importStatus.filePath }}
            </span>
          </div>
      </div>

      <!-- 高级选项 -->
      <div class="advanced-options">
        <div class="config-title">导入选项</div>
        <div class="option-group">
          <el-radio-group v-model="importConfig.importMode">
            <el-radio value="merge">合并模式</el-radio>
            <el-radio value="override">覆盖模式</el-radio>
          </el-radio-group>
          <el-alert 
            v-if="importConfig.importMode === 'merge'"
            title="合并模式：新数据将与现有数据合并，相同key的数据将被覆盖"
            type="info"
            :closable="false"
          />
          <el-alert 
            v-if="importConfig.importMode === 'override'"
            title="覆盖模式：清空现有数据后导入新数据"
            type="warning"
            :closable="false"
          />
        </div>
      </div>

      <!-- 导入操作 -->
      <div class="import-actions">
        <div class="data-summary d-flex a-center" v-if="importStatus.status === 'fileSelected' && estimatedDataCount > 0">
          <span class="data-label">预计导入数据量：</span>
          <span class="data-count">{{ estimatedDataCount }}</span>
          <span class="data-unit">项</span>
        </div>
        <div class="data-summary" v-else-if="importStatus.status === 'fileSelected'">
          <span class="data-label">正在分析文件...</span>
        </div>
        <!-- 文件错误提示 -->
        <el-alert v-if="fileErrorMessage" :title="fileErrorMessage" type="warning" :closable="false" class="mb-1" />
        <div class="mb-1"></div>
        <el-button 
          v-if="importStatus.status === 'notStarted' || importStatus.status === 'fileSelected'"
          type="primary" 
          @click="handleStartImport"
          :loading="isStartingImport"
          :disabled="!importStatus.filePath"
        >
          开始导入
        </el-button>
      </div>
    </div>

    <!-- 导入进度 -->
    <div class="step-container" v-if="importStatus.status === 'inProgress'">
      <div class="progress-wrap">
        <el-progress :percentage="importStatus.progress" />
        <div class="progress-info">
          <span>已处理：{{ importStatus.processedNum }} / {{ importStatus.itemNum }}</span>
        </div>
        <div class="status-text text-center" v-if="statusMessage">{{ statusMessage }}</div>
      </div>
    </div>

    <!-- 导入完成 -->
    <div class="step-container" v-if="importStatus.status === 'completed'">
      <div class="result-content">
        <div class="result-count">导入成功：共导入 {{ importStatus.itemNum }} 项数据</div>
        <el-button type="primary" @click="handleResetImport">再次导入</el-button>
      </div>
    </div>

    <!-- 导入错误 -->
    <div class="step-container" v-if="importStatus.status === 'error'">
      <div class="step-header">
        <div class="section-title">导入失败</div>
      </div>

      <div class="result-content text-center">
        <div class="error-message" v-if="statusMessage">{{ statusMessage }}</div>
        <el-button type="primary" @click="handleResetImport">重试</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ImportStatus } from '@src/types/index.ts';

// 定义emit事件
const emit = defineEmits<{
  refreshCache: []
}>();

const importStatus = reactive<ImportStatus>({
  status: 'notStarted',
  progress: 0,
  itemNum: 0,
  processedNum: 0
});
const statusMessage = ref('');
const isStartingImport = ref(false);
const estimatedDataCount = ref(0);
const fileErrorMessage = ref(''); // 文件错误提示
const importConfig = reactive({
  importMode: 'merge'
});

// 导入状态跟踪
const pendingImports = ref(0); // 等待导入的数据项数量
const completedImports = ref(0); // 已完成导入的数据项数量
const zipReadComplete = ref(false); // ZIP文件是否读取完成

// 存储监听器引用，用于后续清理
const listenerRefs = ref<Record<string, (...args: any[]) => void>>({});
const workerRef = ref<Worker | null>(null);

/*
|--------------------------------------------------------------------------
| 初始化相关
|--------------------------------------------------------------------------
*/
const initWorker = () => {
  workerRef.value = new Worker(new URL('@/worker/indexedDB.ts', import.meta.url), { type: 'module' });
  workerRef.value.addEventListener('message', handleWorkerMessage);
};
const handleWorkerMessage = (event: MessageEvent) => {
  const { type, data } = event.data;
  if (type === 'clearAllResult') {
    if (data.code === 0) {
      statusMessage.value = '数据清空完成，正在开始导入...';
      window.electronAPI?.ipcManager.sendToMain('import-start', {
        filePath: importStatus.filePath,
        itemNum: importStatus.itemNum,
        config: {
          importMode: importConfig.importMode
        }
      });
      statusMessage.value = '正在准备导入数据...';
    } else {
      console.error('清空数据失败:', data.msg);
      importStatus.status = 'error';
      statusMessage.value = '清空数据失败';
      ElMessage.error('清空数据失败');
    }
  }
};
// IPC事件监听器
const initIpcListeners = () => {
  cleanupIpcListeners();
  
  // 监听文件分析完成事件
  listenerRefs.value.importFileAnalyzed = (result: { code: number, data?: { itemCount?: number }, msg?: string }) => {
    if (result.code === 0 && result.data?.itemCount !== undefined) {
      estimatedDataCount.value = result.data.itemCount;
      importStatus.itemNum = result.data.itemCount;
      statusMessage.value = '';
    } else {
      fileErrorMessage.value = result.msg || '文件分析失败';
      estimatedDataCount.value = 0;
    }
  };
  window.electronAPI?.ipcManager.onMain('import-file-analyzed', listenerRefs.value.importFileAnalyzed);
  
  // 监听导入进度事件
  listenerRefs.value.importProgress = (progress: { processed: number, total: number, message?: string }) => {
    importStatus.processedNum = progress.processed;
    importStatus.progress = Math.round((progress.processed / progress.total) * 100);
    if (progress.message) {
      statusMessage.value = progress.message;
    }
  };
  window.electronAPI?.ipcManager.onMain('import-progress', listenerRefs.value.importProgress);
  
  // 监听ZIP文件读取完成事件
  listenerRefs.value.importZipReadComplete = (result: { code: number, data?: { totalItems: number }, msg?: string }) => {
    if (result.code === 0 && result.data) {
      statusMessage.value = result.msg || 'ZIP文件读取完成，正在导入到数据库...';
      // 设置预期的总数据项数量，但不立即完成导入状态
      importStatus.itemNum = result.data.totalItems;
      zipReadComplete.value = true;

      // 如果没有数据项需要导入，直接标记为完成
      if (result.data.totalItems === 0) {
        importStatus.status = 'completed';
        importStatus.progress = 100;
        statusMessage.value = '导入完成！没有数据需要导入';
        emit('refreshCache');
      } else {
        // 检查是否所有数据都已导入完成
        checkImportComplete();
      }
    } else {
      importStatus.status = 'error';
      statusMessage.value = result.msg || 'ZIP文件读取失败';
      ElMessage.error(result.msg || 'ZIP文件读取失败');
    }
  };
  window.electronAPI?.ipcManager.onMain('import-zip-read-complete', listenerRefs.value.importZipReadComplete);
  
  // 监听主进程错误事件
  listenerRefs.value.importMainError = (errorMessage: string) => {
    importStatus.status = 'error';
    statusMessage.value = `导入失败: ${errorMessage}`;
    ElMessage.error(`导入失败: ${errorMessage}`);
  };
  window.electronAPI?.ipcManager.onMain('import-main-error', listenerRefs.value.importMainError);
  
  // 监听导入数据项事件
  listenerRefs.value.importDataItem = async (item: any) => {
    pendingImports.value++;
    try {
      await importDataToIndexedDB(item);
      completedImports.value++;
      // 检查是否所有数据都已导入完成
      checkImportComplete();
    } catch (error) {
      console.error('导入数据项失败:', error);
      completedImports.value++;
      checkImportComplete();
    }
  };
  window.electronAPI?.ipcManager.onMain('import-data-item', listenerRefs.value.importDataItem);
};
/*
|--------------------------------------------------------------------------
| 操作
|--------------------------------------------------------------------------
*/
// 选择导入文件
const handleSelectFile = async () => {
  try {
    const result = await window.electronAPI?.importManager.selectFile();
    if (result && result.code === 0 && result.data?.filePath) {
      importStatus.status = 'fileSelected';
      importStatus.filePath = result.data.filePath;
      fileErrorMessage.value = '';
      analyzeImportFile();
    } else {
      importStatus.status = 'notStarted';
      statusMessage.value = result?.msg || '用户取消选择';
    }
  } catch (error) {
    console.error('选择文件失败:', error);
    statusMessage.value = '选择文件失败';
  }
};
// 分析导入文件
const analyzeImportFile = async () => {
  statusMessage.value = '正在分析文件...';
  window.electronAPI?.ipcManager.sendToMain('import-analyze-file', {
    filePath: importStatus.filePath
  });
};
// 开始导入
const handleStartImport = async () => {
  fileErrorMessage.value = '';
  if (!importStatus.filePath) {
    fileErrorMessage.value = '请选择导入文件';
    return;
  }
  if (estimatedDataCount.value === 0) {
    fileErrorMessage.value = '文件中没有可导入的数据';
    return;
  }
  // 如果是覆盖模式，需要用户确认
  if (importConfig.importMode === 'override') {
    try {
      await ElMessageBox.confirm(
        '覆盖模式将清空所有现有数据，此操作不可恢复！是否继续？',
        '危险操作确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      );
    } catch {
      return; // 用户取消
    }
  }
  try {
    isStartingImport.value = true;
    importStatus.status = 'inProgress';
    importStatus.progress = 0;
    importStatus.processedNum = 0;
    
    // 重置导入跟踪变量
    pendingImports.value = 0;
    completedImports.value = 0;
    zipReadComplete.value = false;
    
    // 如果是覆盖模式，先在渲染进程中清空数据（非阻塞方式）
    if (importConfig.importMode === 'override') {
      statusMessage.value = '正在清空现有数据...';
      workerRef.value?.postMessage({
        type: 'clearAllIndexedDB'
      });
      return;
    }
    
    // 发送导入请求到主进程（仅在非覆盖模式下执行）
    statusMessage.value = '正在启动导入...';
    window.electronAPI?.ipcManager.sendToMain('import-start', {
      filePath: importStatus.filePath,
      itemNum: importStatus.itemNum,
      config: {
        importMode: importConfig.importMode
      }
    });
    statusMessage.value = '正在准备导入数据...';
  } catch (error) {
    console.error('开始导入失败:', error);
    importStatus.status = 'error';
    statusMessage.value = '导入启动失败';
    ElMessage.error('导入启动失败');
  } finally {
    isStartingImport.value = false;
  }
};

// 重置导入状态
const handleResetImport = () => {
  importStatus.status = 'notStarted';
  importStatus.progress = 0;
  importStatus.itemNum = 0;
  importStatus.processedNum = 0;
  importStatus.filePath = undefined;
  estimatedDataCount.value = 0;
  statusMessage.value = '';
  fileErrorMessage.value = '';
  
  // 重置导入跟踪变量
  pendingImports.value = 0;
  completedImports.value = 0;
  zipReadComplete.value = false;
  
  window.electronAPI?.ipcManager.sendToMain('import-reset');
};

/*
|--------------------------------------------------------------------------
| 数据操作函数
|--------------------------------------------------------------------------
*/
// 检查导入是否完成
const checkImportComplete = () => {
  // 只有当ZIP文件读取完成且所有数据项都导入完成时，才标记为完成
  if (zipReadComplete.value && completedImports.value >= pendingImports.value && pendingImports.value > 0) {
    importStatus.status = 'completed';
    importStatus.progress = 100;
    importStatus.processedNum = completedImports.value;
    statusMessage.value = `导入完成！共导入 ${completedImports.value} 项数据`;
    emit('refreshCache');
  }
};
// 将数据项导入到 IndexedDB
const importDataToIndexedDB = async (item: any) => {
  if (!item || !item.dbName || !item.storeName || item.key === undefined) {
    console.warn('无效的数据项:', item);
    return;
  }
  
  try {
    const { openDB } = await import('idb');
    const db = await openDB(item.dbName, undefined, {
      upgrade(db) {
        // 如果对象存储不存在，则创建它
        if (!db.objectStoreNames.contains(item.storeName)) {
          db.createObjectStore(item.storeName);
        }
      }
    });
    
    const transaction = db.transaction(item.storeName, 'readwrite');
    const store = transaction.store;
    
    await store.put(item.value, item.key);
    await transaction.done;
    
    db.close();
  } catch (error) {
    console.error(`导入数据到 ${item.dbName}.${item.storeName} 失败:`, error);
    throw error;
  }
};

// 清理IPC监听器
const cleanupIpcListeners = () => {
  if (window.electronAPI?.ipcManager.removeListener && listenerRefs.value) {
    // 移除文件分析完成监听器
    if (listenerRefs.value.importFileAnalyzed) {
      window.electronAPI.ipcManager.removeListener('import-file-analyzed', listenerRefs.value.importFileAnalyzed);
    }
    
    // 移除导入进度监听器
    if (listenerRefs.value.importProgress) {
      window.electronAPI.ipcManager.removeListener('import-progress', listenerRefs.value.importProgress);
    }
    
    // 移除ZIP文件读取完成监听器
    if (listenerRefs.value.importZipReadComplete) {
      window.electronAPI.ipcManager.removeListener('import-zip-read-complete', listenerRefs.value.importZipReadComplete);
    }
    
    // 移除主进程错误监听器
    if (listenerRefs.value.importMainError) {
      window.electronAPI.ipcManager.removeListener('import-main-error', listenerRefs.value.importMainError);
    }
    
    // 移除导入数据项监听器
    if (listenerRefs.value.importDataItem) {
      window.electronAPI.ipcManager.removeListener('import-data-item', listenerRefs.value.importDataItem);
    }
    
    // 清空所有引用
    listenerRefs.value = {};
  }
};

// 清理Worker
const cleanupWorker = () => {
  if (workerRef.value) {
    workerRef.value.removeEventListener('message', handleWorkerMessage);
    workerRef.value.terminate();
    workerRef.value = null;
  }
};

onMounted(() => {
  window.electronAPI?.ipcManager.sendToMain('import-reset');
  initWorker();
  initIpcListeners();
});

onUnmounted(() => {
  cleanupIpcListeners();
  cleanupWorker();
});
</script>

<style lang="scss" scoped>
.data-restore {
  padding: 20px;
  margin: 0 auto;
  width: 50%;
  min-width: 580px;
}

.step-header {
  margin-bottom: 20px;
}

.section-title {
  margin-bottom: 5px;
  font-size: var(--font-size-ex);
  font-weight: 600;
}

.config-title {
  margin: 0 0 6px 0;
  font-size: var(--font-size-sm);
  font-weight: 500;
  
  &.required::after {
    content: '*';
    color: var(--danger);
    margin-left: 4px;
  }
}

.file-config {
  margin-bottom: 24px;
}

.advanced-options {
  margin-bottom: 12px;
  
  .option-group {
    margin-bottom: 12px;
  }
}

.import-actions {
  .data-summary {
    margin-bottom: 20px;
    background: var(--light);
    border-radius: var(--border-radius-bg);
    gap: 4px;
    
    .data-label {
      color: var(--gray-600);
      font-size: var(--font-size-sm);
    }
    
    .data-count {
      color: var(--gray-800);
      font-size: 18px;
      font-weight: 600;
    }
    
    .data-unit {
      color: var(--gray-600);
      font-size: var(--font-size-sm);
    }
  }
}

.progress-wrap {
  .progress-info {
    margin-bottom: 12px;
    color: var(--gray-600);
    font-size: var(--font-size-sm);
    text-align: center;
  }
  
  .status-text {
    margin-top: 8px;
    color: var(--gray-500);
    font-size: var(--font-size-xs);
  }
}

.result-content {
  .result-count {
    margin-bottom: 16px;
    color: var(--green);
    font-size: var(--font-size-sm);
  }
  
  .error-message {
    margin-bottom: 16px;
    color: var(--danger);
    font-size: 13px;
  }
}

</style>
