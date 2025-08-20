<template>
  <div class="query-path-params">
    <div class="title">Query&nbsp;{{ t("参数") }}</div>
    <SParamsTree show-checkbox :data="queryTreeData"></SParamsTree>
    <div v-show="hasPathParams" class="title">Path&nbsp;{{ t("参数") }}</div>
    <SParamsTree v-show="hasPathParams" disable-add disable-delete :data="pathTreeData"></SParamsTree>
  </div>
</template>

<script lang="ts" setup>
import { useApidoc } from '@/store/apidoc/apidoc';
import { computed } from 'vue'
import SParamsTree from '@/components/apidoc/params-tree/g-params-tree.vue'
import { useTranslation } from 'i18next-vue'

const apidocStore = useApidoc()
//path参数
const { t } = useTranslation()

const pathTreeData = computed(() => apidocStore.apidoc.item.paths);

//query参数
const queryTreeData = computed(() => apidocStore.apidoc.item.queryParams)
//是否存在path参数
const hasPathParams = computed(() => {
  const { paths } = apidocStore.apidoc.item;
  const hasPathsParams = paths.some((data) => data.key);
  return hasPathsParams;
})

</script>
<style lang='scss' scoped>
.query-path-params {
  .title {
    margin-left: 15px;
    font-size: 14px;
  }
}
</style>
