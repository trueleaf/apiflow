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
  <div v-else-if="loading" class="loading-container">
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
import { router } from '@/router'
import { request } from '@/api/api'
import { ElMessage, FormInstance } from 'element-plus'
import { Loading, } from '@element-plus/icons-vue'
import { ApidocVariable, Response } from '@src/types/global'
import { $t } from '@/i18n/i18n'
import { apidocCache } from '@/cache/apidoc'
import SNav from './nav/nav.vue'
import SBanner from './banner/banner.vue'
import SContent from './content/content.vue'
import { useShareDocStore } from '@/store/apidoc/shareDoc'

// 分享信息类型定义
interface ShareInfo {
  projectName: string
  shareName: string
  expire: string | null
  needPassword: boolean
}

// 响应式数据
const hasPermission = ref(false);
const loading = ref(true);
const shareId = ref(router.currentRoute.value.query.share_id as string);
const expireCountdown = ref('')
let timer: any = null
// 分享信息
const shareInfo = ref<ShareInfo>({
  projectName: '',
  shareName: '',
  expire: null,
  needPassword: false
})
// 密码弹窗相关
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
// 获取分享信息
const getShareInfo = async () => {
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
// 倒计时逻辑


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
  padding: size(48) size(56) size(40) size(56);
}

.loading-circle {
  width: size(72);
  height: size(72);
  border-radius: 50%;
  background: linear-gradient(135deg, #e0e7ff 0%, #f3f8ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--box-shadow-base);
  margin-bottom: size(24);
}

.loading-icon {
  animation: rotate 1.2s linear infinite;
  color: var(--primary);
}

.loading-text {
  font-size: size(20);
  font-weight: var(--font-weight-bold);
  color: var(--gray-800);
  margin: size(16) 0 size(12) 0;
  letter-spacing: 1px;
}

.loading-dots {
  display: flex;
  gap: size(6);
  margin-bottom: size(18);
  span {
    width: size(8);
    height: size(8);
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
  width: size(120);
  height: size(4);
  background: #e0e7ff;
  border-radius: var(--border-radius-xs);
  overflow: hidden;
  margin-top: size(8);
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
    padding: size(40) 0;
    border-radius: var(--border-radius-bg);
    min-width: size(400);

    .error-content-inner {
      text-align: center;
    }

    .error-logo {
      width: size(120);
      height: size(120);
      margin-bottom: size(20);
    }

    .password-form-item {
      margin-bottom: 0;
    }

    .password-input {
      width: size(180);
    }

    h3 {
      margin: size(20) 0 size(10) 0;
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
