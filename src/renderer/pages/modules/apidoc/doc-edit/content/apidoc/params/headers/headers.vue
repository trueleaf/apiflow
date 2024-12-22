<template>
  <div class="header-info">
    <div v-if="!hideDefaultHeader">
      <span class="cursor-pointer no-select" @click="hideDefaultHeader = true">
        <span>{{ t("点击隐藏默认") }}</span>
      </span>
      <SParamsTree :drag="false" show-checkbox :readonly-keys="defaultHeaderKeys" :data="defaultHeaders"></SParamsTree>
    </div>
    <div v-else class="cursor-pointer no-select d-flex a-center" @click="hideDefaultHeader = false">
      <span>{{ t("个隐藏", { msg: defaultHeaders.length.toString() }) }}</span>
      <el-icon :size="16" class="ml-1">
        <View />
      </el-icon>
    </div>
    <SParamsTree :drag="false" show-checkbox :data="headerData" :mind-params="mindHeaderParams"></SParamsTree>
    <template v-if="commonHeaders.length > 0">
      <el-divider content-position="left">{{ t('公共请求头') }}</el-divider>
      <el-table :data="commonHeaders" stripe border size="small">
        <el-table-column prop="key" :label="t('键')" align="center"></el-table-column>
        <el-table-column prop="type" :label="t('类型')" align="center"></el-table-column>
        <el-table-column prop="value" :label="t('值')" align="center">
          <template #default="scope">
            <div class="value-wrap">{{ scope.row.value }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="description" :label="t('描述')" align="center">
          <template #default="scope">
            <div>{{ t(scope.row.description) }}</div>
          </template>
        </el-table-column>
      </el-table>
      <!-- <SParamsTree :drag="false" :readonly-keys="commonHeaderKeys" :data="commonHeaders"></SParamsTree> -->
    </template>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, Ref, } from 'vue'
import { router } from '@/router'
import { View } from '@element-plus/icons-vue'
import { ApidocProperty } from '@src/types/global';
import { apidocGenerateProperty } from '@/helper';
import mindHeaders from './mind-headers'
import { t } from 'i18next'
import SParamsTree from '@/components/apidoc/params-tree/g-params-tree.vue'
import { useApidoc } from '@/store/apidoc/apidoc';
import { useApidocTas } from '@/store/apidoc/tabs';
import { useApidocBaseInfo } from '@/store/apidoc/base-info';

const apidocTabsStore = useApidocTas()
const apidocStore = useApidoc()
const apidocBaseInfoStore = useApidocBaseInfo()
const projectId = router.currentRoute.value.query.id as string;
const currentSelectTab = computed(() => { //当前选中的doc
  const tabs = apidocTabsStore.tabs[projectId];
  return tabs?.find((tab) => tab.selected) || null;
})
const hideDefaultHeader = ref(true);
const headerData = computed(() => apidocStore.apidoc.item.headers)
const defaultHeaders = computed(() => apidocStore.defaultHeaders)
const defaultHeaderKeys = computed(() => apidocStore.defaultHeaders.map(v => v.key));
const commonHeaders = computed(() => {
  const data = apidocBaseInfoStore.getCommonHeadersById(currentSelectTab.value?._id || "")
  return data.map(v => {
    const property = apidocGenerateProperty();
    property.key = v.key;
    property.value = v.value;
    property.description = v.description;
    return property;
  })
});

const mindHeaderParams: Ref<ApidocProperty[]> = ref(mindHeaders);


</script>

<style lang='scss' scoped>
.header-info {
  .value-wrap {
    max-height: size(140);
    overflow-y: auto;
  }
}
</style>
