<template>
  <div class="app-layout">
    <!-- 浏览器环境：单视图架构，内嵌 Header -->
    <BrowserHeader v-if="!isElectronEnv" ref="browserHeaderRef" @create-project="handleBrowserCreateProject" />
    <div class="app-main">
      <NetworkModeBanner />
      <div class="app-content">
        <router-view></router-view>
      </div>
    </div>
    <AddProjectDialog v-if="dialogVisible" v-model="dialogVisible" @success="handleAddSuccess"></AddProjectDialog>
    <Ai v-show="agentViewDialogVisible" />
    <!-- Electron 环境：语言菜单由 IPC 控制显示 -->
    <LanguageMenu v-if="isElectronEnv" :visible="languageMenuVisible" :position="languageMenuPosition"
      :current-language="runtimeStore.language" @language-select="handleLanguageSelect" @close="hideLanguageMenu" />
    <UserMenu v-if="isElectronEnv" :visible="userMenuVisible" :position="userMenuPosition" @logout="handleLogout"
      @close="hideUserMenu" />
    <HeaderTabContextmenu
      v-if="isElectronEnv"
      :visible="headerTabContextmenuVisible"
      :position="headerTabContextmenuPosition"
      :has-left="headerTabContextmenuHasLeft"
      :has-right="headerTabContextmenuHasRight"
      :has-other="headerTabContextmenuHasOther"
      :has-any="headerTabContextmenuHasAny"
      @action="handleHeaderTabContextAction"
      @close="hideHeaderTabContextmenu"
    />
  </div>
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
import { request } from '@/api/api';
import { ElMessageBox, ElMessage } from 'element-plus';
import { useProjectWorkbench } from './store/projectWorkbench/projectWorkbenchStore';
import type { ApidocProjectInfo, ApidocProjectListInfo, CommonResponse } from '@src/types';
import { Language } from '@src/types';
import LanguageMenu from '@/components/common/language/Language.vue';
import UserMenu from '@/components/common/userMenu/UserMenu.vue'
import HeaderTabContextmenu from '@/components/common/headerTabContextmenu/HeaderTabContextmenu.vue'
import NetworkModeBanner from '@/components/common/networkMode/NetworkModeBanner.vue';
import BrowserHeader from '@/components/common/browserHeader/BrowserHeader.vue';
import type { RuntimeNetworkMode } from '@src/types/runtime';
import { useRuntime } from './store/runtime/runtimeStore.ts';
import type { AnchorRect } from '@src/types/common'
import type { AppWorkbenchHeaderTabContextAction, AppWorkbenchHeaderTabContextmenuData } from '@src/types/appWorkbench/appWorkbenchType'
import { appWorkbenchCache } from '@/cache/appWorkbench/appWorkbenchCache';
import { httpMockLogsCache } from '@/cache/mock/httpMock/httpMockLogsCache';
import type { MockLog } from '@src/types/mockNode';
import { IPC_EVENTS } from '@src/types/ipc';
import { useAppSettings } from '@/store/appSettings/appSettingsStore';
import { shortcutManager } from '@/shortcut/index.ts';
import { useAgentViewStore } from '@/store/ai/agentView';
import { useLLMClientStore } from '@/store/ai/llmClientStore';
import { storeToRefs } from 'pinia';
import { useTheme } from '@/hooks/useTheme';
import { isElectron } from '@/helper';

const router = useRouter();
const dialogVisible = ref(false);
const projectWorkbenchStore = useProjectWorkbench()
const runtimeStore = useRuntime();
const appSettingsStore = useAppSettings();
const agentViewStore = useAgentViewStore();
const llmClientStore = useLLMClientStore();
const { agentViewDialogVisible } = storeToRefs(agentViewStore);
const { t } = useI18n()
// 平台环境检测
const isElectronEnv = isElectron()
// 浏览器 Header 引用
const browserHeaderRef = ref<InstanceType<typeof BrowserHeader> | null>(null)
// 语言菜单相关状态（仅 Electron 环境使用）
const languageMenuVisible = ref(false)
const languageMenuPosition = ref({ x: 0, y: 0, width: 0, height: 0 })
const userMenuVisible = ref(false)
const userMenuPosition = ref<AnchorRect>({ x: 0, y: 0, width: 0, height: 0 })
const headerTabContextmenuVisible = ref(false)
const headerTabContextmenuPosition = ref<AnchorRect>({ x: 0, y: 0, width: 0, height: 0 })
const headerTabContextmenuTabId = ref('')
const headerTabContextmenuHasLeft = ref(false)
const headerTabContextmenuHasRight = ref(false)
const headerTabContextmenuHasOther = ref(false)
const headerTabContextmenuHasAny = ref(false)

