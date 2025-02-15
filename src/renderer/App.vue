<template>
  <router-view></router-view>
</template>

<script setup lang="ts">
import { config } from '@/../config/config';
import { onMounted } from 'vue';
import { t } from 'i18next';
import { bindGlobalShortCut } from './shortcut';
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
      
        ${t('GitHub地址')}：https://github.com/trueleaf/moyu
      
        ${t('Gitee地址')}：https://gitee.com/shuzhikai/apiflow

        ${t('最近一次更新')}：${__APP_BUILD_TIME__}
    `)
  }
  document.title = `${config.isDev ? `${config.localization.title}(本地)` : config.localization.title} `;
  bindGlobalShortCut();
})
</script>

<style lang='scss' scoped>
#app {
  width: 100vw;
  height: 100vh;
}
</style>
