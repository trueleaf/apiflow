<template>
  <div class="raw-body" :class="{ vertical: layout === 'vertical' }">
    <div v-if="rawResponseIsOverflow" class="tip">
      <span>{{ t('数据大小为') }}</span>
      <span class="orange mr-3 ml-1">{{ formatUnit(textResponse.length, 'bytes') }}</span>
      <span>{{ t('超过最大预览限制') }}</span>
      <span class="ml-1 mr-3">{{ formatUnit(httpNodeConfigStore.currentConfig.maxRawBodySize, 'bytes') }}</span>
      <el-button link type="primary" text @click="() => downloadStringAsText(textResponse, 'raw.txt')">{{ t("下载到本地预览") }}</el-button>
    </div>
    <SJsonEditor 
      v-else-if="apidocResponseStore.responseInfo.responseData.canApiflowParseType !== 'cachedBodyIsTooLarge'"  
      read-only 
      :config="{ fontSize: 13, language: 'plaintext' }"
      :modelValue="textResponse"
    >
    </SJsonEditor>

    <!-- <pre v-else-if="apidocResponseStore.responseInfo.responseData.canApiflowParseType !== 'cachedBodyIsTooLarge'" class="str-wrap pre">{{ textResponse }}</pre> -->
    <div v-else class="d-flex a-center j-center red">
      返回值大于{{ formatUnit(httpNodeConfigStore.currentConfig.maxRawBodySize, 'bytes') }}，返回body值缓存失效。
      需重新请求最新数据
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useApidocBaseInfo } from '@/store/apidoc/baseInfoStore';
import { useApidocResponse } from '@/store/apidoc/responseStore';
import { computed, ref, watch, onMounted } from 'vue';
import { downloadStringAsText } from '@/helper'
import { formatUnit } from '@/helper'
import { useI18n } from 'vue-i18n'
import SJsonEditor from '@/components/common/jsonEditor/ClJsonEditor.vue'
import { useHttpNodeConfig } from '@/store/apidoc/httpNodeConfigStore';

const apidocBaseInfoStore = useApidocBaseInfo();
const apidocResponseStore = useApidocResponse();
const httpNodeConfigStore = useHttpNodeConfig();
const { t } = useI18n()

const textResponse = ref('');
const rawResponseIsOverflow = ref(false);

watch(() => apidocResponseStore.responseInfo.bodyByteLength, () => {
  handleCheckRawSize();
}, {
  deep: true,
})
//布局
const layout = computed(() => apidocBaseInfoStore.layout);
const handleCheckRawSize = () => {
  if (apidocResponseStore.responseInfo.responseData.canApiflowParseType === 'cachedBodyIsTooLarge') {
    return
  }
  const decoder = new TextDecoder("utf-8");
  if (apidocResponseStore.rawResponseBody) {
    const text = decoder.decode(apidocResponseStore.rawResponseBody as Uint8Array);
    textResponse.value = text;
    if (text.length > httpNodeConfigStore.currentConfig.maxRawBodySize) {
      rawResponseIsOverflow.value = true;
    } else {
      rawResponseIsOverflow.value = false;
    }
  }
}
onMounted(() => {
  handleCheckRawSize();
})
</script>

<style lang='scss' scoped>
.raw-body {
  width: 100%;
  height: calc(100vh - var(--apiflow-apidoc-request-view-height) - var(--apiflow-response-tabs-header-height) - var(--apiflow-response-summary-height) - var(--apiflow-doc-nav-height) - 10px);
  overflow: hidden;
  &.vertical {
    height: 100%;
  }
  .str-wrap {
    width: 100%;
    height: 100%;
    overflow-x: auto;
    display: flex;
  }
  .format {
    height: 30px;
    display: flex;
    align-items: self-start;
    justify-content: flex-end;
  }
}
</style>
