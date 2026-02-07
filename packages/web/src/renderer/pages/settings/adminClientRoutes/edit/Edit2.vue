
<template>
  <el-dialog :model-value="modelValue" top="10vh" :title="t('批量修改前端路由类型')" :before-close="handleClose">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px">
      <el-row>
        <el-col :span="24">
          <el-form-item :label="t('分组名称') + '：'" prop="groupName">
            <el-input v-model="formData.groupName" :placeholder="t('请输入分组名称')" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">{{ t("取消") }}</el-button>
      <el-button :loading="loading" type="primary" @click="handleSaveClientRoute">{{ t('确定/AdminClientRoutesEdit2') }}</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { nextTick, PropType, ref } from 'vue'
import { PermissionClientRoute } from '@src/types'
import { FormInstance, FormRules } from 'element-plus'
import { request } from '@/api/api'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  editData: {
    type: Object as PropType<PermissionClientRoute[]>,
    default: () => []
  },
})
const modelValue = defineModel<boolean>({
  default: false
})
const emits = defineEmits(['success'])
const { t } = useI18n()

const formData = ref({
  groupName: '',
});
const rules: FormRules = {
  groupName: [{ required: true, message: t('请输入分组名称'), trigger: 'blur' }],
}
const loading = ref(false);
const formRef = ref<FormInstance>()
//保存前端路由
const handleSaveClientRoute = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      const params = {
        ids: props.editData.map((v) => v._id),
        groupName: formData.value.groupName,
      };
      loading.value = true;
      request.put('/api/security/client_routes_type', params).then(() => {
        emits('success');
        handleClose();
      }).catch((err) => {
        console.error(err);
      }).finally(() => {
        loading.value = false;
      });
    } else {
      nextTick(() => {
        const input = document.querySelector('.el-form-item.is-error input');
        if (input) {
          (input as HTMLInputElement).focus();
        }
      });
      loading.value = false;
    }
  });
}
//关闭弹窗
const handleClose = () => {
  modelValue.value = false;
}
</script>
