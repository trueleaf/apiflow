<template>
  <el-dialog 
    :model-value="modelValue" 
    top="10vh" 
    width="500px" 
    :title="t('新建接口')" 
    footer-class="add-file-dialog__footer"
    content-class="add-file-dialog__content"
    body-class="add-file-dialog__body"
    :before-close="handleClose"
   >
    <el-form ref="form" :model="formData" :rules="formRules" @submit.prevent="handleAddFile">
      <el-form-item :label="t('接口名称')" prop="name">
        <el-input ref="nameInput" v-model="formData.name" :placeholder="t('请输入接口名称')" />
      </el-form-item>
      <el-form-item :label="t('接口类型')" prop="type">
        <el-radio-group v-model="formData.type">
          <el-radio value="api">HTTP</el-radio>
          <el-radio value="websocket">WebSocket</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :loading="loading" type="primary" @click="handleAddFile">{{ t("确定") }}</el-button>
      <el-button type="warning" @click="handleClose">{{ t("取消") }}</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { useTranslation } from 'i18next-vue'
import { Response, ApidocBanner } from '@src/types'
import { ref, watch } from 'vue';
import { ElMessage, FormInstance, ElInput } from 'element-plus';
import { request } from '@/api/api';
import { useRoute } from 'vue-router';
import { generateEmptyNode } from '@/helper/standaloneUtils';
import { standaloneCache } from '@/cache/standalone';
import { nanoid } from 'nanoid';

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
const { t } = useTranslation()

const loading = ref(false);
const form = ref<FormInstance>();
const nameInput = ref<InstanceType<typeof ElInput>>();
const route = useRoute()
const formData = ref({
  type: 'api',
  name: ''
})
const formRules = {
  name: [
    { required: true, message: t('请输入接口名称'), trigger: 'change' }
  ]
}

// 监听对话框打开状态，自动聚焦输入框
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      nameInput.value?.focus();
    }, 100);
  }
}, {
  immediate: true,
});
/*
|--------------------------------------------------------------------------
| 方法
|--------------------------------------------------------------------------
*/
const handleAddFile = () => {
  form.value?.validate(async (valid) => {
    if(__STANDALONE__ && valid){
      const nodeInfo = generateEmptyNode(nanoid())
      nodeInfo.info.name = formData.value.name
      nodeInfo.projectId = route.query.id as string
      nodeInfo.pid = props.pid
      nodeInfo.sort = Date.now()
      nodeInfo.isDeleted = false;
      await standaloneCache.addDoc(nodeInfo)
      emits('success', {
        _id: nodeInfo._id,
        pid: nodeInfo.pid,
        sort: nodeInfo.sort,
        name: nodeInfo.info.name,
        type: formData.value.type,
        method: nodeInfo.item.method,
        url: nodeInfo.item.url ? nodeInfo.item.url.path : '',
        maintainer: nodeInfo.info.maintainer,
        updatedAt: nodeInfo.updatedAt,
        isFolder: nodeInfo.isFolder,
      }); //一定要先成功然后才关闭弹窗,因为关闭弹窗会清除节点父元素id
      handleClose();
      return;
    }

    if (valid) {
      loading.value = true;
      const params = {
        name: formData.value.name,
        type: formData.value.type === 'websocket' ? 'websocket' : 'api',
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
  formData.value.type = 'api';
  formData.value.name = '';
  form.value?.resetFields();
  emits('update:modelValue', false);
}

</script>

<style lang='scss'>
.add-file-dialog__footer {
  padding-top: 0;
}
.add-file-dialog__content {
  .el-form-item {
    margin-bottom: 10px;
  }
}
.el-dialog__body.add-file-dialog__body {
  padding-bottom: 0;
}
</style>
