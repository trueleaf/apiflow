<template>
  <SDialog :model-value="modelValue" top="10vh" width="40%" :title="t('新建接口')" @close="handleClose">
    <SForm ref="form" @submit.prevent="handleAddFile">
      <SFormItem :label="t('文档名称')" prop="name" focus one-line></SFormItem>
    </SForm>
    <template #footer>
      <el-button :loading="loading" type="primary" @click="handleAddFile">{{ t("确定") }}</el-button>
      <el-button type="warning" @click="handleClose">{{ t("取消") }}</el-button>
    </template>
  </SDialog>
</template>

<script lang="ts" setup>
import { t } from 'i18next'
import { Response, ApidocBanner } from '@src/types/global'
import { ref } from 'vue';
import { ElMessage, FormInstance } from 'element-plus';
import SForm from '@/components/common/forms/form/g-form.vue'
import SFormItem from '@/components/common/forms/form/g-form-item.vue'
import SDialog from '@/components/common/dialog/g-dialog.vue'
import { request } from '@/api/api';
import { useRoute } from 'vue-router';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  //父元素id，没有则代表在根元素上新增节点
  pid: {
    type: String,
    default: '',
  },
})
const emits = defineEmits(['update:modelValue', 'success']);
const loading = ref(false);
const form = ref<FormInstance>();
const route = useRoute()
/*
|--------------------------------------------------------------------------
| 方法
|--------------------------------------------------------------------------
*/
const handleAddFile = () => {
  form.value?.validate((valid) => {
    if (valid) {
      loading.value = true;
      const { formInfo } = form.value as any;
      const params = {
        name: formInfo.name,
        type: 'api',
        projectId: route.query.id as string,
        pid: props.pid,
      };
      request.post<Response<ApidocBanner>, Response<ApidocBanner>>('/api/project/new_doc', params).then((res) => {
        emits('success', res.data); //一定要先成功然后才关闭弹窗,因为关闭弹窗会清除节点父元素id
        handleClose();
      }).catch((err) => {
        console.error(err)
      }).finally(() => {
        loading.value = false;
      });
    } else {
      ElMessage.warning(t('请完善必填信息'));
      loading.value = false;
    }
  });
}
const handleClose = () => {
  emits('update:modelValue', false);
}

</script>

<style lang='scss' scoped></style>
