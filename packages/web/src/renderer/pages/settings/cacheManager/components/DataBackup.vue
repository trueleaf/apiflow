<template>
  <div class="data-backup">
    <!-- 数据导出配置 -->
    <div class="step-container">
      <div class="step-header">
        <div class="section-title">{{ t('数据导出') }}</div>
        <div class="gray-600">{{ t('导出数据可用于备份，也可以导入到在线版本或离线版本中') }}</div>
      </div>
      <!-- 保存路径配置 -->
      <div class="path-config">
        <div class="config-title required">{{ t('保存路径') }}</div>
          <div class="path-selector d-flex a-center" style="gap: 12px;">
            <el-button 
              v-if="exportStatus.status === 'notStarted' || exportStatus.status === 'pathSelected' || exportStatus.status === 'error' || exportStatus.status === 'completed'"
              type="primary" 
              size="small"
              @click="handleSelectPath"
            >
              {{ exportStatus.filePath ? t('重新选择') : t('选择路径') }}
            </el-button>
            <span v-if="exportStatus.filePath" class="selected-path" style="color: var(--primary); font-size: 13px; word-break: break-all;">
              {{ exportStatus.filePath }}
            </span>
          </div>
      </div>

      <!-- 高级选项 -->
      <div class="advanced-options">
        <div class="config-title">{{ t('高级选项') }}</div>
        <div>
          <el-checkbox v-model="exportConfig.includeResponseCache">
            {{ t('导出返回值缓存') }}
          </el-checkbox>
        </div>
        <el-alert v-if="exportConfig.includeResponseCache" :title="t('导出返回值缓存会花费更长时间，')" type="warning" :closable="false" />
      </div>

      <!-- 导出操作 -->
      <div class="export-actions">
        <div class="data-summary d-flex a-center" v-if="exportStatus.status === 'pathSelected' && estimatedDataCount > 0">
          <span class="data-label">{{ t('预计数据量：') }}</span>
          <span class="data-count">{{ estimatedDataCount }}</span>
          <span class="data-unit">{{ t('项') }}</span>
        </div>
        <div class="data-summary" v-else-if="exportStatus.status === 'pathSelected'">
          <span class="data-label">{{ t('正在计算数据量...') }}</span>
        </div>
        <!-- 路径错误提示 -->
        <el-alert v-if="pathErrorMessage" :title="pathErrorMessage" type="warning" :closable="false" class="mb-1" />
        <div class="mb-1"></div>
        <el-button 
          v-if="exportStatus.status === 'notStarted' || exportStatus.status === 'pathSelected'"
          type="primary" 
          @click="handleStartExport"
          :loading="isStartingExport"
        >
          {{ t('开始导出') }}
        </el-button>
      </div>
    </div>

    <!-- 导出进度 -->
    <div class="step-container" v-if="exportStatus.status === 'inProgress'">
      <div class="progress-wrap">
        <el-progress :percentage="exportStatus.progress" />
        <div class="status-text text-center" v-if="statusMessage">{{ statusMessage }}</div>
      </div>
    </div>

    <!-- 导出完成 -->
    <div class="step-container" v-if="exportStatus.status === 'completed'">
      <div class="result-content">
        <div class="result-count">{{ t('导出成功：共导出 {count} 项数据', { count: exportStatus.itemNum }) }}</div>
        <el-button type="primary" @click="handleStartExport">{{ t('再次导出') }}</el-button>
      </div>
    </div>

    <!-- 导出错误 -->
    <div class="step-container" v-if="exportStatus.status === 'error'">
      <div class="step-header">
        <div class="section-title">{{ t('导出失败') }}</div>
      </div>

      <div class="result-content text-center">
        <div class="error-message" v-if="statusMessage">{{ statusMessage }}</div>
        <el-button type="primary" @click="handleStartExport">{{ t('重试') }}</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { ExportStatus } from '@src/types/index.ts';
import { getIndexedDBItemCount } from '@/helper';
import { IPC_EVENTS } from '@src/types/ipc';
import { message } from '@/helper';

const { t } = useI18n()

