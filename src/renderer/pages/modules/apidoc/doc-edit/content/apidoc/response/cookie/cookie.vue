<template>
  <div class="cookie-view" :class="{ vertical: layout === 'vertical' }">
    <el-table :data="cookies" stripe border height="100%">
      <el-table-column align="center" prop="name" label="Name"></el-table-column>
      <el-table-column align="center" prop="value" label="Value">
        <template #default="scope">
          <div class="value-wrap">{{ scope.row.value }}</div>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="domin" label="Domin"></el-table-column>
      <el-table-column align="center" prop="path" label="Path"></el-table-column>
      <el-table-column align="center" prop="expires" label="Expires"></el-table-column>
      <el-table-column align="center" prop="httpOnly" label="HttpOnly"></el-table-column>
      <el-table-column align="center" prop="secure" label="Secure"></el-table-column>
      <el-table-column align="center" prop="sameSite" label="SameSite"></el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts" setup>
import { useApidocBaseInfo } from '@/store/apidoc/base-info';
import { useApidocResponse } from '@/store/apidoc/response';
import { computed } from 'vue';


const apidocResponseStore = useApidocResponse();
const apidocBaseInfoStore = useApidocBaseInfo();
const cookies = computed(() => apidocResponseStore.cookies);
const layout = computed(() => apidocBaseInfoStore.layout);

</script>

<style lang='scss' scoped>
.cookie-view {
  width: 100%;
  height: calc(100vh - #{size(370)});

  .value-wrap {
    max-height: size(140);
    overflow-y: auto;
  }

  &.vertical {
    height: 100%;
  }
}
</style>
