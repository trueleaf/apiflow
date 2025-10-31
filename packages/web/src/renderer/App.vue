<template>
  <router-view></router-view>
  <AddProjectDialog v-if="dialogVisible" v-model="dialogVisible" @success="handleAddSuccess"></AddProjectDialog>
  <LanguageMenu
    :visible="languageMenuVisible"
    :position="languageMenuPosition"
    :current-language="currentLanguage"
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
import { projectCache } from '@/cache/index';
import { ElMessageBox } from 'element-plus';
import { useApidocBaseInfo } from './store/share/baseInfoStore';
import { Language } from '@src/types';
import LanguageMenu from '@/components/common/language/Language.vue';
import type { RuntimeNetworkMode } from '@src/types/runtime';
import { useRuntime } from './store/runtime/runtimeStore.ts';
import { appWorkbenchCache } from '@/cache/index';
import { aiCache } from '@/cache/ai/aiCache';
import { httpMockLogsCache } from '@/cache/mock/httpMock/httpMockLogsCache';
import type { MockLog } from '@src/types/mockNode';
import { IPC_EVENTS } from '@src/types/ipc';

const router = useRouter();
const dialogVisible = ref(false);
const apidocBaseInfoStore = useApidocBaseInfo()
const runtimeStore = useRuntime();
const { t } = useI18n()
// 语言菜单相关状态
const languageMenuVisible = ref(false)
const languageMenuPosition = ref({ x: 0, y: 0, width: 0, height: 0 })
const currentLanguage = ref<Language>(localStorage.getItem('language') as Language || 'zh-cn')

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
  currentLanguage.value = data.currentLanguage as Language
  languageMenuVisible.value = true
}

const hideLanguageMenu = () => {
  languageMenuVisible.value = false
}

const handleLanguageSelect = (language: Language) => {
  currentLanguage.value = language;
  localStorage.setItem('language', language);
  changeLanguage(language)
  hideLanguageMenu()
  // 发送语言切换事件到主进程
  window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.contentToTopBar.languageChanged, language)
}


const initAppHeaderEvent = () => {
  window.electronAPI?.ipcManager.onMain(IPC_EVENTS.apiflow.rendererToMain.createProject, () => {
    dialogVisible.value = true;
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
    console.log('hide')
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
  // 发送给 header.vue
  window.electronAPI?.ipcManager.sendToMain(
    IPC_EVENTS.apiflow.contentToTopBar.initTabs,
    {
      tabs,
      activeTabId
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
  const savedLanguage = localStorage.getItem('language') as Language;
  if (savedLanguage) {
    currentLanguage.value = savedLanguage;
    changeLanguage(savedLanguage);
  } else {
    // 默认语言
    currentLanguage.value = 'zh-cn';
    changeLanguage('zh-cn');
  }
}

const initAppTitle = () => {
  document.title = `${config.isDev ? `${config.localization.title}(${t('本地')})` : config.localization.title}`;
}

// 同步AI配置到主进程
const initAiConfig = () => {
  try {
    const config = aiCache.getAiConfig();
    window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.contentToTopBar.syncAiConfig, {
      apiKey: config.apiKey || '',
      apiUrl: config.apiUrl || '',
      timeout: config.timeout || 60000
    });
  } catch (error) {
    console.error('同步AI配置失败:', error);
  }
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

onMounted(() => {
  initWelcom();
  initLanguage();
  initAppTitle();
  initAiConfig();
  initMockLogsListener();
  sendContentReadySignal();
  initAppHeader();
})
</script>

<style lang='scss'>
#app {
  width: 100%;
  height: 100%;
}
</style>
