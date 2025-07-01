<template>
  <div class="cookie-view" :class="{ vertical: layout === 'vertical' }">
    <div class='mb-2 d-flex a-center theme-color cursor-pointer' @click="dialogVisible = true">
      <el-icon>
        <FullScreen />
      </el-icon>
      <span class="ml-1">{{ t('本次接口返回的cookie值') }}</span>
    </div>
    <div class='mb-2 d-flex a-center theme-color cursor-pointer' @click="handleJumpToCookies">
      <span class="ml-1">{{ t('Cookie管理') }}</span>
    </div>
    <el-table :data="cookies" stripe border height="100%" size="small">
      <el-table-column align="center" prop="name" label="Name"></el-table-column>
      <el-table-column align="center" prop="value" label="Value">
        <template #default="scope">
          <div class="value-wrap">{{ scope.row.value }}</div>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="dialogVisible" :title="`【${currentSelectTab?.label}】节点的 ${t('cookie值')}`" width="80%"
      :close-on-click-modal="false">
      <el-table :data="cookies" stripe border height="65vh" size="small">
        <el-table-column align="center" prop="name" label="Name"></el-table-column>
        <el-table-column align="center" prop="value" width='500' label="Value">
          <template #default="scope">
            <div class="value-wrap">{{ scope.row.value }}</div>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="domain" label="Domain">
          <template #default="scope">
            <span v-if="!scope.row.domain || scope.row.domain === responseInfo.requestData.host">
              {{ !scope.row.domain ? responseInfo.requestData.host : '' }}
            </span>
            <div v-else class="orange">
              <div>{{ scope.row.domain }}</div>
              <div>{{ t('已忽略，非本域名') }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="path" label="Path">
          <template #default="scope">
            <span v-if="scope.row.path">{{ scope.row.path }}</span>
            <span v-else>/</span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="expires" label="Expires">
          <template #default="scope">
            <span v-if="scope.row.expires">{{ scope.row.expires }}</span>
            <span v-else>Session</span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="httpOnly" label="HttpOnly">
          <template #default="scope">
            <span v-if="scope.row.httpOnly === true">✔</span>
            <span v-else></span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="secure" label="Secure">
          <template #default="scope">
            <span v-if="scope.row.secure === true">✔</span>
            <span v-else></span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="sameSite" label="SameSite">
          <template #default="scope">
            <span v-if="scope.row.sameSite">{{ scope.row.sameSite }}</span>
            <span v-else>Lax</span>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

  </div>
</template>

<script lang="ts" setup>
import { useApidocBaseInfo } from '@/store/apidoc/base-info';
import { useApidocResponse } from '@/store/apidoc/response';
import { computed, ref, } from 'vue';
import { FullScreen } from '@element-plus/icons-vue';
import { parse } from 'set-cookie-parser';
import { useApidocTas } from '@/store/apidoc/tabs'
import { t } from 'i18next';
import { useRoute } from 'vue-router'

const route = useRoute()
const apidocResponseStore = useApidocResponse();
const apidocBaseInfoStore = useApidocBaseInfo();
const { responseInfo } = useApidocResponse();
const cookies = computed(() => {
  return parse(apidocResponseStore.responseInfo.headers['set-cookie'] || [])
});
const apidocTabsStore = useApidocTas();
const currentSelectTab = computed(() => {
  const projectId = route.query.id as string;
  const tabs = apidocTabsStore.tabs[projectId];
  const currentSelectTab = tabs?.find((tab) => tab.selected) || null;
  return currentSelectTab;
});
const layout = computed(() => apidocBaseInfoStore.layout);
const dialogVisible = ref(false);
const handleJumpToCookies = () => {
  apidocTabsStore.addTab({
    _id: 'cookies',
    projectId: apidocBaseInfoStore.projectId,
    tabType: 'cookies',
    label: t('Cookies'),
    head: {
      icon: '',
      color: ''
    },
    saved: true,
    fixed: true,
    selected: true,
  })
}
</script>

<style lang='scss' scoped>
.cookie-view {
  width: 100%;
  height: calc(100vh - 370px);
  max-height: 140px;

  .value-wrap {
    max-height: size(140);
    overflow-y: auto;
  }

  &.vertical {
    height: 100%;
  }
}
</style>
