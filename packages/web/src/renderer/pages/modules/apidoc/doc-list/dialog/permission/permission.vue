<template>
  <SDialog :model-value="modelValue" top="10vh" :title="t('成员管理')" @close="handleClose">
    <SUser :id="projectId" @leave="handleLeave"></SUser>
  </SDialog>
</template>

<script lang="ts" setup>
import SUser from './user/user.vue'
import SDialog from '@/components/common/dialog/g-dialog.vue'
import { t } from 'i18next'

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
const emits = defineEmits(['update:modelValue', 'leave'])

const handleLeave = () => {
  emits('leave');
  handleClose();
};
const handleClose = () => {
  emits('update:modelValue', false);
}

</script>