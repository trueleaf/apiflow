<template>
  <div class="guide">
    <div class="wrap">
      <img :src="logoUrl" width="150" height="150" alt="logo" class="logo">
      <h2>{{ t("当前版本") }}{{ config.localization.version }}</h2>
      <div class="d-flex a-center f-base j-center">
        <div class="d-flex a-center mr-5">
          <div>{{ t("今日新增") }}：</div>
          <div class="green">{{ docsOfToday.length }}</div>
        </div>
        <div class="d-flex a-center mr-5">
          <div>{{ t("接口总数") }}：</div>
          <div>{{ allDocs.length }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useTranslation } from 'i18next-vue'
import { ApidocBanner } from '@src/types/global'
import { forEachForest } from '@/helper'
import { config } from '@/../config/config'
import { useApidocBanner } from '@/store/apidoc/banner'

const apidocBannerStore = useApidocBanner()
const logoUrl = new URL('@/assets/imgs/logo.png', import.meta.url).href
//所有节点
const { t } = useTranslation()

const allNodes = computed(() => {
  const allBanner = apidocBannerStore.banner;
  const docs: ApidocBanner[] = [];
  forEachForest(allBanner, (v) => {
    const data = {
      ...v,
    };
    data.children = [];
    docs.push(data);
  });
  return docs;
})
//所有文档
const allDocs = computed(() => {
  const result: ApidocBanner[] = [];
  allNodes.value.forEach((v) => {
    if (!v.isFolder) {
      result.push(v);
    }
  })
  return result;
})
//今日新增文档
const docsOfToday = computed(() => {
  const result: ApidocBanner[] = [];
  allDocs.value.forEach((v) => {
    if (new Date(v.updatedAt).getTime() > new Date().setHours(0, 0, 0, 0)) {
      result.push(v);
    }
  })
  return result;
})
</script>

<style lang='scss' scoped>
.guide {
    height: calc(100vh - 100px);
    position: relative;
    font-family: none;
    .wrap {
        width: 80%;
        text-align: center;
        position: absolute;
        top: 10%;
        left: 50%;
        transform: translate(-50%, 0);
    }
}
</style>
