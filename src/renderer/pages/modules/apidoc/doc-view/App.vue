/*
    创建者：shuxiaokai
    创建时间：2021-06-08 19:20
    模块名称：首页
    备注：
*/
<template>
  <el-config-provider :locale="locale">
    <router-view></router-view>
  </el-config-provider>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/lib/locale/lang/zh-cn'
import { config } from '@/../config/config'

export default defineComponent({
  components: {
    [ElConfigProvider.name]: ElConfigProvider,
  },
  data() {
    return {
      locale: zhCn,
    };
  },
  created() {
    if (!config.isDev && config.localization.consoleWelcome) {
      console.log(`
                     _ _            _ _           _ _ _ _ _ _ _     _ _      _ _    _ _        _ _
                    / _ \\          / _ \\         / _ _ _ _ _ _ \\    \\   \\   /   /   |  |       |  |
                   / / \\ \\        / / \\ \\       / /           \\ \\    \\   \\ /   /    |  |       |  |
                  / /   \\ \\      / /   \\ \\     | |             | |    \\   /   /     |  |       |  |
                 / /     \\ \\    / /     \\ \\    | |             | |     \\ /   /      |  |       |  |
                / /       \\ \\  / /       \\ \\    \\ \\_ _ _ _ _ _/ /       /   /       \\ _|_ _ _ _| _/
               /_/         \\_\\/_/         \\_\\    \\_ _ _ _ _ _ _/       /_ _/         \\ _ _ _ _ _ /

               ${this.t('基于Vue和Electron的接口文档工具')}

               ${this.t('GitHub地址')}：https://github.com/trueleaf/moyu

               ${this.t('Gitee地址')}：https://gitee.com/shuzhikai/apiflow

               ${this.t('最近一次更新')}：${process.env.VUE_APP_BUILD_TIME}
            `)
    }
    if (!config.localization.consoleWelcome) {
      console.log(process.env.VUE_APP_BUILD_TIME);
    }
    document.title = config.localization.title;
  },
})
</script>

<style  scoped>
#app {
    width: 100vw;
    height: 100vh;
}
</style>
