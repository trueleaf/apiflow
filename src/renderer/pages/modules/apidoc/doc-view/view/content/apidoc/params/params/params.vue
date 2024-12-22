/*
    创建者：shuxiaokai
    创建时间：2021-08-20 22:30
    模块名称：query参数、path参数
    备注：
*/
<template>
  <div class="query-path-params">
    <div class="title">Query&nbsp;{{ t("参数") }}</div>
    <s-params-tree show-checkbox :data="queryTreeData" :mind-params="mindQueryData"></s-params-tree>
    <div v-show="hasPathParams" class="title">Path&nbsp;{{ t("参数") }}</div>
    <s-params-tree v-show="hasPathParams" disable-add disable-delete :data="pathTreeData" :mind-params="mindPathData"></s-params-tree>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { store } from '@/pages/modules/apidoc/doc-view/store/index'

//path参数
const pathTreeData = computed(() => store.state['apidoc/apidoc'].apidoc.item.paths)
//path参数联想值
const mindPathData = computed(() => store.state['apidoc/baseInfo'].mindParams.filter(v => v.paramsPosition === 'paths'))

//query参数
const queryTreeData = computed(() => store.state['apidoc/apidoc'].apidoc.item.queryParams)
//query参数联想值
const mindQueryData = computed(() => store.state['apidoc/baseInfo'].mindParams.filter(v => v.paramsPosition === 'queryParams'))
//是否存在path参数
const hasPathParams = computed(() => {
  const { paths } = store.state['apidoc/apidoc'].apidoc.item;
  const hasPathsParams = paths.some((data) => data.key);
  return hasPathsParams;
})

</script>
<style  scoped>
.query-path-params {
    .title {
        margin-left: size(15);
        font-size: fz(14);
    }
}
</style>
