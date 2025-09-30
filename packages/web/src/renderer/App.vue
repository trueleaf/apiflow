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
import { config } from '@/../config/config';
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { changeLanguage } from './i18n';
import { useRouter } from 'vue-router';
import AddProjectDialog from '@/pages/modules/apidoc/doc-list/dialog/add-project/add-project.vue';
import { standaloneCache } from './cache/standalone';
import { ElMessageBox } from 'element-plus';
import { useApidocBaseInfo } from './store/apidoc/base-info';
import { Language } from '@src/types';
import LanguageMenu from '@/components/common/language/language.vue';
import type { RuntimeNetworkMode } from '@src/types/runtime';
import { useRuntime } from './store/runtime/runtime.ts';

const router = useRouter();
const dialogVisible = ref(false);
const apidocBaseInfoStore = useApidocBaseInfo()
const runtimeStore = useRuntime();
const isOffline = computed(() => runtimeStore.networkMode === 'offline');
const { t } = useI18n()

// 语言菜单相关状态
const languageMenuVisible = ref(false)
const languageMenuPosition = ref({ x: 0, y: 0, width: 0, height: 0 })
const currentLanguage = ref<Language>(localStorage.getItem('language') as Language || 'zh-cn')

// 监听路由变化
watch(() => router.currentRoute.value.path, (newPath) => {
  if (newPath === '/v1/apidoc/doc-edit') {
    const projectId = router.currentRoute.value.query.id as string;
    const projectName = router.currentRoute.value.query.name as string;
    window.electronAPI?.sendToMain('apiflow-content-project-changed', {
      projectId: projectId,
      projectName: projectName
    })
  }
}, { immediate: true });



watch(() => runtimeStore.networkMode, async (mode, prevMode) => {
  if (mode === prevMode) {
    return
  }
  if (router.currentRoute.value.path !== '/v1/apidoc/doc-list') {
    await router.push('/v1/apidoc/doc-list')
  }
  window.electronAPI?.sendToMain('apiflow-refresh-content-view')
})

const handleAddSuccess = (data: { projectId: string, projectName: string }) => {
  dialogVisible.value = false;
  // 使用新的事件名称
  window.electronAPI?.sendToMain('apiflow-content-project-created', {
    projectId: data.projectId,
    projectName: data.projectName
  });
  router.push({
    path: '/v1/apidoc/doc-edit',
    query: {
      id: data.projectId,
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
  window.electronAPI?.sendToMain('apiflow-language-changed', language)
}


const bindTopBarEvent = () => {
  window.electronAPI?.onMain('apiflow-create-project', () => {
    dialogVisible.value = true;
  });
  window.electronAPI?.onMain('apiflow-change-route', (path: string) => {
    router.push(path)
  })
  window.electronAPI?.onMain('apiflow-network-mode-changed', (mode: RuntimeNetworkMode) => {
    if (runtimeStore.networkMode !== mode) {
      runtimeStore.setNetworkMode(mode)
    }
  })

  window.electronAPI?.onMain('apiflow-go-back', () => {
    handleGoBack()
  })

  window.electronAPI?.onMain('apiflow-go-forward', () => {
    handleGoForward()
  })

  // 显示语言菜单事件监听
  window.electronAPI?.onMain('apiflow-show-language-menu', (data: { position: any, currentLanguage: string }) => {
    showLanguageMenu(data)
  })

  // 主进程发送的事件名称：apiflow-change-project
  window.electronAPI?.onMain('apiflow-change-project', async (data: { projectId: string, projectName: string }) => {
    let matchedProject = null;
    if (isOffline.value) {
      const projectList = await standaloneCache.getProjectList();
      matchedProject = projectList.find(p => p._id === data.projectId);
    } else {
      // todo
    }

    if (!matchedProject) {
      ElMessageBox.alert(`${data.projectName}${t('已被删除')}`, t('提示'), {
        confirmButtonText: t('确定'),
        showClose: false,
        type: 'error'
      }).then(() => {
        // 使用主进程中定义的事件名称：apiflow-content-project-deleted
        window.electronAPI?.sendToMain('apiflow-content-project-deleted', data.projectId)
      })
      return
    }
    if (matchedProject.projectName !== data.projectName) {
      // 使用主进程中定义的事件名称：apiflow-content-project-renamed
      window.electronAPI?.sendToMain('apiflow-content-project-renamed', {
        projectId: data.projectId,
        projectName: matchedProject.projectName
      })
    }
    if (isOffline.value) {
      await apidocBaseInfoStore.getProjectBaseInfo({ projectId: data.projectId })
      await apidocBaseInfoStore.changeProjectId(data.projectId)
    }
    router.push({
      path: '/v1/apidoc/doc-edit',
      query: {
        id: data.projectId,
        name: matchedProject.projectName,
        mode: 'edit'
      }
    })
  })
}

const initWelcom = () => {
  if (!config.isDev && config.localization.consoleWelcome) {
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
onMounted(() => {
  initWelcom();
  bindTopBarEvent();
  initLanguage();
  document.title = `${config.isDev ? `${config.localization.title}(${t('本地')})` : config.localization.title} `;
})
</script>

<style lang='scss'>
#app {
  width: 100%;
  height: 100%;
}
</style>
