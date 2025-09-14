
<template>
  <SDialog :model-value="modelValue" width="30%" title="保存用例" @close="handleClose">
    <el-form ref="form" :model="formInfo" :rules="rules" label-width="120px" :inline="false">
      <el-form-item label="用例名称：" prop="name">
        <el-input v-model="formInfo.name" v-focus-select></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :loading="loading" type="primary" @click="handleSave">{{ t("保存") }}</el-button>
      <el-button type="warning" @click="handleClose">{{ t("取消") }}</el-button>
    </template>
  </SDialog>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});
const emits = defineEmits(['update:modelValue'])
const { t } = useI18n()

const loading = ref(false);
//关闭弹窗
const handleClose = () => {
  emits('update:modelValue', false);
}
//保存为用例
const handleSave = () => {
  // TODO: Params template functionality has been removed
  // This function can be removed or refactored based on requirements
  handleClose();
}
</script>
