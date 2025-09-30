<template>
  <div v-if="hasPermission || isForHtml" class="doc-share">
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
      <p class="loading-text">{{ t('正在验证分享链接') }}</p>
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
        <h2 class="mt-0">{{ shareProjectInfo.shareName || t('文档分享') }}</h2>
        <el-form ref="passwordFormRef" :model="passwordFormData" :rules="passwordRules" class="d-flex j-center" @submit.prevent="handlePasswordSubmit">
          <el-form-item prop="password" class="password-form-item">
            <el-input
              v-model="passwordFormData.password"
              type="password"
              :placeholder="t('请输入访问密码')"
              class="password-input"
            ></el-input>
            <el-button :loading="passwordLoading" type="success" @click="handlePasswordSubmit">{{ t('确认密码') }}</el-button>
          </el-form-item>
        </el-form>
        <div v-if="shareProjectInfo.expire" class="mt-3">
          {{ t('过期倒计时') }}：{{ expireCountdown }}
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { request } from '@/api/api'
import { FormInstance } from 'element-plus'
import { Loading, } from '@element-plus/icons-vue'
import { ApidocBanner, HttpNode, ApidocVariable, CommonResponse } from '@src/types'
import { httpNodeCache } from '@/cache/http/httpNodeCache'
import { router } from '@/router'
import SBanner from './banner/banner.vue'
import SNav from './nav/nav.vue'
import SContent from './content/content.vue'
import {  LocalShareData, SharedProjectInfo } from '@src/types/types'
import { convertNodesToBannerNodes, getCountdown } from '@/helper/index'
import { useShareStore } from './store'
import localShareDataTest from './testData'
import { useI18n } from 'vue-i18n'
/*
|--------------------------------------------------------------------------
| 变量定义
|--------------------------------------------------------------------------
*/
const { t } = useI18n()

const isForHtml = ref(import.meta.env.VITE_USE_FOR_HTML === 'true');
const shareId = router.currentRoute.value.query?.share_id as string || 'local_share';
const hasPermission = ref(false);
const loading = ref(false); //获取分享信息loading
const expireCountdown = ref('')
let timer: any = null
const passwordLoading = ref(false)
const passwordFormData = ref({
  password: ''
})
const passwordFormRef = ref<FormInstance>()
const passwordRules = ref({
  password: [
    { required: true, message: t('请输入访问密码'), trigger: 'blur' }
  ]
})
const shareStore = useShareStore();
const shareProjectInfo = computed(() => shareStore.project);
const docs = computed(() => shareStore.docs);
const tabs = computed(() => shareStore.tabs);
/*
|--------------------------------------------------------------------------
| 初始化数据获取逻辑
|--------------------------------------------------------------------------
*/
const initShareData = () => {
  if (isForHtml.value) {
    try {
      
      const shareData = process.env.NODE_ENV === 'development' ? localShareDataTest : (window as any).SHARE_DATA as LocalShareData;
      console.log('shareData', shareData);
      if (shareData) {
        // 设置项目基本信息
        shareStore.setProject({
          ...shareData.projectInfo,
        });
        // 设置变量
        if (Array.isArray(shareData.variables)) {
          shareStore.replaceVaribles(shareData.variables);
        }
        // 设置文档
        if (Array.isArray(shareData.nodes)) {
          shareStore.setDocs(shareData.nodes);
        }
        shareStore.setBanner(convertNodesToBannerNodes(shareData.nodes));
        hasPermission.value = true;
      }
    } catch (error) {
      console.error('初始化 SHARE_DATA 失败:', (error as Error).message);
    }
  } else {
    getSharedProjectInfo();
  }
  const tabs = httpNodeCache.getEditTabs();
  if (tabs[shareId]) {
    shareStore.updateAllTabs({
      tabs: tabs[shareId],
      shareId: shareId,
    });
  }
}

const getSharedProjectInfo = async () => {
  loading.value = true;
  try {
    const params = {
      shareId: shareId,
    };
    const res = await request.get<CommonResponse<SharedProjectInfo>, CommonResponse<SharedProjectInfo>>('/api/project/share_info', { params });
    shareStore.setProject(res.data);
    expireCountdown.value = getCountdown(res.data.expire ?? 0);
    if (res.data.needPassword) {
      // 检查是否有缓存的密码
      const cachedPassword = httpNodeCache.getSharePassword(shareId);
      if (cachedPassword) {
        // 自动使用缓存的密码进行验证
        await verifyPassword(cachedPassword);
      } else {
        hasPermission.value = false;
      }
    } else {
      hasPermission.value = true;
    }
    loading.value = false;
  } catch (error) {
    console.error(error)
    // 发生异常时清空密码缓存
    httpNodeCache.clearSharePassword(shareId);
  } finally {
    loading.value = false;
  }
};
const getDocDetail = async (docId: string) => {
  try {
    shareStore.setContentLoading(true);
    const params = {
      docId,
      shareId: shareId,
      password: httpNodeCache.getSharePassword(shareId),
    }
    const res = await request.get<CommonResponse<HttpNode>, CommonResponse<HttpNode>>('/api/project/share_doc_detail', { params });
    shareStore.setActiveDocInfo(res.data);
  } catch (error) {
    console.error(error)
  } finally {
    shareStore.setContentLoading(false);
  }
}
// 验证密码
const verifyPassword = async (password: string) => {
  try {
    passwordLoading.value = true;
    const response = await request.post<{ data: { variables: ApidocVariable[], banner: ApidocBanner[] } }, { data: { variables: ApidocVariable[], banner: ApidocBanner[] } }>('/api/project/verify_share_password', {
      shareId: shareId,
      password: password
    })
    shareStore.replaceVaribles(response.data.variables);
    shareStore.setBanner(response.data.banner);
    httpNodeCache.setSharePassword(shareId, password);
    hasPermission.value = true;
  } catch (error) {
    console.error('缓存密码验证失败:', error);
    // 缓存密码验证失败，清空缓存
    httpNodeCache.clearSharePassword(shareId);
    hasPermission.value = false;
  } finally {
    passwordLoading.value = false;
  }
};

const handlePasswordSubmit = async () => {
  if (!passwordFormRef.value) return;
  await passwordFormRef.value.validate();
  await verifyPassword(passwordFormData.value.password);
};

/*
|--------------------------------------------------------------------------
| 逻辑处理函数
|--------------------------------------------------------------------------
*/
// 监听tabs变化并设置activeDocInfo
watch([() => tabs.value[shareId], () => hasPermission.value],
  () => {
    const sharedTabs = tabs.value[shareId];
    if (!sharedTabs || !hasPermission.value) return;
    const selectedTab = sharedTabs.find(tab => tab.selected);
    if (selectedTab && isForHtml.value) {
      // 查找对应文档
      const doc = docs.value.find(doc => doc._id === selectedTab._id);
      if (doc) {
        shareStore.setActiveDocInfo(doc);
      }
    } else if (selectedTab) {
      getDocDetail(selectedTab._id);
    }
  },
  { immediate: true, deep: true }
);

/*
|--------------------------------------------------------------------------
| 生命周期钩子
|--------------------------------------------------------------------------
*/
onMounted(() => {
  initShareData();
  timer = setInterval(() => {
    if (shareProjectInfo.value.expire) {
      expireCountdown.value = getCountdown(shareProjectInfo.value.expire);
    }
  }, 1000);
});
onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
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
