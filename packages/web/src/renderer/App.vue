<template>
  <router-view></router-view>
  <AddProjectDialog v-if="dialogVisible" v-model="dialogVisible" @success="handleAddSuccess"></AddProjectDialog>
</template>

<script setup lang="ts">
import { config } from '@/../config/config';
import { onMounted, ref, watch } from 'vue';
import { t } from 'i18next';
import { bindGlobalShortCut } from './shortcut';
import { useRouter } from 'vue-router';
import AddProjectDialog from '@/pages/modules/apidoc/doc-list/dialog/add-project/add-project.vue';
import { standaloneCache } from './cache/standalone';
import { ElMessageBox } from 'element-plus';
import { useApidocBanner } from './store/apidoc/banner';
import { useApidocBaseInfo } from './store/apidoc/base-info';

const router = useRouter();
const dialogVisible = ref(false);
const apidocBannerStore = useApidocBanner()
const apidocBaseInfoStore = useApidocBaseInfo()

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

const bindTopBarEvent = async () => {
  window.electronAPI?.onMain('apiflow-create-project', () => {
    dialogVisible.value = true;
  });
  window.electronAPI?.onMain('apiflow-change-route', (path: string) => {
    router.push(path)
  })
  // 主进程发送的事件名称：apiflow-change-project
  window.electronAPI?.onMain('apiflow-change-project', async (data: { projectId: string, projectName: string }) => {

    let matchedProject = null;
    if (__STANDALONE__) {
      const projectList = await standaloneCache.getProjectList();
      matchedProject = projectList.find(p => p._id === data.projectId);
    } else {
      // todo
    }

    if (!matchedProject) {
      ElMessageBox.alert(t(`${data.projectName}已被删除`), t('提示'), {
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
    if (__STANDALONE__) {
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
      
        ${t('Gitee地址')}：https://gitee.com/shuzhikai/apiflow

        ${t('最近一次更新')}：${__APP_BUILD_TIME__}
    `)
  }
}

onMounted(() => {
  initWelcom();
  bindGlobalShortCut();
  bindTopBarEvent();
  document.title = `${config.isDev ? `${config.localization.title}(本地)` : config.localization.title} `;
})
</script>

<style lang='scss'>
#app {
  width: 100%;
  height: 100%;
}
</style>
