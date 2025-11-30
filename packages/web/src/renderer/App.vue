<template>
  <NetworkModeBanner />
  <router-view></router-view>
  <AddProjectDialog v-if="dialogVisible" v-model="dialogVisible" @success="handleAddSuccess"></AddProjectDialog>
  <Ai v-if="copilotDialogVisible" v-model:visible="copilotDialogVisible" />
  <LanguageMenu
    :visible="languageMenuVisible"
    :position="languageMenuPosition"
    :current-language="runtimeStore.language"
    @language-select="handleLanguageSelect"
    @close="hideLanguageMenu"
  />
</template>



<script setup lang="ts">
import { config } from '@src/config/config';
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { changeLanguage } from './i18n';
import { useRouter } from 'vue-router';
import AddProjectDialog from '@/pages/home/dialog/addProject/AddProject.vue';
import Ai from '@/pages/ai/Ai.vue';
import { projectCache } from '@/cache/project/projectCache';
import { ElMessageBox, ElMessage } from 'element-plus';
import { useApidocBaseInfo } from './store/apidoc/baseInfoStore';
import { Language } from '@src/types';
import LanguageMenu from '@/components/common/language/Language.vue';
import NetworkModeBanner from '@/components/common/networkMode/NetworkModeBanner.vue';
import type { RuntimeNetworkMode } from '@src/types/runtime';
import { useRuntime } from './store/runtime/runtimeStore.ts';
import { appWorkbenchCache } from '@/cache/appWorkbench/appWorkbenchCache';
import { httpMockLogsCache } from '@/cache/mock/httpMock/httpMockLogsCache';
import type { MockLog } from '@src/types/mockNode';
import { IPC_EVENTS } from '@src/types/ipc';
import type { AnchorRect } from '@src/types/common';
import { useAppSettings } from '@/store/appSettings/appSettingsStore';
import { shortcutManager } from '@/shortcut/index.ts';
import { useCopilotStore } from '@/store/ai/copilotStore';
import { storeToRefs } from 'pinia';
import { useTheme } from '@/hooks/useTheme';

const router = useRouter();
const dialogVisible = ref(false);
const apidocBaseInfoStore = useApidocBaseInfo()
const runtimeStore = useRuntime();
const appSettingsStore = useAppSettings();
const copilotStore = useCopilotStore();
const { copilotDialogVisible } = storeToRefs(copilotStore);
const { t } = useI18n()
// 语言菜单相关状态
const languageMenuVisible = ref(false)
const languageMenuPosition = ref({ x: 0, y: 0, width: 0, height: 0 })

const handleAddSuccess = (data: { projectId: string, projectName: string }) => {
  dialogVisible.value = false;
  window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.contentToTopBar.projectCreated, {
    projectId: data.projectId,
    projectName: data.projectName
  });
  router.push({
    path: '/v1/apidoc/doc-edit',
    query: {
      id: data.projectId,
      name: data.projectName,
      mode: 'edit'
    }
  });
}

/*
|--------------------------------------------------------------------------
| 导航控制处理函数
|--------------------------------------------------------------------------
*/

const handleGoBack = () => {
  // 检查是否可以后退
  if (window.history.length > 1) {
    router.back()
  } else {
    // 如果没有历史记录，跳转到主页
    router.push('/')
  }
}

const handleGoForward = () => {
  // 使用 Vue Router 的前进功能
  router.forward()
}

/*
|--------------------------------------------------------------------------
| 语言菜单处理函数
|--------------------------------------------------------------------------
*/
const showLanguageMenu = (data: { position: any, currentLanguage: string }) => {
  languageMenuPosition.value = data.position
  languageMenuVisible.value = true
}

const hideLanguageMenu = () => {
  languageMenuVisible.value = false
}

const handleLanguageSelect = (language: Language) => {
  runtimeStore.setLanguage(language);
  changeLanguage(language)
  hideLanguageMenu()
  // 发送语言切换事件到主进程
  window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.contentToTopBar.languageChanged, language)
}
// 显示更新确认对话框
const showUpdateConfirm = (data: { version: string; releaseNotes: string }) => {
  ElMessageBox.confirm(
    `${t('发现新版本')} ${data.version}，${t('是否立即下载更新')}？\n\n${data.releaseNotes}`,
    t('发现新版本'),
    {
      confirmButtonText: t('立即下载'),
      cancelButtonText: t('暂不更新'),
      type: 'info',
      showClose: true,
      distinguishCancelAndClose: true
    }
  ).then(() => {
    window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.contentToTopBar.confirmDownloadUpdate)
  }).catch((action: string) => {
    if (action === 'cancel') {
      window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.contentToTopBar.cancelDownloadUpdate)
    }
  })
}
// 显示无更新提示
const showNoUpdateMessage = () => {
  ElMessage({
    message: t('当前已是最新版本'),
    type: 'success',
    duration: 2000
  })
}

