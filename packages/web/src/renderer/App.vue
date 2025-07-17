<template>
  <router-view></router-view>
  <AddProjectDialog v-if="dialogVisible" v-model="dialogVisible" @success="handleAddSuccess"></AddProjectDialog>
</template>

<script setup lang="ts">
import { config } from '@/../config/config';
import { onMounted, ref } from 'vue';
import { t } from 'i18next';
import { bindGlobalShortCut } from './shortcut';
import { useRouter } from 'vue-router';
import AddProjectDialog from '@/pages/modules/apidoc/doc-list/dialog/add-project/add-project.vue';

const router = useRouter();
const dialogVisible = ref(false);

const handleAddSuccess = (data: { projectId: string, projectName: string }) => {
  dialogVisible.value = false;
  window.electronAPI?.sendToMain('apiflow-create-project-success-from-app', {
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


onMounted(() => {
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
  document.title = `${config.isDev ? `${config.localization.title}(本地)` : config.localization.title} `;
  bindGlobalShortCut();
  window.electronAPI?.onMain('apiflow-create-project', () => {
    dialogVisible.value = true;
  });
})
</script>

<style lang='scss'>
#app {
  width: 100%;
  height: 100%;
  margin-top: 35px;
}
</style>
