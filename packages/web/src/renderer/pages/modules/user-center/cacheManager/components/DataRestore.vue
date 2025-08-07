<template>
  <div class="data-restore">
    <!-- 数据恢复内容区域 -->
    <div class="table-title">
      <h3>数据恢复</h3>
    </div>
    
    <div class="restore-content">
      <div class="instruction-section">
        <h4>恢复说明</h4>
        <p>数据恢复功能可以从备份文件中恢复您的本地数据。请注意，恢复操作可能会覆盖当前的数据。</p>
        <div class="warning-box">
          <p><strong>警告：</strong>恢复操作将覆盖现有数据，请确保您有重要数据的备份！</p>
        </div>
      </div>

      <div class="restore-file-section">
        <h4>选择备份文件</h4>
        <div class="file-upload-card">
          <el-upload
            action="#"
            :auto-upload="false"
            :limit="1"
            accept=".apibackup"
            class="upload-area"
            v-model:file-list="fileList"
            @change="handleFileChange"
          >
            <el-button>选择备份文件</el-button>
            <div class="upload-tip">请选择一个有效的 .apibackup 格式备份文件</div>
          </el-upload>
        </div>
      </div>

      <div class="restore-options-section">
        <h4>恢复选项</h4>
        <div class="options-card">
          <el-checkbox v-model="restoreOptions.localStorage">恢复 localStorage 数据</el-checkbox>
          <el-checkbox v-model="restoreOptions.indexedDB">恢复 IndexedDB 数据</el-checkbox>
          <el-checkbox v-model="restoreOptions.mergeData">合并现有数据（不勾选则完全覆盖）</el-checkbox>
        </div>

        <div class="restore-steps">
          <h4>恢复步骤</h4>
          <ol>
            <li>选择一个有效的备份文件</li>
            <li>选择要恢复的数据类型</li>
            <li>决定是合并还是覆盖现有数据</li>
            <li>点击"开始恢复"按钮</li>
            <li>恢复完成后，系统会提示恢复成功</li>
          </ol>
        </div>

        <div class="restore-action">
          <el-button 
            type="warning" 
            @click="handleStartRestore"
            :disabled="!selectedFile || isRestoring"
            :loading="isRestoring"
          >
            {{ isRestoring ? '恢复中...' : '开始恢复' }}
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { UploadFile, UploadFiles } from 'element-plus'
import { ElMessage } from 'element-plus'

interface RestoreOptions {
  localStorage: boolean
  indexedDB: boolean
  mergeData: boolean
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
const isRestoring = ref(false)
const fileList = ref<UploadFiles>([])
const restoreOptions = ref<RestoreOptions>({
  localStorage: true,
  indexedDB: true,
  mergeData: false
})

/*
|--------------------------------------------------------------------------
| 计算属性
|--------------------------------------------------------------------------
*/
const selectedFile = computed(() => {
  return fileList.value.length > 0 ? fileList.value[0].raw : null
})

/*
|--------------------------------------------------------------------------
| 方法
|--------------------------------------------------------------------------
*/
const handleFileChange = (_file: UploadFile, files: UploadFiles): void => {
  fileList.value = files
}

const handleStartRestore = (): void => {
  if (selectedFile.value) {
    isRestoring.value = true
    // 这里仅展示UI，实际恢复逻辑未实现
    setTimeout(() => {
      isRestoring.value = false
      ElMessage.success('数据恢复成功！')
    }, 1000)
  }
}
</script>

<style lang="scss" scoped>
.data-restore {
  .table-title {
    margin-bottom: 16px;
    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }
  }

  .restore-content {
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

    .warning-box {
      background-color: #fef6e9;
      border-left: 4px solid #e6a23c;
      padding: 12px 16px;
      margin: 16px 0;
      border-radius: 4px;

      p {
        margin: 0;
        color: #975b16;
      }
    }
  }

  .restore-file-section,
  .restore-options-section {
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

  .file-upload-card {
    background-color: #f8f9fa;
    padding: 24px;
    border-radius: 6px;
    text-align: center;
    border: 1px dashed #dcdfe6;
    margin-bottom: 20px;

    .upload-area {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .upload-tip {
      margin-top: 12px;
      font-size: 13px;
      color: #909399;
    }
  }

  .restore-steps {
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

  .restore-action {
    margin-top: 24px;
    display: flex;
    justify-content: center;
  }
}
</style>
