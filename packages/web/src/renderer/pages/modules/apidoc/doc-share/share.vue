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
      <div class="loading-circle">
        <el-icon class="loading-icon" :size="32">
          <Loading />
        </el-icon>
      </div>
      <p class="loading-text">正在验证分享链接...</p>
      <div class="loading-dots">
        <span></span><span></span><span></span>
      </div>
      <div class="loading-progress">
        <div class="loading-progress-bar"></div>
      </div>
    </div>
  </div>
  <div v-else class="no-permission">
    <div class="error-content" style="background: #fff; color: #333; box-shadow: 0 2px 8px rgba(0,0,0,0.05); padding: 40px 0; border-radius: 12px; min-width: 400px;">
      <div style="text-align: center;">
        <img src="@/assets/imgs/logo.png" alt="logo" style="width: 120px; height: 120px; margin-bottom: 20px;" />
        <h2 class="mt-0">{{ shareInfo.shareName || '文档分享' }}</h2>
        <el-form ref="passwordFormRef" :model="passwordFormData" :rules="passwordRules" class="d-flex j-center">
          <el-form-item prop="password" style="margin-bottom: 0;">
            <el-input
              v-model="passwordFormData.password"
              type="password"
              placeholder="请输入密码"
              style="width: 180px;"
              @keyup.enter="handlePasswordSubmit"
            />
            <el-button :loading="passwordLoading" type="success" @click="handlePasswordSubmit">确认密码</el-button>
          </el-form-item>
        </el-form>
        <div v-if="shareInfo.expire" class="mt-2">
          过期倒计时：{{ expireCountdown }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { router } from '@/router'
import { request } from '@/api/api'
import { ElMessage, FormInstance } from 'element-plus'
import { Document, Loading, } from '@element-plus/icons-vue'
import { Response } from '@src/types/global'

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
    
    const response = await request.get<Response<ShareInfo>, Response<ShareInfo>>('/api/project/share_info', {
      params: { shareId: shareId.value }
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
    const response = await request.post<Response<{ code: number }>, Response<{ code: number }>>('/api/project/verify_share_password', {
      shareId: shareId.value,
      password: password
    })
    if (response.code === 0) {
      hasPermission.value = true
      passwordDialogVisible.value = false
      ElMessage.success('密码验证成功')
    } else {
      ElMessage.error(response.msg || '密码错误')
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

// 倒计时逻辑
const expireCountdown = ref('')
let timer: any = null
function updateCountdown() {
  if (!shareInfo.value.expire) return
  const expire = new Date(shareInfo.value.expire).getTime()
  const now = Date.now()
  let diff = Math.max(0, expire - now)
  if (diff <= 0) {
    expireCountdown.value = '已过期'
    clearInterval(timer)
    return
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  diff -= days * (1000 * 60 * 60 * 24)
  const hours = Math.floor(diff / (1000 * 60 * 60))
  diff -= hours * (1000 * 60 * 60)
  const minutes = Math.floor(diff / (1000 * 60))
  diff -= minutes * (1000 * 60)
  const seconds = Math.floor(diff / 1000)
  expireCountdown.value = `${days}天${hours}小时${minutes}分${seconds}秒`
}
watch(
  () => shareInfo.value.expire,
  (val) => {
    if (val) {
      updateCountdown()
      timer = setInterval(updateCountdown, 1000)
    } else {
      expireCountdown.value = ''
      clearInterval(timer)
    }
  }
)
onUnmounted(() => {
  clearInterval(timer)
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
    border-radius: 12px 0 0 12px;
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
  background: $gray-100;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255,255,255,0.7);
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(80,120,255,0.08);
  padding: 48px 56px 40px 56px;
}

.loading-circle {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e0e7ff 0%, #f3f8ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 12px rgba(80,120,255,0.10);
  margin-bottom: 24px;
}

.loading-icon {
  animation: rotate 1.2s linear infinite;
  color: #6c7eea;
}

.loading-text {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 16px 0 12px 0;
  letter-spacing: 1px;
}

.loading-dots {
  display: flex;
  gap: 6px;
  margin-bottom: 18px;
  span {
    width: 8px;
    height: 8px;
    background: #6c7eea;
    border-radius: 50%;
    display: inline-block;
    opacity: 0.5;
    animation: loading-dot 1.2s infinite;
    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }
}

@keyframes loading-dot {
  0%, 80%, 100% { opacity: 0.5; transform: scale(1);}
  40% { opacity: 1; transform: scale(1.3);}
}

.loading-progress {
  width: 120px;
  height: 4px;
  background: #e0e7ff;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 8px;
}
.loading-progress-bar {
  width: 40%;
  height: 100%;
  background: linear-gradient(90deg, #6c7eea 0%, #764ba2 100%);
  border-radius: 2px;
  animation: loading-bar 1.2s infinite;
}
@keyframes loading-bar {
  0% { margin-left: 0; width: 20%; }
  50% { margin-left: 40%; width: 60%; }
  100% { margin-left: 80%; width: 20%; }
}

.no-permission {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: $gray-100;

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

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
