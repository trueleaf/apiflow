<template>
  <el-dialog
    :model-value="modelValue"
    width="55vw"
    top="10vh"
    :title="t('从互联网模式同步数据')"
    :before-close="handleClose"
  >
    <div class="import-from-online__body">{{ t('todo') }}</div>
  </el-dialog>
</template>
<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

const modelValue = defineModel<boolean>({
  default: false,
})
const { t } = useI18n()
const handleClose = () => {
  modelValue.value = false
}
</script>
<style lang="scss" scoped>
.import-from-online__body {
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-regular);
}
</style>
