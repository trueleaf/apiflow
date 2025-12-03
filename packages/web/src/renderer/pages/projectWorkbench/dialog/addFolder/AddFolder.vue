<template>
  <el-dialog :model-value="modelValue" top="10vh" width="500px" :title="t('新增文件夹')" :before-close="handleClose" data-testid="add-folder-dialog">
    <SForm ref="form" data-testid="add-folder-form" @submit.prevent="handleAddFolder">
      <SFormItem :label="t('文件夹名称')" prop="name" focus one-line data-testid="add-folder-name-input"></SFormItem>
    </SForm>
    <template #footer>
      <el-button data-testid="add-folder-cancel-btn" @click="handleClose">{{ t("取消") }}</el-button>
      <el-button :loading="loading" type="primary" data-testid="add-folder-confirm-btn" @click="handleAddFolder">{{ t("确定") }}</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { FormInstance } from 'element-plus';
import SForm from '@/components/common/forms/form/ClForm.vue'
import SFormItem from '@/components/common/forms/form/ClFormItem.vue'
import { CommonResponse, ApidocBanner } from '@src/types'
import { useI18n } from 'vue-i18n'
import { computed, ref } from 'vue';
import { request } from '@/api/api';
import { message } from '@/helper'
import { useRoute } from 'vue-router';
import { generateEmptyHttpNode } from '@/helper';
import { nanoid } from 'nanoid';
import { apiNodesCache } from '@/cache/nodes/nodesCache';
import { useRuntime } from '@/store/runtime/runtimeStore';

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

const form = ref<FormInstance>();
const emits = defineEmits(["update:modelValue", "success"]);
const { t } = useI18n()

const runtimeStore = useRuntime();
const loading = ref(false);
const route = useRoute()
const isStandalone = computed(() => runtimeStore.networkMode === 'offline');

let keydownHandler: ((e: KeyboardEvent) => void) | null = null;
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    keydownHandler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !loading.value) {
        e.preventDefault();
        handleAddFolder();
      }
    };
    document.addEventListener('keydown', keydownHandler);
  } else {
    if (keydownHandler) {
      document.removeEventListener('keydown', keydownHandler);
      keydownHandler = null;
    }
  }
});
/*
|--------------------------------------------------------------------------
| 方法定义
|--------------------------------------------------------------------------
*/
const handleAddFolder = () => {
  form.value?.validate(async (valid) => {
    if(isStandalone.value && valid){
      const { formInfo } = form.value as any;
      const nodeInfo = generateEmptyHttpNode(nanoid())
      nodeInfo.info.name = formInfo.name
      nodeInfo.projectId = route.query.id as string
      nodeInfo.pid = props.pid
      nodeInfo.sort = Date.now()
      nodeInfo.isDeleted = false;
      nodeInfo.info.type = 'folder';
      await apiNodesCache.addNode(nodeInfo)
      // const banner = await apiNodesCache.getDocTree(nodeInfo.projectId);
      // bannerStore.changeAllDocBanner(banner);
      emits('success', {
        _id: nodeInfo._id,
        pid: nodeInfo.pid,
        sort: nodeInfo.sort,
        name: nodeInfo.info.name,
        type: 'folder',
        method: nodeInfo.item.method,
        url: nodeInfo.item.url ? nodeInfo.item.url.path : '',
        maintainer: nodeInfo.info.maintainer,
        updatedAt: nodeInfo.updatedAt,

        children: [],
      }); //一定要先成功然后才关闭弹窗,因为关闭弹窗会清除节点父元素id
      handleClose();
      return;
    }
    if (valid) {
      loading.value = true;
      const { formInfo } = form.value as any;
      const params = {
        name: formInfo.name,
        type: 'folder',
        projectId: route.query.id as string,
        pid: props.pid,
      };
      request.post<CommonResponse<ApidocBanner>, CommonResponse<ApidocBanner>>('/api/project/new_doc', params).then((res) => {
        emits('success', res.data); //一定要先成功然后才关闭弹窗,因为关闭弹窗会清除节点父元素id
        handleClose();
      }).catch((err) => {
        console.error(err)
      }).finally(() => {
        loading.value = false;
      });
    } else {
      message.warning(t('请完善必填信息'));
      loading.value = false;
    }
  });
}
//关闭弹窗
const handleClose = () => {
  emits('update:modelValue', false);
}

</script>

<style lang='scss' scoped></style>
