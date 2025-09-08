<template>
  <div class="ws-query-params">
    <div class="title">Query&nbsp;{{ t("参数") }}</div>
    <SParamsTree show-checkbox :data="queryTreeData"></SParamsTree>
  </div>
</template>

<script lang="ts" setup>
import { useWebSocket } from '@/store/websocket/websocket'
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import SParamsTree from '@/components/apidoc/params-tree/g-params-tree.vue'
import { useTranslation } from 'i18next-vue'

const websocketStore = useWebSocket()
const { websocket } = storeToRefs(websocketStore)
const { t } = useTranslation()

//query参数
const queryTreeData = computed(() => websocket.value.item.queryParams)

</script>

<style lang='scss' scoped>
.ws-query-params {
  .title {
    margin-left: 15px;
    font-size: 14px;
  }
}
</style>
