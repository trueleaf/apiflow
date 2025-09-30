<template>
  <SBaseInfo v-show="layout === 'horizontal'"></SBaseInfo>
  <SResInfo v-show="layout === 'horizontal'"></SResInfo>
  <SLoading :loading="requestState === 'sending' || responseBodyLoading" :class="{ 'h-100': layout === 'vertical' }" class="loading-wrap w-100">
    <div 
      v-show="responseInfo.bodyByteLength || requestState !== 'waiting'" 
      class="remote-response-wrap pl-3 w-100"
      :class="{ vertical: layout === 'vertical' }">
      <el-tabs v-model="activeName" class="h-100 w-100">
        <el-tab-pane :label="t('返回值')" name="SBody" class="w-100">
          <SBody class="h-100"></SBody>
        </el-tab-pane>
        <el-tab-pane :label="t('请求信息')" name="SRequest">
          <SRequest class="h-100"></SRequest>
        </el-tab-pane>
        <el-tab-pane name="Sheaders">
          <template #label>
            <span>{{ t("返回头") }}&nbsp;</span>
            <span v-if="headers.length > 0" class="orange">({{ headers.length }})</span>
          </template>
          <SHeaders v-if="activeName === 'Sheaders'"></SHeaders>
        </el-tab-pane>
        <el-tab-pane name="SCookie">
          <template #label>
            <span>Cookie&nbsp;</span>
            <span v-if="cookies?.length" class="orange">({{ cookies?.length }})</span>
          </template>
          <!-- fix: 文字隐藏组件获取dom宽度失败 -->
          <SCookie v-if="activeName === 'SCookie'"></SCookie>
        </el-tab-pane>
        <el-tab-pane :label="t('原始值')" name="SRawBody" class="w-100">
          <SRawBody v-if="activeName === 'SRawBody'" class="h-100"></SRawBody>
        </el-tab-pane>
      </el-tabs>
    </div>
    <el-empty v-show="requestState === 'waiting' && !responseInfo.contentType">
      <template #description>
        <div v-if="requestState === 'waiting'">
          <div class="no-select">{{ t("点击发送请求按钮发送请求") }}</div>
        </div>
      </template>
    </el-empty>
  </SLoading>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import SBaseInfo from './base-info/base-info.vue'
import SResInfo from './res-info/res-info.vue'
import SCookie from './cookie/cookie.vue'
import SHeaders from './headers/headers.vue'
import SBody from './body/body.vue'
import SRawBody from './raw-body/raw-body.vue'
import SRequest from './request/request.vue'
import { useI18n } from 'vue-i18n'
import { useApidocResponse } from '@/store/apidoc/response'
import { useApidocBaseInfo } from '@/store/apidoc/base-info'
import { useApidoc } from '@/store/apidoc/apidoc'
import SLoading from '@/components/common/loading/g-loading.vue'


const { t } = useI18n()

const activeName = ref('SBody');
const apidocResponseStore = useApidocResponse();
const apidocBaseInfoStore = useApidocBaseInfo();
const apidocStore = useApidoc();
const cookies = computed(() => apidocResponseStore.responseInfo.headers['set-cookie']);
const responseInfo = computed(() => apidocResponseStore.responseInfo);

const headers = computed(() => {
  const result: { key: string, value: string }[] = [];
  Object.keys(apidocResponseStore.responseInfo.headers).forEach(key => {
    result.push({
      key,
      value: apidocResponseStore.responseInfo.headers[key] as string,
    });
  })
  return result
})

const layout = computed(() => apidocBaseInfoStore.layout);
const requestState = computed(() => apidocResponseStore.requestState); //请求状态
const responseBodyLoading = computed(() => apidocStore.responseBodyLoading); //返回体加载状态

</script>

<style lang='scss' scoped>
.loading-wrap {
  height: calc(100vh - var(--apiflow-apidoc-request-view-height) - var(--apiflow-doc-nav-height) - 30px);
}
.remote-response-wrap {
  height: calc(100vh - var(--apiflow-apidoc-request-view-height) - var(--apiflow-doc-nav-height) - 30px);
  overflow-y: auto;
  
  :deep(.el-tabs__header) {
    margin-bottom: 0px;
  }
  
  .el-tabs__content {
    height: calc(100% - 55px);

    .el-tab-pane {
      height: 100%;
    }
  }

  &.vertical {
    height: 100%;
    margin-top: 15px;

    .el-tabs__content {
      height: calc(100% - 55px);
      overflow-y: auto;

      .el-tab-pane {
        height: 100%;
      }
    }
  }
}
</style>
