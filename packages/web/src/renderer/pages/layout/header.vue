<template>
  <div class="s-header">
    <div class="ml-5 header-left">
      <span class="flex0 mr-5 gray-200 cursor-pointer" @click="jumpToHome">
        <span>{{ config.localization.title }}</span>
        <span v-if="config.isDev">(本地)</span>
      </span>
    </div>
    <div class="header-right ml-auto">
      <div class="operation">
        <div :title="$t('返回首页')" class="op_item" @click="jumpToHome">
          <el-icon :size="16">
            <i class="iconfont iconhome"></i>
          </el-icon>
        </div>
        <div :title="$t('刷新')" class="op_item" @click="freshPage">
          <el-icon :size="16">
            <RefreshRight />
          </el-icon>
        </div>
        <div :title="$t('后退')" class="op_item" @click="goBack">
          <el-icon :size="16">
            <Back />
          </el-icon>
        </div>
        <div :title="$t('前进')" class="op_item" @click="goForward">
          <el-icon :size="16">
            <Right />
          </el-icon>
        </div>
        <el-dropdown>
          <span class="iconfont iconyuyan language"></span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="changeLocale('zh-cn')">中文简体</el-dropdown-item>
              <el-dropdown-item @click="changeLocale('zh-tw')">中文繁體</el-dropdown-item>
              <el-dropdown-item @click="changeLocale('en')">English</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <div title="debug" class="op_item" @click="handleOpenDevTools">
          <el-icon :size="16">
            <i class="iconfont icondebug"></i>
          </el-icon>
        </div>
        <div v-if="downloading" class="process">
          <span v-if="progress !== 100" :title="$t('更新进度')">{{ progress.toFixed(1) }}%</span>
          <span v-else class="cursor-pointer yellow" @click="handleInstall">{{ $t('安装') }}</span>
        </div>
        <el-dropdown class="ml-5" @command="handleClickDropdown">
          <span class="d-flex a-center cursor-pointer">
            <span>{{ userInfo.realName || userInfo.loginName }}</span>
            <el-icon :size="16" class="ml-1">
              <ArrowDown />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="user-setting">
                <el-button text>{{ $t('个人中心') }}</el-button>
              </el-dropdown-item>
              <el-dropdown-item v-if="isElectron()" :disabled="downloading" command="update">
                <el-button text>{{ $t('检查更新')}}</el-button>
              </el-dropdown-item>
              <el-dropdown-item command="version">
                <el-button text>{{ $t('版本') }}</el-button>
              </el-dropdown-item>
              <el-dropdown-item command="clear-cache">
                <el-button text :loading="clearCacheLoading">{{ $t('清除所有缓存') }}</el-button>
              </el-dropdown-item>
              <el-dropdown-item command="logout">
                <el-button text>{{ $t('退出登录') }}</el-button>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <div class="window-controls">
        <div class="control-button" @click="minimizeWindow">
          <el-icon :size="16">
            <Minus />
          </el-icon>
        </div>
        <div v-if="windowState === 'normal'" class="control-button" @click="maximizeWindow">
          <el-icon :size="16">
            <i class="iconfont iconmaxScreen"></i>
          </el-icon>
        </div>
        <div v-if="windowState === 'maximized'" class="control-button" @click="unmaximizeWindow">
          <el-icon :size="16">
            <i class="iconfont iconminiScreen"></i>
          </el-icon>
        </div>
        <div class="control-button close" @click="closeWindow">
          <el-icon :size="16">
            <Close />
          </el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { usePermissionStore } from '@/store/permission';
import { RefreshRight, Back, Right, ArrowDown, Minus, Close } from '@element-plus/icons-vue'
import { deleteDB } from 'idb';
import { useRouter } from 'vue-router';
import i18next from 'i18next';
import { useTranslation } from 'i18next-vue';
import type { Language } from '@src/types/global'
import { computed, onMounted, ref } from 'vue';
import { config } from '@/../config/config'
import { isElectron } from '@/utils/utils';
import 'element-plus/es/components/message-box/style/css';
import { ElMessageBox } from 'element-plus';
import { apidocCache } from '@/cache/apidoc';

const router = useRouter();
const permissionStore = usePermissionStore();
const { t } = useTranslation();
const userInfo = computed(() => permissionStore.userInfo);
const clearCacheLoading = ref(false);
const windowState = ref<'normal' | 'minimized' | 'maximized'>('maximized');

// 窗口控制函数
const minimizeWindow = () => {
  console.log('minimizeWindow')
  window.electronAPI?.minimize();
};

