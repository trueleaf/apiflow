<template>
  <div v-if="hasPermission" class="doc-share">
    <div class="doc-share-container">
      <SBanner class="doc-share-banner"></SBanner>
      <div class="doc-share-main">
        <SNav></SNav>
        <SContent></SContent>
      </div>
    </div>
  </div>
  <div v-if="loading" class="loading-container">
    <div class="loading-content">
      <div class="loading-circle">
        <el-icon class="loading-icon" :size="32">
          <Loading></Loading>
        </el-icon>
      </div>
      <p class="loading-text">{{ $t('正在验证分享链接') }}</p>
      <div class="loading-dots">
        <span></span><span></span><span></span>
      </div>
      <div class="loading-progress">
        <div class="loading-progress-bar"></div>
      </div>
    </div>
  </div>
  <div v-else class="no-permission">
    <div class="error-content">
      <div class="error-content-inner">
        <img src="@/assets/imgs/logo.png" alt="logo" class="error-logo" />
        <h2 class="mt-0">{{ shareInfo.shareName || $t('文档分享') }}</h2>
        <el-form ref="passwordFormRef" :model="passwordFormData" :rules="passwordRules" class="d-flex j-center" @submit.prevent="handlePasswordSubmit">
          <el-form-item prop="password" class="password-form-item">
            <el-input
              v-model="passwordFormData.password"
              type="password"
              :placeholder="$t('请输入访问密码')"
              class="password-input"
            ></el-input>
            <el-button :loading="passwordLoading" type="success" @click="handlePasswordSubmit">{{ $t('确认密码') }}</el-button>
          </el-form-item>
        </el-form>
        <div v-if="shareInfo.expire" class="mt-2">
          {{ $t('过期倒计时') }}：{{ expireCountdown }}
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

import { request } from './api/api'
import { ElMessage, FormInstance } from 'element-plus'
import { Loading, } from '@element-plus/icons-vue'
import { ApidocVariable, Response } from '@src/types/global'
import { $t } from '@/i18n/i18n'
import { apidocCache } from '@/cache/apidoc'
import { useRoute, useRouter } from 'vue-router'
import { useShareDocStore } from './store/shareDoc'
import SNav from './nav/nav.vue'
import SBanner from './banner/banner.vue'
import SContent from './content/content.vue'

// 分享信息类型定义
interface ShareInfo {
  projectName: string
  shareName: string
  expire: string | null
  needPassword: boolean
}
// SHARE_DATA 类型定义
interface ShareData {
  projectInfo: any
  docs: any[]
}
/*
|--------------------------------------------------------------------------
| 变量定义
|--------------------------------------------------------------------------
*/
// 是否为HTML打包模式 - 可以通过环境变量或构建时注入
const useForHtml = ref(import.meta.env.VITE_USE_FOR_HTML === 'true' || !!(window as any).SHARE_DATA)
const route = useRoute()
const router = useRouter()
const hasPermission = ref(false);
const loading = ref(true);
const shareId = ref(route.query.share_id as string);
const expireCountdown = ref('')
let timer: any = null
// // 分享信息
const shareInfo = ref<ShareInfo>({
  projectName: '',
  shareName: '',
  expire: null,
  needPassword: false
})
// // 密码弹窗相关
const passwordLoading = ref(false)
const passwordFormData = ref({
  password: ''
})
const passwordFormRef = ref<FormInstance>()
const passwordInput = ref<HTMLInputElement>()
const passwordRules = ref({
  password: [
    { required: true, message: $t('请输入访问密码'), trigger: 'blur' }
  ]
})
const shareDocStore = useShareDocStore();

/*
|--------------------------------------------------------------------------
| 初始化数据获取逻辑
|--------------------------------------------------------------------------
*/
// 从 window.SHARE_DATA 获取数据
const getDataFromWindow = () => {
  try {
    const shareData = (window as any).SHARE_DATA as ShareData
    if (shareData && shareData.projectInfo && shareData.docs) {
      // 设置项目信息
      shareInfo.value = {
        projectName: shareData.projectInfo.name || '',
        shareName: shareData.projectInfo.shareName || $t('文档分享'),
        expire: shareData.projectInfo.expire || null,
        needPassword: false // HTML模式下不需要密码验证
      }
      
      // 设置变量数据
      if (shareData.projectInfo.variables) {
        shareDocStore.replaceVariables(shareData.projectInfo.variables)
      }
      
      // 直接设置权限为true
      hasPermission.value = true
      loading.value = false
      
      // 更新URL中的项目名称
      if (shareInfo.value.projectName) {
        const currentRoute = router.currentRoute.value
        const newQuery = { ...currentRoute.query, projectName: shareInfo.value.projectName }
        router.replace({ query: newQuery })
      }
      
      return true
    }
  } catch (error) {
    console.error('从 window.SHARE_DATA 获取数据失败:', error)
  }
  return false
}

