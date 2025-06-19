<template>
  <div class="header-view" :class="{ vertical: layout === 'vertical' }">
    <el-table :data="headers" stripe border>
      <el-table-column align="center" prop="key" :label="t('名称')"></el-table-column>
      <el-table-column align="center" prop="value" :label="t('值')">
        <template #default="scope">
          <div class="value-wrap">{{ scope.row.value }}</div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts" setup>
import { useApidocBaseInfo } from '@/store/apidoc/base-info';
import { useApidocResponse } from '@/store/apidoc/response';
import { computed } from 'vue';
import { t } from 'i18next'


const apidocResponseStore = useApidocResponse();
const apidocBaseInfoStore = useApidocBaseInfo();
const headers = computed(() => {
  const result: { key: string, value: string }[] = [];
  Object.keys(apidocResponseStore.responseInfo.headers).forEach(key => {
    if (key === 'set-cookie') {
      result.push({
        key,
        value: apidocResponseStore.responseInfo.headers['set-cookie']!.join('\n'),
      });
    } else {
      result.push({
        key,
        value: apidocResponseStore.responseInfo.headers[key] as string,
      });
    }
  })
  return result
});
const layout = computed(() => apidocBaseInfoStore.layout);
</script>

<style lang='scss' scoped>
.header-view {
  width: 100%;
  height: calc(100vh - #{size(370)});
  overflow-y: auto;

  .value-wrap {
    max-height: size(140);
    overflow-y: auto;
  }

  &.vertical {
    height: 100%;
  }
}
</style>
