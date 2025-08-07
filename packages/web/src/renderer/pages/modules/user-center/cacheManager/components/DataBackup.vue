<template>
  <div class="data-backup">
    <!-- 数据备份内容区域 -->
    <div class="table-title">
      <h3>数据备份</h3>
      <p>数据备份功能可以将您的本地数据导出为一个备份文件，以便在需要时恢复。备份文件包含以下内容：</p>
    </div>

    <div class="backup-content">
      <div class="instruction-section">
        <h4>备份说明</h4>
        <p>数据备份功能将导出以下类型的数据：</p>
        <ul>
          <li>localStorage 存储的本地数据</li>
          <li>IndexedDB 数据库中的所有数据</li>
          <li>应用配置和用户设置</li>
        </ul>
        <p>备份文件将以 .apibackup 格式保存，可以在数据恢复功能中使用。</p>
      </div>

      <div class="backup-options-section">
        <h4>备份选项</h4>
        <div class="options-card">
          <el-checkbox v-model="backupOptions.localStorage">备份 localStorage 数据</el-checkbox>
          <el-checkbox v-model="backupOptions.indexedDB">备份 IndexedDB 数据</el-checkbox>
          <el-checkbox v-model="backupOptions.includeSettings">包含应用设置</el-checkbox>
        </div>

        <div class="backup-steps">
          <h4>备份步骤</h4>
          <ol>
            <li>选择要备份的数据类型</li>
            <li>点击"开始备份"按钮</li>
            <li>选择备份文件保存位置</li>
            <li>等待备份完成</li>
            <li>备份文件将保存为 .apibackup 格式</li>
          </ol>
        </div>

        <div class="backup-action">
          <el-button type="primary" @click="handleStartBackup" :loading="isBackingUp">
            {{ isBackingUp ? '备份中...' : '开始备份' }}
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

interface BackupOptions {
  localStorage: boolean
  indexedDB: boolean
  includeSettings: boolean
}

interface Props {
  loading?: boolean
}

defineProps<Props>()

/*
|--------------------------------------------------------------------------
| 变量
|--------------------------------------------------------------------------
*/
const isBackingUp = ref(false)
const backupOptions = ref<BackupOptions>({
  localStorage: true,
  indexedDB: true,
  includeSettings: false
})

/*
|--------------------------------------------------------------------------
| 方法
|--------------------------------------------------------------------------
*/
// 确认备份操作
const handleStartBackup = (): void => {
  isBackingUp.value = true
  // 这里仅展示UI，实际备份逻辑未实现
  setTimeout(() => {
    isBackingUp.value = false
    ElMessage.success('数据备份成功！')
  }, 1000)
}
</script>

<style lang="scss" scoped>
.data-backup {
  .table-title {
    margin-bottom: 16px;
    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }
  }

  .backup-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .instruction-section {
    h4 {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 12px;
      color: #333;
    }

    p {
      margin: 8px 0;
      font-size: 14px;
      line-height: 1.6;
      color: #606266;
    }

    ul {
      padding-left: 20px;
      margin: 12px 0;
      
      li {
        margin-bottom: 8px;
        line-height: 1.6;
        color: #606266;
      }
    }
  }

  .backup-options-section {
    h4 {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 12px;
      color: #333;
    }

    .options-card {
      background-color: #f8f9fa;
      padding: 16px;
      border-radius: 6px;
      margin-bottom: 20px;

      .el-checkbox {
        display: block;
        margin-bottom: 12px;
        
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }

  .backup-steps {
    margin-top: 16px;
    
    h4 {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 12px;
      color: #333;
    }
    
    ol {
      padding-left: 20px;
      
      li {
        margin-bottom: 8px;
        line-height: 1.6;
        color: #606266;
      }
    }
  }

  .backup-action {
    margin-top: 24px;
    display: flex;
    justify-content: center;
  }
}
</style>
