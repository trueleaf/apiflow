<template>
  <div class="raw-body" :class="{ vertical: layout === 'vertical' }">
    <div v-if="rawResponseIsOverflow" class="tip">
      <span>{{ t('数据大小为') }}</span>
      <span class="orange mr-3 ml-1">{{ formatUnit(textResponse.length, 'bytes') }}</span>
      <span>{{ t('超过最大预览限制') }}</span>
      <span class="ml-1 mr-3">{{ formatUnit(httpNodeConfigStore.currentHttpNodeConfig.maxRawBodySize, 'bytes') }}</span>
      <el-button link type="primary" text @click="() => downloadStringAsText(textResponse, 'raw.txt')">{{ t("下载到本地预览") }}</el-button>
    </div>
    <SJsonEditor 
      v-else-if="httpNodeResponseStore.responseInfo.responseData.canApiflowParseType !== 'cachedBodyIsTooLarge'"  
      read-only 
      :config="{ fontSize: 13, language: 'plaintext' }"
      :modelValue="textResponse"
    >
    </SJsonEditor>

    <!-- <pre v-else-if="httpNodeResponseStore.responseInfo.responseData.canApiflowParseType !== 'cachedBodyIsTooLarge'" class="str-wrap pre">{{ textResponse }}</pre> -->
    <div v-else class="d-flex a-center j-center red">
      返回值大于{{ formatUnit(httpNodeConfigStore.currentHttpNodeConfig.maxRawBodySize, 'bytes') }}，返回body值缓存失效。
      需重新请求最新数据
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useProjectWorkbench } from '@/store/projectWorkbench/projectWorkbenchStore';
import { useHttpNodeResponse } from '@/store/httpNode/httpNodeResponseStore';
import { computed, ref, watch, onMounted } from 'vue';
import { downloadStringAsText } from '@/helper'
import { formatUnit } from '@/helper'
import { useI18n } from 'vue-i18n'
import SJsonEditor from '@/components/common/jsonEditor/ClJsonEditor.vue'
import { useHttpNodeConfig } from '@/store/httpNode/httpNodeConfigStore';

const projectWorkbenchStore = useProjectWorkbench();
const httpNodeResponseStore = useHttpNodeResponse();
const httpNodeConfigStore = useHttpNodeConfig();
const { t } = useI18n()

const textResponse = ref('');
const rawResponseIsOverflow = ref(false);

watch(() => httpNodeResponseStore.responseInfo.bodyByteLength, () => {
  handleCheckRawSize();
}, {
  deep: true,
})
//布局
const layout = computed(() => projectWorkbenchStore.layout);
const handleCheckRawSize = () => {
  if (httpNodeResponseStore.responseInfo.responseData.canApiflowParseType === 'cachedBodyIsTooLarge') {
    return
  }
  const decoder = new TextDecoder("utf-8");
  if (httpNodeResponseStore.rawResponseBody) {
    const text = decoder.decode(httpNodeResponseStore.rawResponseBody as Uint8Array);
    textResponse.value = text;
    if (text.length > httpNodeConfigStore.currentHttpNodeConfig.maxRawBodySize) {
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
    height: calc(var(--apiflow-response-height) - var(--apiflow-response-tabs-header-height) - 10px);
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