const handleAddSuccess = (data: { projectId: string, projectName: string }) => {
  dialogVisible.value = false;
  // Electron 环境：通过 IPC 通知 Header
  if (isElectronEnv) {
    window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.contentToTopBar.projectCreated, {
      projectId: data.projectId,
      projectName: data.projectName
    });
  } else {
    // 浏览器环境：直接调用 BrowserHeader 方法
    browserHeaderRef.value?.addProjectTab(data.projectId, data.projectName)
  }
  router.push({
    path: '/workbench',
    query: {
      id: data.projectId,
      name: data.projectName,
      mode: 'edit'
    }
  });
}
// 浏览器环境：处理 Header 创建项目事件
const handleBrowserCreateProject = () => {
  dialogVisible.value = true
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
  router.forward()
}

/*
|--------------------------------------------------------------------------
| 语言菜单处理函数
|--------------------------------------------------------------------------
*/
const showLanguageMenu = (data: { position: any, currentLanguage: string }) => {
  headerTabContextmenuVisible.value = false
  languageMenuPosition.value = data.position
  languageMenuVisible.value = true
}

const hideLanguageMenu = () => {
  languageMenuVisible.value = false
}

const showUserMenu = (data: { position: AnchorRect }) => {
  headerTabContextmenuVisible.value = false
  userMenuPosition.value = data.position
  userMenuVisible.value = true
}

const hideUserMenu = () => {
  userMenuVisible.value = false
}

const showHeaderTabContextmenu = (data: AppWorkbenchHeaderTabContextmenuData) => {
  languageMenuVisible.value = false
  userMenuVisible.value = false
  headerTabContextmenuPosition.value = data.position
  headerTabContextmenuTabId.value = data.tabId
  headerTabContextmenuHasLeft.value = data.hasLeft
  headerTabContextmenuHasRight.value = data.hasRight
  headerTabContextmenuHasOther.value = data.hasOther
  headerTabContextmenuHasAny.value = data.hasAny
  headerTabContextmenuVisible.value = true
}
const hideHeaderTabContextmenu = () => {
  headerTabContextmenuVisible.value = false
}
const handleHeaderTabContextAction = (action: AppWorkbenchHeaderTabContextAction) => {
  if (!headerTabContextmenuTabId.value) return
  window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.contentToTopBar.headerTabContextAction, {
    action,
    tabId: headerTabContextmenuTabId.value
  })
}

const handleLogout = () => {
  runtimeStore.clearUserInfo()
  hideUserMenu()
  window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.contentToTopBar.userInfoChanged, { id: '', loginName: '', role: 'user', token: '', avatar: '' })
  router.push('/login')
}

const handleLanguageSelect = (language: Language) => {
  runtimeStore.setLanguage(language);
  changeLanguage(language)
  hideLanguageMenu()
  // 发送语言切换事件到主进程
  window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.contentToTopBar.languageChanged, language)
}

