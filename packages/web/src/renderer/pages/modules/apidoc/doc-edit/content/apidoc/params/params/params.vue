<template>
  <div class="query-path-params">
    <div class="title">Query&nbsp;{{ t("参数") }}</div>
    <SParamsTree show-checkbox :data="queryTreeData" :mind-params="mindQueryData"></SParamsTree>
    <div v-show="hasPathParams" class="title">Path&nbsp;{{ t("参数") }}</div>
    <SParamsTree v-show="hasPathParams" disable-add disable-delete :data="pathTreeData" :mind-params="mindPathData"></SParamsTree>
  </div>
</template>

<script lang="ts" setup>
import { useApidoc } from '@/store/apidoc/apidoc';
import { useApidocBaseInfo } from '@/store/apidoc/base-info';
import { computed } from 'vue'
import SParamsTree from '@/components/apidoc/params-tree/g-params-tree.vue'
import { useTranslation } from 'i18next-vue'

const apidocStore = useApidoc()
const apidocBaseInfoStore = useApidocBaseInfo()
//path参数
const { t } = useTranslation()

const pathTreeData = computed(() => apidocStore.apidoc.item.paths);
//path参数联想值
const mindPathData = computed(() => apidocBaseInfoStore.mindParams.filter(v => v.paramsPosition === 'paths'))

//query参数
const queryTreeData = computed(() => apidocStore.apidoc.item.queryParams)
//query参数联想值
const mindQueryData = computed(() => apidocBaseInfoStore.mindParams.filter(v => v.paramsPosition === 'queryParams'))
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