const initAppHeaderEvent = () => {
  window.electronAPI?.ipcManager.onMain(IPC_EVENTS.apiflow.rendererToMain.createProject, () => {
    dialogVisible.value = true;
  });
  window.electronAPI?.ipcManager.onMain(IPC_EVENTS.apiflow.rendererToMain.showAiDialog, (payload?: { position?: AnchorRect }) => {
    copilotStore.showCopilotDialog(payload?.position);
  });
  window.electronAPI?.ipcManager.onMain(IPC_EVENTS.apiflow.rendererToMain.changeRoute, (path: string) => {
    router.push(path)
  })
  window.electronAPI?.ipcManager.onMain(IPC_EVENTS.apiflow.topBarToContent.networkModeChanged, (mode: RuntimeNetworkMode) => {
    if (runtimeStore.networkMode !== mode) {
      runtimeStore.setNetworkMode(mode)
    }
  })

  window.electronAPI?.ipcManager.onMain(IPC_EVENTS.apiflow.rendererToMain.goBack, () => {
    handleGoBack()
  })

  window.electronAPI?.ipcManager.onMain(IPC_EVENTS.apiflow.rendererToMain.goForward, () => {
    handleGoForward()
  })

  // 显示语言菜单事件监听
  window.electronAPI?.ipcManager.onMain(IPC_EVENTS.apiflow.topBarToContent.showLanguageMenu, (data: { position: any, currentLanguage: string }) => {
    showLanguageMenu(data)
  })

  // 隐藏语言菜单事件监听
  window.electronAPI?.ipcManager.onMain(IPC_EVENTS.apiflow.topBarToContent.hideLanguageMenu, () => {
    hideLanguageMenu()
  })

  // 监听项目切换事件
  window.electronAPI?.ipcManager.onMain(IPC_EVENTS.apiflow.rendererToMain.changeProject, async (data: { projectId: string, projectName: string }) => {
    let matchedProject = null;
    const projectList = await projectCache.getProjectList();
    matchedProject = projectList.find(p => p._id === data.projectId);

    if (!matchedProject) {
      ElMessageBox.alert(`${data.projectName}${t('已被删除')}`, t('提示'), {
        confirmButtonText: t('确定'),
        showClose: false,
        type: 'error'
      }).then(() => {
        window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.contentToTopBar.projectDeleted, data.projectId)
      })
      return
    }
    if (matchedProject.projectName !== data.projectName) {
      window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.contentToTopBar.projectRenamed, {
        projectId: data.projectId,
        projectName: matchedProject.projectName
      })
    }
    await apidocBaseInfoStore.initProjectBaseInfo({ projectId: data.projectId })
    router.push({
      path: '/v1/apidoc/doc-edit',
      query: {
        id: data.projectId,
        name: matchedProject.projectName,
        mode: 'edit'
      }
    })
  })
  
  // 监听 Header Tabs 更新事件,进行缓存
  window.electronAPI?.ipcManager.onMain(IPC_EVENTS.apiflow.topBarToContent.tabsUpdated, (tabs: any[]) => {
    appWorkbenchCache.setAppWorkbenchHeaderTabs(tabs)
  })

  // 监听 Header 激活 Tab 更新事件,进行缓存
  window.electronAPI?.ipcManager.onMain(IPC_EVENTS.apiflow.topBarToContent.activeTabUpdated, (activeTabId: string) => {
    appWorkbenchCache.setAppWorkbenchHeaderActiveTab(activeTabId)
  })
  // 监听显示更新确认对话框事件
  window.electronAPI?.ipcManager.onMain(IPC_EVENTS.apiflow.topBarToContent.showUpdateConfirm, (data: { version: string; releaseNotes: string }) => {
    showUpdateConfirm(data)
  })
  // 监听显示无更新提示事件
  window.electronAPI?.ipcManager.onMain(IPC_EVENTS.apiflow.topBarToContent.showNoUpdateMessage, () => {
    showNoUpdateMessage()
  })
}

