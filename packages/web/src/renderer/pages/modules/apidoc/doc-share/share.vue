<template>
  <div v-if="hasPermission" class="doc-share">
    <div class="share-info">
      <div class="share-header">
        <div class="project-info">
          <h1 class="project-name">{{ shareInfo.projectName }}</h1>
          <p class="share-name">{{ shareInfo.shareName }}</p>
        </div>
        <div class="share-status">
          <el-tag v-if="shareInfo.expire" type="warning" size="small">
            过期时间: {{ formatExpireTime(shareInfo.expire) }}
          </el-tag>
          <el-tag v-else type="success" size="small">永久有效</el-tag>
        </div>
      </div>
      <div class="share-content">
        <!-- 这里可以放置实际的文档内容 -->
        <div class="content-placeholder">
          <el-icon :size="48" color="#409EFF">
            <Document />
          </el-icon>
          <h3>文档内容</h3>
          <p>这里是分享的API文档内容</p>
        </div>
      </div>
    </div>
  </div>
  <div v-else-if="loading" class="loading-container">
    <div class="loading-content">
      <el-icon class="loading-icon" :size="32">
        <Loading />
      </el-icon>
      <p>正在验证分享链接...</p>
    </div>
  </div>
  <div v-else class="no-permission">
    <div class="error-content">
      <el-icon :size="48" color="#F56C6C">
        <Warning />
      </el-icon>
      <h3>访问失败</h3>
      <p>{{ errorMessage }}</p>
    </div>
  </div>

  <!-- 密码输入弹窗 -->
  <SDialog 
    v-model="passwordDialogVisible" 
    title="请输入访问密码" 
    width="400px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
  >
    <div class="password-dialog-content">
      <div class="password-header">
        <el-icon :size="24" color="#409EFF">
          <Lock />
        </el-icon>
        <h4>此文档需要密码访问</h4>
        <p>请输入正确的访问密码以查看文档内容</p>
      </div>
      <el-form ref="passwordFormRef" :model="passwordFormData" :rules="passwordRules" class="password-form">
        <el-form-item prop="password">
          <el-input
            v-model="passwordFormData.password"
            type="password"
            placeholder="请输入访问密码"
            show-password
            clearable
            @keyup.enter="handlePasswordSubmit"
            ref="passwordInput"
          >
            <template #prefix>
              <el-icon><Key /></el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <div class="password-dialog-footer">
        <el-button 
          :loading="passwordLoading" 
          type="primary" 
          @click="handlePasswordSubmit"
        >
          确认访问
        </el-button>
      </div>
    </template>
  </SDialog>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { router } from '@/router'
import { request } from '@/api/api'
import { ElMessage, FormInstance } from 'element-plus'
import { Document, Loading, Warning, Lock, Key } from '@element-plus/icons-vue'
import SDialog from '@/components/common/dialog/g-dialog.vue'

// 分享信息类型定义
interface ShareInfo {
  projectName: string
  shareName: string
  expire: string | null
  needPassword: boolean
}

// 响应式数据
const hasPermission = ref(false)
const loading = ref(true)
const errorMessage = ref('认证中...')
const projectId = ref(router.currentRoute.value.query.id as string)
const shareId = ref(router.currentRoute.value.query.share_id as string)

// 分享信息
const shareInfo = ref<ShareInfo>({
  projectName: '',
  shareName: '',
  expire: null,
  needPassword: false
})

// 密码弹窗相关
const passwordDialogVisible = ref(false)
const passwordLoading = ref(false)
const passwordFormData = ref({
  password: ''
})
const passwordFormRef = ref<FormInstance>()
const passwordInput = ref<HTMLInputElement>()

// 密码验证规则
const passwordRules = ref({
  password: [
    { required: true, message: '请输入访问密码', trigger: 'blur' }
  ]
})