const exportStatus = reactive<ExportStatus>({
  status: 'notStarted',
  progress: 0,
  itemNum: 0
});
const statusMessage = ref('');
const isStartingExport = ref(false);
const estimatedDataCount = ref(0);
const pathErrorMessage = ref(''); // 保存路径错误提示
const exportConfig = reactive({
  includeResponseCache: false
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
  // 监听准备接收数据事件
  listenerRefs.value.exportReadyToReceive = () => {
    statusMessage.value = '正在读取和发送数据...';
    sendDataToMain();
  };
  window.electronAPI?.ipcManager.onMain(IPC_EVENTS.export.mainToRenderer.readyToReceive, listenerRefs.value.exportReadyToReceive);
  
  // 监听导出完成事件
  listenerRefs.value.exportFinish = (result: { filePath: string, totalItems: number }) => {
    exportStatus.status = 'completed';
    exportStatus.progress = 100;
    statusMessage.value = `导出完成！文件已保存至: ${result.filePath}`;
    message.success(`成功导出 ${result.totalItems} 项数据`);
  };
  window.electronAPI?.ipcManager.onMain(IPC_EVENTS.export.mainToRenderer.finish, listenerRefs.value.exportFinish);
  
  // 监听主进程错误事件
  listenerRefs.value.exportMainError = (errorMessage: string) => {
    exportStatus.status = 'error';
    statusMessage.value = `导出失败: ${errorMessage}`;
    message.error(`导出失败: ${errorMessage}`);
  };
  window.electronAPI?.ipcManager.onMain(IPC_EVENTS.export.mainToRenderer.error, listenerRefs.value.exportMainError);
};
/*
|--------------------------------------------------------------------------
| 操作
|--------------------------------------------------------------------------
*/
// 选择保存路径
const handleSelectPath = async () => {
  try {
    const result = await window.electronAPI?.exportManager.selectPath();
    if (result && result.code === 0 && result.data?.filePath) {
      exportStatus.status = 'pathSelected';
      exportStatus.filePath = result.data.filePath;
      pathErrorMessage.value = '';
      calculateDataCount();
    } else {
      exportStatus.status = 'notStarted'
      statusMessage.value = result?.msg || '用户取消选择';
    }
  } catch (error) {
    console.error('选择路径失败:', error);
    statusMessage.value = t('选择路径失败');
  }
};
// 计算需要导出的数据量
const calculateDataCount = async () => {
  try {
    statusMessage.value = t('正在计算数据量...');
    estimatedDataCount.value = await getIndexedDBItemCount([exportConfig.includeResponseCache ? '' : 'httpNodeResponseCache']);
    exportStatus.itemNum = estimatedDataCount.value;
    statusMessage.value = '';
  } catch (error) {
    console.error('计算数据量失败:', error);
    statusMessage.value = t('数据量计算失败');
    message.error(t('数据量计算失败'));
  }
};
// 开始导出
const handleStartExport = async () => {
  pathErrorMessage.value = '';
  exportStatus.status = 'notStarted';
  if (!exportStatus.filePath) {
    pathErrorMessage.value = t('请选择保存路径');
    return;
  }
  if (estimatedDataCount.value === 0) {
    pathErrorMessage.value = t('没有可导出的数据');
    return;
  }
  try {
    isStartingExport.value = true;
    statusMessage.value = t('正在启动导出...');
    window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.export.rendererNotifyMain.start, {
      itemNum: exportStatus.itemNum,
      config: {
        includeResponseCache: exportConfig.includeResponseCache
      }
    });
    exportStatus.status = 'inProgress';
    exportStatus.progress = 0;
    statusMessage.value = t('正在准备导出数据...');
  } catch (error) {
    console.error('开始导出失败:', error);
    exportStatus.status = 'error';
    statusMessage.value = t('导出启动失败');
    message.error(t('导出启动失败'));
  } finally {
    isStartingExport.value = false;
  }
};
// 发送数据到主进程
const sendDataToMain = async () => {
  try {
    statusMessage.value = t('正在读取IndexedDB数据...');
    const databases = await indexedDB.databases();
    let processedCount = 0;
    // 用于存储打开的数据库连接，确保最后关闭
    const openDatabases: any[] = [];
    try {
      for (const { name: dbName } of databases) {
        if (!dbName) continue;
        let db: any = null;
        try {
          // 使用idb打开数据库
          const { openDB } = await import('idb');
          db = await openDB(dbName);
          if (!db) continue;
          // 记录数据库连接，确保后续关闭
          openDatabases.push(db);
          const storeNames = Array.from(db.objectStoreNames);
          for (const storeName of storeNames) {
            // 检查是否跳过返回值缓存
            if (!checkDbIsNeedExport(dbName)) {
              continue;
            }
            try {
              // 为每个store创建新的事务
              const transaction = db.transaction(storeName, 'readonly');
              const store = transaction.store;
              const allKeys = await store.getAllKeys();
              const allValues = await store.getAll();
              await transaction.done;
              // 处理所有数据
              for (let i = 0; i < allKeys.length; i++) {
                const key = allKeys[i];
                const value = allValues[i];
                
                const data = {
                  fileName: `${dbName}_${storeName}_${key}.json`,
                  dbName,
                  storeName,
                  key: key,
                  value: value,
                  timestamp: new Date().toISOString()
                };

                // 发送数据到主进程
                window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.export.rendererNotifyMain.rendererData, data);
                
                processedCount++;
                const progress = Math.round((processedCount / exportStatus.itemNum) * 100);
                exportStatus.progress = Math.min(progress, 95); // 预留5%给最后的完成步骤
                statusMessage.value = t('正在导出数据...') + ` ${processedCount}/${exportStatus.itemNum}`;
              }
            } catch (storeError) {
              console.warn(`处理存储 ${storeName} 时出错:`, storeError);
              continue;
            }
          }
        } catch (error) {
          console.warn(`处理数据库 ${dbName} 时出错:`, error);
          continue;
        }
      }
    } finally {
      // 确保所有数据库连接都被关闭，防止内存泄漏
      for (const db of openDatabases) {
        try {
          if (db && typeof db.close === 'function') {
            db.close();
          }
        } catch (closeError) {
          console.warn('关闭数据库连接时出错:', closeError);
        }
      }
      // 清理数组引用
      openDatabases.length = 0;
    }
    
    statusMessage.value = t('数据读取完成，正在打包...');

    // 通知主进程数据发送完毕
    window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.export.rendererNotifyMain.rendererDataFinish);
    
  } catch (error) {
    console.error('发送数据失败:', error);
    exportStatus.status = 'error';
    statusMessage.value = t('数据发送失败');
    message.error(t('数据发送失败') + `: ${(error as Error).message}`);
  }
};
// 检查是否统计当前数据库
const checkDbIsNeedExport = (dbName: string) => {
  if (!exportConfig.includeResponseCache && dbName === 'httpNodeResponseCache') {
    return false;
  }
  return true
}
// 清理IPC监听器
const cleanupIpcListeners = () => {
  // 移除所有本组件注册的监听器
  if (window.electronAPI?.ipcManager.removeListener && listenerRefs.value) {
    // 移除准备接收数据监听器
    if (listenerRefs.value.exportReadyToReceive) {
      window.electronAPI.ipcManager.removeListener(IPC_EVENTS.export.mainToRenderer.readyToReceive, listenerRefs.value.exportReadyToReceive);
    }

    // 移除导出完成监听器
    if (listenerRefs.value.exportFinish) {
      window.electronAPI.ipcManager.removeListener(IPC_EVENTS.export.mainToRenderer.finish, listenerRefs.value.exportFinish);
    }

    // 移除主进程错误监听器
    if (listenerRefs.value.exportMainError) {
      window.electronAPI.ipcManager.removeListener(IPC_EVENTS.export.mainToRenderer.error, listenerRefs.value.exportMainError);
    }

    // 移除重置完成监听器
    if (listenerRefs.value.exportResetComplete) {
      window.electronAPI.ipcManager.removeListener(IPC_EVENTS.export.mainToRenderer.resetComplete, listenerRefs.value.exportResetComplete);
    }

    // 清空所有引用
    listenerRefs.value = {};
  }
};
watch(() => exportConfig.includeResponseCache, () => {
  calculateDataCount();
});
onMounted(() => {
  window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.export.rendererNotifyMain.reset);
  initIpcListeners();
});
onUnmounted(() => {
  cleanupIpcListeners();
});
</script>

<style lang="scss" scoped>
.data-backup {
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

.path-config {
  margin-bottom: 24px;
}

.advanced-options {
  margin-bottom: 12px;
  .option-info {
    display: inline-block;
    padding: 8px 12px;
    background: var(--light);
    border: 1px solid var(--gray-300);
    border-radius: var(--border-radius);
    
    .info-text {
      color: var(--gray-600);
      font-size: var(--font-size-xs);
      line-height: 1.4;
    }
  }
}

.export-actions {
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
  
  .path-error-message {
    margin-bottom: 16px;
    padding: 8px 12px;
    background: color-mix(in srgb, var(--danger) 15%, white);
    border: 1px solid var(--danger);
    border-radius: var(--border-radius);
    color: var(--danger);
    font-size: var(--font-size-sm);
  }
}

.progress-wrap {
  .progress-info {
    margin-bottom: 12px;
    color: var(--gray-600);
    font-size: var(--font-size-sm);
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