/*
|--------------------------------------------------------------------------
| 初始化 Header Tabs
|--------------------------------------------------------------------------
*/
const initAppHeaderTabs = async () => {
  // 从缓存读取 tabs 和 activeTabId，如果不存在则使用空值
  const tabs = appWorkbenchCache.getAppWorkbenchHeaderTabs() || [];
  const activeTabId = appWorkbenchCache.getAppWorkbenchHeaderActiveTab() || '';
  // 发送给 header.vue，包含当前的语言和网络模式
  window.electronAPI?.ipcManager.sendToMain(
    IPC_EVENTS.apiflow.contentToTopBar.initTabs,
    {
      tabs,
      activeTabId,
      language: runtimeStore.language,
      networkMode: runtimeStore.networkMode
    }
  );
  // 如果没有 activeTabId，跳转到主页
  if (!activeTabId) {
    await router.push('/home');
  }
};

const initWelcom = () => {
  if (!config.isDev) {
    console.log(`
              _ _            _ _           _ _ _ _ _ _ _     _ _      _ _    _ _        _ _
            / _ \\          / _ \\         / _ _ _ _ _ _ \\    \\   \\   /   /   |  |       |  |
            / / \\ \\        / / \\ \\       / /           \\ \\    \\   \\ /   /    |  |       |  |
          / /   \\ \\      / /   \\ \\     | |             | |    \\   /   /     |  |       |  |
          / /     \\ \\    / /     \\ \\    | |             | |     \\ /   /      |  |       |  |
        / /       \\ \\  / /       \\ \\    \\ \\_ _ _ _ _ _/ /       /   /       \\ _|_ _ _ _| _/
        /_/         \\_\\/_/         \\_\\    \\_ _ _ _ _ _ _/       /_ _/         \\ _ _ _ _ _ /

        ${t('基于Vue和Electron的接口文档工具')}

        ${t('GitHub地址')}：https://github.com/trueleaf/apiflow

        ${t('Gitee地址')}：https://gitee.com/wildsell/apiflow

        ${t('最近一次更新')}：${__APP_BUILD_TIME__}
    `)
  }
}
const initLanguage = () => {
  changeLanguage(runtimeStore.language);
}
const initTheme = () => {
  const { initTheme: initThemeFunc } = useTheme();
  initThemeFunc();
}

const initAppTitle = () => {
  document.title = `${config.isDev ? `${config.appConfig.appTitle}(${t('本地')})` : config.appConfig.appTitle}`;
}
// 监听主进程推送的批量 Mock 日志
const initMockLogsListener = () => {
  window.electronAPI?.ipcManager.onMain(IPC_EVENTS.mock.mainToRenderer.logsBatch, async (logs: MockLog[]) => {
    if (!logs || !Array.isArray(logs)) {
      console.error('接收到的日志数据格式错误:', logs);
      return;
    }
    for (const log of logs) {
      await httpMockLogsCache.addLog(log);
    }
  });
}
// 发送 content 就绪信号到主进程
const sendContentReadySignal = () => {
  window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.contentToTopBar.contentReady);
}
const initAppHeader = () => {
  // 等待 topBar 就绪后再初始化和绑定事件
  window.electronAPI?.ipcManager.onMain(IPC_EVENTS.apiflow.rendererToMain.topBarIsReady, async () => {
    initAppHeaderEvent();
    await router.isReady();
    await initAppHeaderTabs();
    watch(
      () => ({
        path: router.currentRoute.value.path,
        query: router.currentRoute.value.query
      }),
      (newRoute) => {
        if (newRoute.path === '/v1/apidoc/doc-edit') {
          const projectId = newRoute.query.id as string;
          const projectName = newRoute.query.name as string;
          if (projectId && projectName) {
            window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.contentToTopBar.projectChanged, {
              projectId: projectId,
              projectName: projectName
            })
          }
        } else if (newRoute.path === '/home') {
          window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.contentToTopBar.navigateToHome)
        }
      },
      { immediate: true, deep: true }
    );

    // 监听网络模式变化
    watch(() => runtimeStore.networkMode, async (mode, prevMode) => {
      if (mode === prevMode) {
        return
      }
      if (router.currentRoute.value.path !== '/home') {
        await router.push('/home')
      }
      window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.rendererToMain.refreshContentView)
    });
  });
}

watch(
  () => appSettingsStore.appTitle,
  (newTitle) => {
    document.title = newTitle
  },
  { immediate: true }
)

onMounted(() => {
  initWelcom();
  initLanguage();
  initTheme();
  initAppTitle();
  initMockLogsListener();
  sendContentReadySignal();
  initAppHeader();

  shortcutManager.initAppShortcuts();
})
</script>

<style lang='scss'>
#app {
  width: 100%;
  height: 100%;
}
</style>