const initAppHeaderEvent = () => {
  window.electronAPI?.ipcManager.onMain(IPC_EVENTS.apiflow.rendererToMain.createProject, () => {
    dialogVisible.value = true;
  });
  window.electronAPI?.ipcManager.onMain(IPC_EVENTS.apiflow.rendererToMain.showAiDialog, () => {
    agentViewStore.showAgentViewDialog();
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

  // 显示用户菜单事件监听
  window.electronAPI?.ipcManager.onMain(IPC_EVENTS.apiflow.topBarToContent.showUserMenu, (data: { position: AnchorRect }) => {
    showUserMenu(data)
  })

  // 隐藏用户菜单事件监听
  window.electronAPI?.ipcManager.onMain(IPC_EVENTS.apiflow.topBarToContent.hideUserMenu, () => {
    hideUserMenu()
  })

  window.electronAPI?.ipcManager.onMain(IPC_EVENTS.apiflow.topBarToContent.showHeaderTabContextmenu, (data: AppWorkbenchHeaderTabContextmenuData) => {
    showHeaderTabContextmenu(data)
  })

  window.electronAPI?.ipcManager.onMain(IPC_EVENTS.apiflow.topBarToContent.hideHeaderTabContextmenu, () => {
    hideHeaderTabContextmenu()
  })

  // 监听项目切换事件
  window.electronAPI?.ipcManager.onMain(IPC_EVENTS.apiflow.rendererToMain.changeProject, async (data: { projectId: string, projectName: string }) => {
    let matchedProject: ApidocProjectInfo | null = null;

    if (runtimeStore.networkMode === 'offline') {
      const projectList = await projectCache.getProjectList();
      matchedProject = projectList.find(p => p._id === data.projectId) || null;
    } else {
      try {
        const res = await request.get<CommonResponse<ApidocProjectListInfo>, CommonResponse<ApidocProjectListInfo>>('/api/project/project_list');
        matchedProject = res.data.list.find(p => p._id === data.projectId) || null;
      } catch {
        ElMessage({
          message: t('加载失败请重试'),
          grouping: true,
          type: 'error'
        })
        return
      }
    }

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
    await projectWorkbenchStore.initProjectBaseInfo({ projectId: data.projectId })
    router.push({
      path: '/workbench',
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
}

/*
|--------------------------------------------------------------------------
| 初始化 Header Tabs
|--------------------------------------------------------------------------
*/
const initAppHeaderTabs = async () => {
  // 从缓存读取 tabs 和 activeTabId，如果不存在则使用空值
  const tabs = appWorkbenchCache.getAppWorkbenchHeaderTabs() || [];
  const cachedActiveTabId = appWorkbenchCache.getAppWorkbenchHeaderActiveTab() || ''
  const activeTabId = !cachedActiveTabId && router.currentRoute.value.path === '/admin'
    ? '__admin__'
    : cachedActiveTabId
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
    console.log(
      '%cApiflow',
      `
  color: #00c6ff;
  font-size: 48px;
  font-weight: bold;
  text-shadow:
    1px 1px 0 #000,
    2px 2px 0 #333,
    3px 3px 0 #666;
  `
    );
    console.log(`
        ${t('官网地址')}：https://apiflow.cn

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
// 监听主进程推送的批量 Mock 日志（仅 Electron 环境）
const initMockLogsListener = () => {
  if (!isElectronEnv) return
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
// 发送 content 就绪信号到主进程（仅 Electron 环境）
const sendContentReadySignal = () => {
  if (!isElectronEnv) return
  window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.contentToTopBar.contentReady);
  // 初始化窗口图标（从缓存读取自定义 Logo）
  const cachedLogo = appSettingsStore.appLogo
  if (cachedLogo) {
    window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.rendererToMain.setWindowIcon, cachedLogo)
  }
}
// 初始化浏览器环境
const initBrowserEnv = async () => {
  await router.isReady()
  // 从缓存读取上次的路由状态
  const cachedActiveTabId = appWorkbenchCache.getAppWorkbenchHeaderActiveTab()  
  if (!cachedActiveTabId && router.currentRoute.value.path !== '/admin') {
    await router.push('/home')
  }
  // 监听网络模式变化
  watch(() => runtimeStore.networkMode, async (mode, prevMode) => {
    if (mode === prevMode) return
    if (router.currentRoute.value.path !== '/home') {
      await router.push('/home')
    }
  })
}
// 初始化 Electron Header 通信（仅 Electron 环境）
const initAppHeader = () => {
  if (!isElectronEnv) return
  // 等待 topBar 就绪后再初始化和绑定事件
  window.electronAPI?.ipcManager.onMain(IPC_EVENTS.apiflow.rendererToMain.topBarIsReady, async () => {
    initAppHeaderEvent();
    await router.isReady();
    await initAppHeaderTabs();
    // 主动推送应用设置给 topBarView，确保刷新后 topBarView 能获取最新设置
    window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.contentToTopBar.appSettingsChanged, {
      appTitle: appSettingsStore.appTitle,
      appLogo: appSettingsStore.appLogo,
      appTheme: appSettingsStore.appTheme
    });
    watch(
      () => ({
        path: router.currentRoute.value.path,
        query: router.currentRoute.value.query
      }),
      (newRoute) => {
        if (newRoute.path === '/workbench') {
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
        } else if (newRoute.path === '/login') {
          if (runtimeStore.networkMode === 'online') {
            window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.contentToTopBar.navigateToLogin)
          }
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
  llmClientStore.initLLMConfig();

  if (isElectronEnv) {
    // Electron 环境初始化
    initMockLogsListener();
    initAppHeader();
    sendContentReadySignal();
  } else {
    // 浏览器环境初始化
    initBrowserEnv();
  }

  shortcutManager.initAppShortcuts();
})
</script>

<style lang='scss'>
#app {
  width: 100%;
  height: 100%;
}

.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.app-content {
  flex: 1;
  min-height: 0;
}
</style>
