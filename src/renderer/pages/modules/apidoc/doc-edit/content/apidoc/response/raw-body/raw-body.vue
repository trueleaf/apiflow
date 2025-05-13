<template>
  <div class="raw-body" :class="{ vertical: layout === 'vertical' }">
    <!-- <SJsonEditor v-if="apidocResponseStore.responseInfo.responseData.canApiflowParseType !== 'cachedBodyIsTooLarge'"
      :modelValue="textResponse" read-only :config="{ fontSize: 13, language: 'text' }"></SJsonEditor> -->
    <span v-if="apidocResponseStore.responseInfo.responseData.canApiflowParseType !== 'cachedBodyIsTooLarge'" class="str-wrap">{{ textResponse }}</span>
    <div v-else class="d-flex a-center j-center red">
      返回值大于{{ formatBytes(config.requestConfig.maxStoreSingleBodySize) }}，返回body值缓存失效。
      需重新请求最新数据
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useApidocBaseInfo } from '@/store/apidoc/base-info';
import { useApidocResponse } from '@/store/apidoc/response';
// import SJsonEditor from '@/components/common/json-editor/g-json-editor.vue'
import { computed, ref, watch } from 'vue';
import { config } from '@/../config/config'
import { formatBytes } from '@/helper/index'

const apidocBaseInfoStore = useApidocBaseInfo();
const apidocResponseStore = useApidocResponse();
const textResponse = ref('');

watch(() => apidocResponseStore.responseInfo.bodyByteLength, () => {
  if (apidocResponseStore.responseInfo.responseData.canApiflowParseType === 'cachedBodyIsTooLarge') {
    return
  }
  const decoder = new TextDecoder("utf-8");
  if (apidocResponseStore.responseInfo.body) {
    const text = decoder.decode(apidocResponseStore.responseInfo.body as Uint8Array);
    textResponse.value = text;
  }
}, {
  deep: true,
})
// const handleFormat = async () => {
//   try {
//     if (!textResponse.value) {
//       return
//     }
//     formatLoading.value = true;
//     if (apidocResponseStore.responseInfo.contentType?.includes('application/json')) {
//       const formatedCode = await prettier.format(textResponse.value, {
//         parser: "json",
//         // plugins: [jsonPlugin],
//       });
//       textResponse.value = formatedCode;
//     } else if (apidocResponseStore.responseInfo.contentType?.includes('text/html')) {
//       const formatedCode = await prettier.format(textResponse.value, {
//         parser: "html",
//         plugins: [htmlPlugin],
//       });
//       textResponse.value = formatedCode;
//     }
//     formatLoading.value = false;
//   } catch (error) {
//     console.error(error);
//     formatLoading.value = false;
//   }
// }
//布局
const layout = computed(() => {
  return apidocBaseInfoStore.layout;
});
</script>

<style lang='scss' scoped>
.raw-body {
  width: 100%;
  height: calc(100vh - #{size(400)});
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
    height: size(30);
    display: flex;
    align-items: self-start;
    justify-content: flex-end;
  }
}
</style>