// 获取分享信息
const getShareInfo = async () => {
  // 检查是否为HTML模式
  if (useForHtml.value) {
    const success = getDataFromWindow()
    if (success) {
      return
    }
  }
  
  try {
    loading.value = true
    const response = await request.get<Response<ShareInfo>, Response<ShareInfo>>('/api/project/share_info', {
      params: { shareId: shareId.value }
    })
    shareInfo.value = response.data
    
    // 获取到项目名称后，更新URL
    if (shareInfo.value.projectName) {
      const currentRoute = router.currentRoute.value
      const newQuery = { ...currentRoute.query, projectName: shareInfo.value.projectName }
      router.replace({ query: newQuery })
    }
    
    if (shareInfo.value.needPassword) {
      // 检查缓存中是否有密码
      const cachedPassword = apidocCache.getSharePassword(shareId.value)
      if (cachedPassword) {
        // 如果有缓存密码，直接验证
        await verifyPassword(cachedPassword)
      } else {
        // 没有缓存密码，显示密码输入框
        setTimeout(() => {
          passwordInput.value?.focus()
        }, 100)
      }
    } else {
      hasPermission.value = true
    }
  } catch (error: any) {
    console.error( error)
  } finally {
    loading.value = false
  }
}

/*
|--------------------------------------------------------------------------
| 逻辑处理函数
|--------------------------------------------------------------------------
*/
// 验证密码
const verifyPassword = async (password: string) => {
  try {
    const response = await request.post<{ data: ApidocVariable[] }, { data: ApidocVariable[] }>('/api/project/verify_share_password', {
      shareId: shareId.value,
      password: password
    })
    apidocCache.setSharePassword(shareId.value, password)
    hasPermission.value = true;
    shareDocStore.replaceVariables(response.data)
  } catch (error: any) {
    // 网络错误或其他异常，清除缓存中的错误密码
    apidocCache.clearSharePassword(shareId.value)
    console.error($t('密码验证失败'), ':', error)
    ElMessage({
      message: error.message || $t('密码验证失败'),
      grouping: true,
      type: 'error',
    })
  }
}

// 处理密码提交
const handlePasswordSubmit = async () => {
  if (!passwordFormRef.value) return
  
  try {
    await passwordFormRef.value.validate()
    passwordLoading.value = true
    
    // 用户手动输入密码时，先清除缓存中的旧密码
    apidocCache.clearSharePassword(shareId.value)
    await verifyPassword(passwordFormData.value.password)
  } catch (error) {
    console.error($t('密码验证失败'), ':', error)
  } finally {
    passwordLoading.value = false
  }
}

const updateCountdown = () => {
  if (!shareInfo.value.expire) return
  const expire = new Date(shareInfo.value.expire).getTime()
  const now = Date.now()
  let diff = Math.max(0, expire - now)
  if (diff <= 0) {
    expireCountdown.value = $t('已过期')
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
  expireCountdown.value = `${days}${$t('天')}${hours}${$t('小时')}${minutes}${$t('分')}${seconds}${$t('秒')}`
}

/*
|--------------------------------------------------------------------------
| 监听器
|--------------------------------------------------------------------------
*/
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

/*
|--------------------------------------------------------------------------
| 生命周期函数
|--------------------------------------------------------------------------
*/
onMounted(() => {
  getShareInfo()
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style lang='scss' scoped>
.doc-share {
  height: 100vh;
  display: flex;
  
  .doc-share-container {
    display: flex;
    width: 100%;
    height: 100%;
    
    .doc-share-banner {
      flex: 0 0 auto;
    }
    
    .doc-share-main {
      height: 100%;
      flex: 1;
      display: flex;
      flex-direction: column;
      background: var(--gray-100);
    }
  }
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: var(--gray-100);
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(var(--white), 0.7);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow-bg);
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
  box-shadow: var(--box-shadow-base);
  margin-bottom: 24px;
}

.loading-icon {
  animation: rotate 1.2s linear infinite;
  color: var(--primary);
}

.loading-text {
  font-size: 20px;
  font-weight: var(--font-weight-bold);
  color: var(--gray-800);
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
    background: var(--primary);
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
  border-radius: var(--border-radius-xs);
  overflow: hidden;
  margin-top: 8px;
}
.loading-progress-bar {
  width: 40%;
  height: 100%;
  background: linear-gradient(90deg, var(--primary) 0%, var(--purple) 100%);
  border-radius: var(--border-radius-xs);
  animation: loading-bar 1.2s infinite;
}
@keyframes loading-bar {
  0% { margin-left: 0; width: 20%; }
  50% { margin-left: 40%; width: 60%; }
  100% { margin-left: 80%; width: 20%; }
}

.no-permission {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  height: 100vh;
  background: var(--gray-100);

  .error-content {
    margin-top: 20vh;
    text-align: center;
    background: var(--white);
    color: var(--gray-800);
    box-shadow: var(--box-shadow-base);
    padding: 40px 0;
    border-radius: var(--border-radius-bg);
    min-width: 400px;

    .error-content-inner {
      text-align: center;
    }

    .error-logo {
      width: 120px;
      height: 120px;
      margin-bottom: 20px;
    }

    .password-form-item {
      margin-bottom: 0;
    }

    .password-input {
      width: 180px;
    }

    h3 {
      margin: 20px 0 10px 0;
      margin: 20px 0 10px 0;
      color: var(--gray-800);
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
