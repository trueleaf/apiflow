
<template>
  <el-dialog :model-value="modelValue" top="10vh" :title="t('新增服务端路由')" :before-close="handleClose">
    <SForm ref="form" :edit-data="formInfo">
      <SFormItem :label="t('名称')" prop="name" required one-line></SFormItem>
      <SFormItem :label="t('请求方法')" prop="method" type="select" :select-enum="requestMethodEnum" required one-line></SFormItem>
      <SFormItem :label="t('路径')" prop="path" required one-line></SFormItem>
      <SFormItem :label="t('分组名称')" prop="groupName" required one-line></SFormItem>
    </SForm>
    <template #footer>
      <el-button :loading="loading" type="primary" @click="handleSaveServerRoute">{{ t("确定") }}</el-button>
      <el-button type="warning" @click="handleClose">{{ t("取消") }}</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import SForm from '@/components/common/forms/form/g-form.vue'
import SFormItem from '@/components/common/forms/form/g-form-item.vue'
import { nextTick, onMounted, ref } from 'vue';
import { getRequestMethodEnum } from '@/helper';
import { FormInstance } from 'element-plus';
import { request } from '@/api/api';
import { useI18n } from 'vue-i18n'

defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})
const emits = defineEmits(['update:modelValue', 'success'])
const { t } = useI18n()

const formInfo = ref({
  name: '', //------------路由名称
  path: '', //------------路由地址
  method: '', //----------请求方法
  groupName: '', //-------路由分组名称
})
const requestMethodEnum = ref<{ id: string, name: string }[]>([]);
const loading = ref(false)
const form = ref<FormInstance>()
/*
|--------------------------------------------------------------------------
| 函数定义
|--------------------------------------------------------------------------
*/
const fetchRequestMethodEnum = () => {
 requestMethodEnum.value = getRequestMethodEnum().map((v) => ({
    id: v,
    name: v.toLocaleLowerCase(),
  }));
}
//关闭弹窗
const handleClose = () => {
 emits('update:modelValue', false);
}
//保存路由
const handleSaveServerRoute = () => {
 form.value?.validate((valid) => {
    if (valid) {
      const { formInfo } =form.value as any;
      const params = {
        ...formInfo,
      };
     loading.value = true;
     request.post('/api/security/server_routes', params).then(() => {
       emits('success');
      //  handleClose();
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

onMounted(() => {
  fetchRequestMethodEnum();
})

</script>

<style lang='scss' scoped>
</style>
