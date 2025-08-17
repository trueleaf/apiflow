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
import { ImportStatus } from '@src/types/types';

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

// 存储监听器引用，用于后续清理
const listenerRefs = ref<Record<string, (...args: any[]) => void>>({});

/*
|--------------------------------------------------------------------------
| 初始化相关
|--------------------------------------------------------------------------
*/
// IPC事件监听器
const initIpcListeners = () => {
  cleanupIpcListeners();
  
  // 监听选择文件回复事件
  listenerRefs.value.importSelectFileReply = (result: any) => {
    if (result?.success && result.filePath) {
      importStatus.status = 'fileSelected';
      importStatus.filePath = result.filePath;
      fileErrorMessage.value = '';
      analyzeImportFile();
    } else {
      importStatus.status = 'notStarted';
      statusMessage.value = result?.error || '用户取消选择';
    }
  };
  window.electronAPI?.onMain('import-select-file-reply', listenerRefs.value.importSelectFileReply);
  
  // 监听文件分析完成事件
  listenerRefs.value.importFileAnalyzed = (result: { success: boolean, itemCount?: number, error?: string }) => {
    if (result.success && result.itemCount !== undefined) {
      estimatedDataCount.value = result.itemCount;
      importStatus.itemNum = result.itemCount;
      statusMessage.value = '';
    } else {
      fileErrorMessage.value = result.error || '文件分析失败';
      estimatedDataCount.value = 0;
    }
  };
  window.electronAPI?.onMain('import-file-analyzed', listenerRefs.value.importFileAnalyzed);
  
  // 监听导入进度事件
  listenerRefs.value.importProgress = (progress: { processed: number, total: number, message?: string }) => {
    importStatus.processedNum = progress.processed;
    importStatus.progress = Math.round((progress.processed / progress.total) * 100);
    if (progress.message) {
      statusMessage.value = progress.message;
    }
  };
  window.electronAPI?.onMain('import-progress', listenerRefs.value.importProgress);
  
  // 监听导入完成事件
  listenerRefs.value.importFinish = (result: { success: boolean, totalItems: number, message?: string }) => {
    if (result.success) {
      importStatus.status = 'completed';
      importStatus.progress = 100;
      importStatus.processedNum = result.totalItems;
      statusMessage.value = result.message || `导入完成！共导入 ${result.totalItems} 项数据`;
      // 导入成功后通知父组件刷新缓存状态
      emit('refreshCache');
    } else {
      importStatus.status = 'error';
      statusMessage.value = result.message || '导入失败';
      ElMessage.error(result.message || '导入失败');
    }
  };
  window.electronAPI?.onMain('import-finish', listenerRefs.value.importFinish);
  
  // 监听主进程错误事件
  listenerRefs.value.importMainError = (errorMessage: string) => {
    importStatus.status = 'error';
    statusMessage.value = `导入失败: ${errorMessage}`;
    ElMessage.error(`导入失败: ${errorMessage}`);
  };
  window.electronAPI?.onMain('import-main-error', listenerRefs.value.importMainError);
  
  // 监听导入数据项事件
  listenerRefs.value.importDataItem = async (item: any) => {
    try {
      await importDataToIndexedDB(item);
    } catch (error) {
      console.error('导入数据项失败:', error);
    }
  };
  window.electronAPI?.onMain('import-data-item', listenerRefs.value.importDataItem);
};
/*
|--------------------------------------------------------------------------
| 操作
|--------------------------------------------------------------------------
*/
// 选择导入文件
const handleSelectFile = async () => {
  window.electronAPI?.sendToMain('import-select-file');
};

// 分析导入文件
const analyzeImportFile = async () => {
  statusMessage.value = '正在分析文件...';
  window.electronAPI?.sendToMain('import-analyze-file', {
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
    
    // 如果是覆盖模式，先在渲染进程中清空数据
    if (importConfig.importMode === 'override') {
      statusMessage.value = '正在清空现有数据...';
      try {
        await clearAllData();
        statusMessage.value = '数据清空完成，正在开始导入...';
      } catch (error) {
        console.error('清空数据失败:', error);
        importStatus.status = 'error';
        statusMessage.value = '清空数据失败';
        ElMessage.error('清空数据失败');
        return;
      }
    } else {
      statusMessage.value = '正在启动导入...';
    }
    
    // 发送导入请求到主进程
    window.electronAPI?.sendToMain('import-start', {
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
  window.electronAPI?.sendToMain('import-reset');
};

/*
|--------------------------------------------------------------------------
| 数据操作函数
|--------------------------------------------------------------------------
*/
// 清空所有本地数据
const clearAllData = async () => {
  localStorage.clear();
  sessionStorage.clear();
  const databases = await indexedDB.databases();
  for (const { name: dbName } of databases) {
    if (!dbName) continue;
    try {
      const { openDB } = await import('idb');
      const db = await openDB(dbName);
      const storeNames = Array.from(db.objectStoreNames);
      
      for (const storeName of storeNames) {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.store;
        await store.clear();
        await transaction.done;
      }
      
      db.close();
    } catch (error) {
      console.warn(`清空数据库 ${dbName} 失败:`, error);
    }
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
  if (window.electronAPI?.removeListener && listenerRefs.value) {
    // 移除选择文件回复监听器
    if (listenerRefs.value.importSelectFileReply) {
      window.electronAPI.removeListener('import-select-file-reply', listenerRefs.value.importSelectFileReply);
    }
    
    // 移除文件分析完成监听器
    if (listenerRefs.value.importFileAnalyzed) {
      window.electronAPI.removeListener('import-file-analyzed', listenerRefs.value.importFileAnalyzed);
    }
    
    // 移除导入进度监听器
    if (listenerRefs.value.importProgress) {
      window.electronAPI.removeListener('import-progress', listenerRefs.value.importProgress);
    }
    
    // 移除导入完成监听器
    if (listenerRefs.value.importFinish) {
      window.electronAPI.removeListener('import-finish', listenerRefs.value.importFinish);
    }
    
    // 移除主进程错误监听器
    if (listenerRefs.value.importMainError) {
      window.electronAPI.removeListener('import-main-error', listenerRefs.value.importMainError);
    }
    
    // 移除导入数据项监听器
    if (listenerRefs.value.importDataItem) {
      window.electronAPI.removeListener('import-data-item', listenerRefs.value.importDataItem);
    }
    
    // 清空所有引用
    listenerRefs.value = {};
  }
};

onMounted(() => {
  window.electronAPI?.sendToMain('import-reset');
  initIpcListeners();
});

onUnmounted(() => {
  cleanupIpcListeners();
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
    background: var(--bg-light);
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