const maximizeWindow = () => {
  window.electronAPI?.maximize();
};

const unmaximizeWindow = () => {
  window.electronAPI?.unmaximize();
};

const closeWindow = () => {
  window.electronAPI?.close();
};

//辅助操作按钮(electron不具备浏览器前进、后退、刷新)
const handleOpenDevTools = () => {
  window.electronAPI?.openDevTools();
};
const goBack = () => router.back()
const goForward = () => router.forward();
const freshPage = () => window.location.reload();
const jumpToHome = () => router.push('/v1/apidoc/doc-list');
const jumpToUserSetting = () => router.push('/user-center');
const logout = () => {
  permissionStore.clearAllPermission()
  sessionStorage.clear();
  router.push('/login');
};
//国际化
const changeLocale = (language: Language) => {
  i18next.changeLanguage(language);
}

/*
|--------------------------------------------------------------------------
| 下载相关逻辑
|--------------------------------------------------------------------------
*/
const progress = ref(0);
const downloading = ref(false);
const isManual = ref(false);

const handleClickDropdown = (command: string) => {
  switch (command) {
    case 'logout':
      logout();
      break;
    case 'user-setting':
      jumpToUserSetting();
      break;
    case 'update':
      handleCheckUpdate(true);
      break;
    case 'clear-cache':
      clearAllCache();
      break;
    default:
      break;
  }
}
//安装更新
const handleInstall = () => {
  if (isElectron()) {
    // ipcRenderer.send('vue-quit-and-install');
  }
}
//检查更新
const handleCheckUpdate = (manual = false) => {
  downloading.value = true;
  isManual.value = manual;
  if (isElectron()) {
    // ipcRenderer.send('vue-check-update');
  }
}
//清空缓存
const clearAllCache = () => {
  ElMessageBox.confirm(t('此操作将清空所有本地缓存, 是否继续?'), t('提示'), {
    confirmButtonText: t('确定'),
    cancelButtonText: t('取消'),
    type: 'warning',
    beforeClose: async (action, instance, done) => {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true;
        instance.confirmButtonText = t('执行中...');
        clearCacheLoading.value = true;
        //移除serviceworker
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then((registrations) => {
            registrations.forEach(registration => {
              console.log(registration.unregister())
            })
          })
        }
        //移除本地存储
        localStorage.clear();
        sessionStorage.clear();
        //清空indexedDB
        if (apidocCache.responseCacheDb) {
          apidocCache.responseCacheDb.close()
          deleteDB(config.cacheConfig.apiflowResponseCache.dbName);
        }
        clearCacheLoading.value = false;
        done()
        //刷新页面
        router.replace('/login');
        setTimeout(() => {
          freshPage()
        })
      } else {
        done()
      }
    }
  }).then(async () => {
    
  }).catch((err: Error | 'cancel' | 'close') => {
    if (err === 'cancel' || err === 'close') {
      return;
    }
    console.error(err);
  });
}

onMounted(() => {
  if (config.updateConfig.autoUpdate) {
    handleCheckUpdate();
  }
  window.electronAPI?.onWindowResize((state) => {
    windowState.value = state;
  })
})
</script>

<style lang='scss' scoped>
.s-header {
  height: var(--apiflow-header-height);
  display: flex;
  background: linear-gradient(to right, #2c3e50, #3a4a5f);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  -webkit-app-region: drag; // 添加拖拽区域

  .header-left {
    display: flex;
    align-items: center;
    flex: 1;
    height: 100%;

    .el-menu {
      flex: 1;
    }
  }

  .header-right {
    height: 100%;
    display: flex;
    align-items: center;
    color: var(--white);

    .operation {
      margin-right: 10px;
      display: flex;
      height: 100%;
      align-items: center;
      -webkit-app-region: no-drag; // 操作区域不可拖拽

      .op_item {
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 20px;
        border-radius: 50%;

        &:hover {
          background: var(--gray-600);
        }
      }

      .language {
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 16px;
        border-radius: 50%;

        &:hover {
          background: var(--gray-600);
        }
      }
    }

    .window-controls {
      display: flex;
      align-items: center;
      margin-left: 10px;
      -webkit-app-region: no-drag; // 添加这个确保窗口控制按钮可以点击
      
      .control-button {
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        
        &:hover {
          background: var(--gray-600);
        }

        &.close:hover {
          background: #e81123;
        }
      }
    }

    .process {
      margin-right: 10px;
    }
  }

  .el-dropdown {
    color: var(--white);
  }
}
</style>
