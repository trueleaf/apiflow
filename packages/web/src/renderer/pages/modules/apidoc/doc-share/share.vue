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
  <SLoading v-if="loading" :loading="loading" class="loading-container">
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
  </SLoading>
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
import SBanner from './banner/banner.vue'
import SNav from './nav/nav.vue'
import SContent from './content/content.vue'
import { SharedProjectInfo } from '@src/types/types'
import { LocalShareData } from '@src/types/types'
import SLoading from '@/components/common/loading/g-loading.vue'
import { getCountdown } from '@/helper/index'
import { useShareStore } from './store'
/*
|--------------------------------------------------------------------------
| 变量定义
|--------------------------------------------------------------------------
*/
const isForHtml = ref(import.meta.env.VITE_USE_FOR_HTML === 'true');
const route = useRoute();
const router = useRouter();
const shareId = ref(route.query.share_id as string);
const hasPermission = ref(false);
const loading = ref(true); //获取分享信息loading
const expireCountdown = ref('')
let timer: any = null
const shareInfo = ref<SharedProjectInfo>({
  projectName: '',
  shareName: '',
  expire: null,
  needPassword: false
})
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
const shareStore = useShareStore();

/*
|--------------------------------------------------------------------------
| 初始化数据获取逻辑
|--------------------------------------------------------------------------
*/
const initShareData = () => {
  if (isForHtml.value) {
    try {
      const shareData = (window as any).SHARE_DATA as LocalShareData;
      if (shareData) {
        // 设置项目基本信息
        shareStore.setProject({
          ...shareData.projectInfo,
          shareName: $t('文档分享'),
        });
        // 设置变量
        if (Array.isArray(shareData.variables)) {
          shareStore.replaceVaribles(shareData.variables);
        }
        // 设置文档
        if (Array.isArray(shareData.nodes)) {
          shareStore.setDocs(shareData.nodes);
        }
      }
    } catch (error) {
      console.error('初始化 window.SHARE_DATA 失败:', error);
    }
  } else {
    getSharedProjectInfo();
  }
}

const getSharedProjectInfo = async () => {
  loading.value = true;
  try {
    const params = {
      shareId: shareId.value,
      // password: passwordFormData.value.password, // 如有密码校验需求可加上
    };
    const res = await request.get('/api/project/export/share_project_info', { params });
    if (res.code === 0) {
      // 设置项目信息
      shareStore.setProject({
        projectName: res.data.projectName,
        shareName: res.data.shareName || $t('文档分享'),
        expire: res.data.expire,
        needPassword: res.data.needPassword,
      });
      // 设置变量
      if (Array.isArray(res.data.variables)) {
        shareStore.replaceVaribles(res.data.variables);
      }
      // 设置文档
      if (Array.isArray(res.data.nodes)) {
        shareStore.setDocs(res.data.nodes);
      }
      hasPermission.value = true;
    } else if (res.code === 1023) {
      // 密码错误等特殊处理
      hasPermission.value = false;
      ElMessage.error($t('密码错误'));
    } else {
      hasPermission.value = false;
      ElMessage.error(res.msg || $t('获取分享信息失败'));
    }
  } catch (err) {
    hasPermission.value = false;
    ElMessage.error($t('获取分享信息失败'));
  } finally {
    loading.value = false;
  }
};

/*
|--------------------------------------------------------------------------
| 生命周期钩子
|--------------------------------------------------------------------------
*/
onMounted(() => {
  initShareData();
});

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