// 格式化过期时间
const formatExpireTime = (expireTime: string) => {
  const date = new Date(expireTime)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取分享信息
const getShareInfo = async () => {
  try {
    loading.value = true
    errorMessage.value = '正在验证分享链接...'
    
    const response = await request.get('/api/project/share_info', {
      params: { share_id: shareId.value }
    })
    
    shareInfo.value = response.data
    
    if (shareInfo.value.needPassword) {
      // 需要密码，显示密码输入弹窗
      passwordDialogVisible.value = true
      // 等待DOM更新后聚焦输入框
      setTimeout(() => {
        passwordInput.value?.focus()
      }, 100)
    } else {
      // 不需要密码，直接设置权限
      hasPermission.value = true
    }
  } catch (error: any) {
    console.error('获取分享信息失败:', error)
    errorMessage.value = error.message || '获取分享信息失败，请检查链接是否正确'
  } finally {
    loading.value = false
  }
}

// 验证密码
const verifyPassword = async (password: string) => {
  try {
    const response = await request.post('/api/project/verify_share_password', {
      share_id: shareId.value,
      password: password
    })
    
    if (response.data.code === 0) {
      hasPermission.value = true
      passwordDialogVisible.value = false
      ElMessage.success('密码验证成功')
    } else {
      ElMessage.error(response.data.msg || '密码错误')
    }
  } catch (error: any) {
    console.error('密码验证失败:', error)
    ElMessage.error(error.message || '密码验证失败')
  }
}

// 处理密码提交
const handlePasswordSubmit = async () => {
  if (!passwordFormRef.value) return
  
  try {
    await passwordFormRef.value.validate()
    passwordLoading.value = true
    
    await verifyPassword(passwordFormData.value.password)
  } catch (error) {
    console.error('密码验证失败:', error)
  } finally {
    passwordLoading.value = false
  }
}

// 组件挂载时获取分享信息
onMounted(() => {
  if (!shareId.value) {
    errorMessage.value = '分享链接无效，缺少分享ID'
    loading.value = false
    return
  }
  
  getShareInfo()
})
</script>

<style lang='scss' scoped>
.doc-share {
  display: flex;
  overflow: hidden;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  .share-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: white;
    margin: 20px;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    overflow: hidden;

    .share-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;

      .project-info {
        flex: 1;

        .project-name {
          font-size: 28px;
          font-weight: 600;
          margin: 0 0 8px 0;
          color: white;
        }

        .share-name {
          font-size: 16px;
          margin: 0;
          opacity: 0.9;
        }
      }

      .share-status {
        .el-tag {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
        }
      }
    }

    .share-content {
      flex: 1;
      padding: 40px;
      display: flex;
      align-items: center;
      justify-content: center;

      .content-placeholder {
        text-align: center;
        color: #666;

        h3 {
          margin: 20px 0 10px 0;
          color: #333;
        }

        p {
          margin: 0;
          color: #999;
        }
      }
    }
  }
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  .loading-content {
    text-align: center;
    color: white;
    background: rgba(255, 255, 255, 0.1);
    padding: 40px;
    border-radius: 12px;
    backdrop-filter: blur(10px);

    .loading-icon {
      animation: rotate 2s linear infinite;
      margin-bottom: 20px;
    }

    p {
      margin: 0;
      font-size: 16px;
    }
  }
}

.no-permission {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  .error-content {
    text-align: center;
    color: white;
    background: rgba(255, 255, 255, 0.1);
    padding: 40px;
    border-radius: 12px;
    backdrop-filter: blur(10px);

    h3 {
      margin: 20px 0 10px 0;
      color: white;
    }

    p {
      margin: 0;
      opacity: 0.9;
    }
  }
}

// 密码弹窗样式
.password-dialog-content {
  .password-header {
    text-align: center;
    margin-bottom: 30px;

    h4 {
      margin: 15px 0 8px 0;
      color: #333;
      font-size: 18px;
    }

    p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }
  }

  .password-form {
    .el-form-item {
      margin-bottom: 0;
    }
  }
}

.password-dialog-footer {
  text-align: center;
  
  .el-button {
    min-width: 120px;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .doc-share {
    .share-info {
      margin: 10px;

      .share-header {
        padding: 20px;
        flex-direction: column;
        gap: 15px;

        .project-info {
          .project-name {
            font-size: 24px;
          }
        }
      }

      .share-content {
        padding: 20px;
      }
    }
  }
}
</style>
