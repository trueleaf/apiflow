/*
    创建者：shuxiaokai
    创建时间：2021-07-21 21:00
    模块名称：内容编辑区域
    备注：
*/
<template>
  <keep-alive>
    <s-guide v-if="!currentSelectTab || currentSelectTab?.tabType === 'guide'"></s-guide>
    <s-apidoc v-else-if="currentSelectTab.tabType === 'doc'"></s-apidoc>
  </keep-alive>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { ApidocTab } from '@src/types/store'
import apidoc from './apidoc/apidoc.vue';
import guide from './guide/guide.vue';

export default defineComponent({
  components: {
    's-guide': guide,
    's-apidoc': apidoc,
  },
  data() {
    return {
    };
  },
  computed: {
    currentSelectTab(): ApidocTab | null { //当前选中的doc
      const projectId = this.$route.query.id as string;
      const tabs = this.$store.state['apidoc/tabs'].tabs[projectId];
      const currentSelectTab = tabs?.find((tab) => tab.selected) || null;
      return currentSelectTab;
    },
  },
})
</script>

<style lang='scss' scoped>

</style>
