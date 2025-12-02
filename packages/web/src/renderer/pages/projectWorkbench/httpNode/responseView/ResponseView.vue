<template>
  <SBaseInfoView v-show="layout === 'horizontal'"></SBaseInfoView>
  <SResponseSummaryView v-show="layout === 'horizontal'"></SResponseSummaryView>
  <SLoading :loading="requestState === 'sending' || responseBodyLoading" :class="{ 'h-100': layout === 'vertical' }" class="loading-wrap w-100">
    <div v-if="layout === 'vertical' && requestState === 'waiting' && !responseInfo.contentType" class="vertical-empty-title">Response</div>
    <div 
      v-show="responseInfo.bodyByteLength || requestState !== 'waiting'" 
      class="remote-response-wrap pl-3 w-100"
      :class="{ vertical: layout === 'vertical' }">
      <el-tabs v-model="activeName" class="h-100 w-100" data-testid="response-tabs">
        <el-tab-pane :label="t('返回值')" name="SBodyView" data-testid="response-tab-body">
          <SBodyView></SBodyView>
        </el-tab-pane>
        <el-tab-pane :label="t('请求信息')" name="SRequestView" data-testid="response-tab-request">
          <SRequestView></SRequestView>
        </el-tab-pane>
        <el-tab-pane name="SHeadersView" data-testid="response-tab-headers">
          <template #label>
            <span>{{ t("返回头") }}&nbsp;</span>
            <span v-if="headers.length > 0" class="orange">({{ headers.length }})</span>
          </template>
          <SHeadersView v-if="activeName === 'SHeadersView'" class="mt-2"></SHeadersView>
        </el-tab-pane>
        <el-tab-pane name="SCookieView" data-testid="response-tab-cookie">
          <template #label>
            <span>Cookie&nbsp;</span>
            <span v-if="cookies?.length" class="orange">({{ cookies?.length }})</span>
          </template>
          <!-- fix: 文字隐藏组件获取dom宽度失败 -->
          <SCookieView v-if="activeName === 'SCookieView'" class="mt-2"></SCookieView>
        </el-tab-pane>
        <el-tab-pane :label="t('原始值')" name="SRawBodyView" data-testid="response-tab-raw">
          <SRawBodyView v-if="activeName === 'SRawBodyView'" class="h-100 mt-2"></SRawBodyView>
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
import SBaseInfoView from './baseInfo/BaseInfoView.vue'
import SResponseSummaryView from './responseSummary/ResponseSummaryView.vue'
import SCookieView from './cookie/CookieView.vue'
import SHeadersView from './headers/HeadersView.vue'
import SBodyView from './body/BodyView.vue'
import SRawBodyView from './rawBody/RawBodyView.vue'
import SRequestView from './request/RequestView.vue'
import { useI18n } from 'vue-i18n'
import { useApidocResponse } from '@/store/apidoc/responseStore'
import { useApidocBaseInfo } from '@/store/apidoc/baseInfoStore'
import { useHttpNode } from '@/store/apidoc/httpNodeStore'
import SLoading from '@/components/common/loading/ClLoading.vue'


const { t } = useI18n()

const activeName = ref('SBodyView');
const apidocResponseStore = useApidocResponse();
const apidocBaseInfoStore = useApidocBaseInfo();
const httpNodeStore = useHttpNode();
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
const responseBodyLoading = computed(() => httpNodeStore.responseBodyLoading); //返回体加载状态

</script>

<style lang='scss' scoped>
.loading-wrap {
  height: calc(100vh - var(--apiflow-apidoc-request-view-height) - var(--apiflow-doc-nav-height) - var(--apiflow-response-summary-height));
  position: relative;
}
.remote-response-wrap {
  height: calc(100vh - var(--apiflow-apidoc-request-view-height) - var(--apiflow-doc-nav-height) - var(--apiflow-response-summary-height));
  overflow-y: auto;
  
  :deep(.el-tabs__header) {
    margin-bottom: 0px;
    height: var(--apiflow-response-tabs-header-height);
  }
  
  .el-tabs__content {
    height: calc(100% - 55px);

    .el-tab-pane {
      height: 100%;
    }
  }

  &.vertical {
    height: 100%;
    .el-tabs__content {
      height: calc(100% - 55px);
      overflow-y: auto;

      .el-tab-pane {
        height: 100%;
      }
    }
    // 移除竖向模式下 el-tabs 导航 wrap 的伪元素高度，避免遮挡或影响布局
    :deep(.el-tabs__nav-wrap)::after {
      height: 0 !important;
      display: none !important;
    }
  }
}
.vertical-empty-title {
  position: absolute;
  top: 8px;
  left: 12px;
  font-size: 15px;
  color: var(--gray-600);
  z-index: 11;
}
</style>
