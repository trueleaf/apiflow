
<template>
  <div>
    <el-input
      v-model="description"
      :size="config.renderConfig.layout.size"
      :rows="15"
      type="textarea"
      show-word-limit
      name="name"
      :placeholder="t('在此处输入备注信息')"
      class="w-100"
      maxlength="1024"
      clearable
    >
    </el-input>
  </div>
</template>

<script lang="ts" setup>
import { t } from 'i18next'
import { config } from '@src/config/config';
import { computed } from 'vue'
import { useApidoc } from '@/store/apidoc/apidoc';

const apidocStore = useApidoc()
const description = computed({
  get() {
    return apidocStore.apidoc.info.description
  },
  set(val: string) {
    apidocStore.changeDescription(val)
  }
})
</script>
