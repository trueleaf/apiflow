<template>
  <div class="s-content">
    <div class="s-header">
      <div class="ml-5 header-left">
        <span class="flex0 f-lg mr-5 gray-200 cursor-pointer" @click="jumpToHome">
          <span>{{ config.localization.title }}</span>
          <span v-if="config.isDev">(本地)</span>
        </span>
        <el-menu :default-active="activeMenuPath" mode="horizontal" background-color="#343a40" text-color="#fff"
          active-text-color="#ffd04b" :router="true">
          <el-menu-item v-for="(item) in menus" :key="item.path" :index="item.path">
            {{ t(item.name) }}
          </el-menu-item>
        </el-menu>
      </div>
      <div class="header-right mr-5 ml-auto">
        <div class="operation">
          <div :title="t('返回首页')" class="op_item" @click="jumpToHome">
            <el-icon :size="20">
              <i class="iconfont iconhome"></i>
            </el-icon>
          </div>
          <div :title="t('刷新')" class="op_item" @click="freshPage">
            <el-icon :size="20">
              <RefreshRight />
            </el-icon>
          </div>
          <div :title="t('后退')" class="op_item" @click="goBack">
            <el-icon :size="20">
              <Back />
            </el-icon>
          </div>
          <div :title="t('前进')" class="op_item" @click="goForward">
            <el-icon :size="20">
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
            <el-icon :size="20">
              <i class="iconfont icondebug"></i>
            </el-icon>
          </div>
        </div>
        <div v-if="downloading" class="process">
          <span v-if="progress !== 100" :title="t('更新进度')">{{ progress.toFixed(1) }}%</span>
          <span v-else class="cursor-pointer yellow" @click="handleInstall">{{ t('安装') }}</span>
        </div>
        <el-dropdown @command="handleClickDropdown">
          <span class="d-flex a-center cursor-pointer">
            <span>{{ userInfo.realName || userInfo.loginName }}</span>
            <el-icon :size="16" class="ml-1">
              <ArrowDown />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="user-setting">{{ t('个人中心') }}</el-dropdown-item>
              <el-dropdown-item v-if="isElectron()" :disabled="downloading" command="update">{{ t('检查更新')
                }}</el-dropdown-item>
              <el-dropdown-item command="version">{{ t('版本') }}</el-dropdown-item>
              <el-dropdown-item command="clear-cache">{{ t('清除所有缓存') }}</el-dropdown-item>
              <el-dropdown-item command="logout">{{ t('退出登录') }}</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <div class="page-wrap">
      <router-view></router-view>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { usePermissionStore } from '@/store/permission';
import { RefreshRight, Back, Right, ArrowDown } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router';
import i18next, { t } from 'i18next';
import type { Language } from '@src/types/global'
import { computed, onMounted, ref } from 'vue';
import { config } from '@/../config/config'
import { isElectron } from '@/utils/utils';
import 'element-plus/es/components/message-box/style/css';
import { ElMessageBox } from 'element-plus';

const router = useRouter();
const permissionStore = usePermissionStore();
const activeMenuPath = ref('');
const menus = computed(() => permissionStore.menus);
const userInfo = computed(() => permissionStore.userInfo);
//辅助操作按钮(electron不具备浏览器前进、后退、刷新)
const handleOpenDevTools = () => {
  window.electronAPI?.openDevTools();
};
const goBack = () => router.back()
const goForward = () => router.forward();
const freshPage = () => window.location.reload();
const jumpToHome = () => router.push('/v1/apidoc/doc-list');
const jumpToUserSetting = () => router.push('/v1/settings/user');
const logout = () => {
  permissionStore.clearAllPermission()
  sessionStorage.clear();
  router.push('/login');
};
//国际化
const changeLocale = (language: Language) => {
  i18next.changeLanguage(language);
  // changeLanguage(language);
}

/*
|--------------------------------------------------------------------------
| 下载相关逻辑
|--------------------------------------------------------------------------
*/
const progress = ref(0);
const downloading = ref(false);
const isManual = ref(false);
//初始化自动更新相关事件
const initUploadEvent = () => {
  if (isElectron()) {
    //存在可用更新
    // ipcRenderer.on('vue-update-available', () => {
    //   console.log('存在可用更新');
    // });
    //没有可用更新
    // ipcRenderer.on('vue-update-not-available', () => {
    //   console.log(`${t('没有可用更新')}`);
    //   downloading = false;
    //   if (isManual) {
    //     $message.warning(`${t('暂无可用更新')}`);
    //   }
    // });
    //下载中
    // ipcRenderer.on('vue-download-progress', (e, progressObj) => {
    //   console.log(`${t('下载中')}`, e, progressObj);
    //   downloading = true;
    //   progress = progressObj.percent;
    // });
    //下载完成
    // ipcRenderer.on('vue-update-downloaded', (e, upload) => {
    //   progress = 100;
    //   console.log(`${t('下载完成')}`, e, upload);
    // });
    // ipcRenderer.on('vue-download-error', (e, error) => {
    //   if (isManual) {
    //     $message.warning(`${t('更新异常请稍后再试')}`);
    //   }
    //   downloading = false;
    //   console.error(error);
    // });
  }
}
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
    type: 'warning'
  }).then(() => {
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
    indexedDB.deleteDatabase(config.renderConfig.indexedDB.dbName)
    //刷新页面
    router.replace('/login')
  }).catch((err: Error | 'cancel' | 'close') => {
    if (err === 'cancel' || err === 'close') {
      return;
    }
    console.error(err);
  });
}
/*
|--------------------------------------------------------------------------
| 生命周期
|--------------------------------------------------------------------------
|
*/
onMounted(() => {
  activeMenuPath.value = router.currentRoute.value.path;
  initUploadEvent();
  if (config.updateConfig.autoUpdate) {
    handleCheckUpdate();
  }
})

</script>

<style lang='scss' scoped>
.s-content {
  width: 100%;
  height: 100%;

  .s-header {
    background: $gray-800;
    height: 60px;
    display: flex;

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
      color: $white;

      .operation {
        margin-right: size(10);
        display: flex;
        height: 100%;
        align-items: center;

        .op_item {
          width: size(30);
          height: size(30);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: size(20);
          border-radius: 50%;

          &:hover {
            background: $gray-600;
          }
        }

        .language {
          width: size(30);
          height: size(30);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: size(16);
          border-radius: 50%;

          &:hover {
            background: $gray-600;
          }
        }
      }

      .process {
        margin-right: size(10);
      }
    }

    .el-dropdown {
      color: $white;
    }
  }

  .page-wrap {
    overflow-y: auto;
    height: calc(100vh - #{size(60)});
  }
}
</style>
