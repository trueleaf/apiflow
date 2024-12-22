/*
    创建者：shuxiaokai
    创建时间：2021-08-30 21:28
    模块名称：headers参数录入
    备注：
*/
<template>
  <div>
    <div v-if="!hideDefaultHeader">
      <span class="cursor-pointer no-select" @click="hideDefaultHeader = true">
        <span>{{ t("点击隐藏默认") }}</span>
      </span>
      <s-params-tree :drag="false" show-checkbox :readonly-keys="defaultHeaderKeys" :data="defaultHeaders"></s-params-tree>
    </div>
    <div v-else class="cursor-pointer no-select" @click="hideDefaultHeader = false">
      <span>{{ t("个隐藏", { msg: defaultHeaders.length.toString()}) }}</span>
      <el-icon class="ml-1" :size="16">
        <View />
      </el-icon>
    </div>
    <s-params-tree :drag="false" show-checkbox :data="headerData"></s-params-tree>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { View } from '@element-plus/icons-vue'
import { store } from '@/pages/modules/apidoc/doc-view/store/index'

const hideDefaultHeader = ref(true);
const headerData = computed(() => store.state['apidoc/apidoc'].apidoc.item.headers)
const defaultHeaders = computed(() => store.state['apidoc/apidoc'].defaultHeaders)
const defaultHeaderKeys = computed(() => store.state['apidoc/apidoc'].defaultHeaders.map(v => v.key))
</script>

<style lang='scss' scoped>

</style>
