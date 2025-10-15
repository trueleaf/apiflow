<template>
  <el-dialog :model-value="modelValue" top="10vh" :title="t('成员管理')" :before-close="handleClose">
    <SUser :id="projectId" @leave="handleLeave"></SUser>
  </el-dialog>
</template>

<script lang="ts" setup>
import SUser from './user/user.vue'
import { useI18n } from 'vue-i18n'

defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  projectId: {
    type: String,
    default: '',
  },
})
const { t } = useI18n()

const emits = defineEmits(['update:modelValue', 'leave'])

const handleLeave = () => {
  emits('leave');
  handleClose();
};
const handleClose = () => {
  emits('update:modelValue', false);
}

</script>