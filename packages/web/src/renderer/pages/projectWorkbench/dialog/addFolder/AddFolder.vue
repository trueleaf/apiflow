<template>
  <el-dialog :model-value="modelValue" top="10vh" width="500px" :title="t('新增文件夹')" :before-close="handleClose" data-testid="add-folder-dialog">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px" data-testid="add-folder-form" @submit.prevent="handleAddFolder">
      <el-row>
        <el-col :span="24">
          <el-form-item :label="t('文件夹名称') + '：'" prop="name">
            <el-input ref="inputRef" v-model="formData.name" :placeholder="t('请输入') + t('文件夹名称')" data-testid="add-folder-name-input" clearable />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button data-testid="add-folder-cancel-btn" @click="handleClose">{{ t("取消") }}</el-button>
      <el-button :loading="loading" type="primary" data-testid="add-folder-confirm-btn" @click="handleAddFolder">{{ t('确定/AddFolder') }}</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { FormInstance } from 'element-plus';
import { CommonResponse, ApidocBanner } from '@src/types'
import { useI18n } from 'vue-i18n'
import { computed, nextTick, ref, watch } from 'vue';
import { request } from '@/api/api';
import { message } from '@/helper'
import { useRoute } from 'vue-router';
import { generateEmptyHttpNode } from '@/helper';
import { nanoid } from 'nanoid';
import { apiNodesCache } from '@/cache/nodes/nodesCache';
import { useRuntime } from '@/store/runtime/runtimeStore';

const modelValue = defineModel<boolean>({
  default: false
})
const props = defineProps({
  pid: {
    type: String,
    default: '',
  },
})

const formRef = ref<FormInstance>();
const inputRef = ref<HTMLInputElement>();
const emits = defineEmits(["success"]);
const { t } = useI18n()

const runtimeStore = useRuntime();
const loading = ref(false);
const route = useRoute()
const isStandalone = computed(() => runtimeStore.networkMode === 'offline');
const formData = ref({
  name: ''
})
const rules = {
  name: [{ required: true, message: t('请输入') + t('文件夹名称'), trigger: 'blur' }]
}

let keydownHandler: ((e: KeyboardEvent) => void) | null = null;
watch(modelValue, (newVal) => {
  if (newVal) {
    nextTick(() => {
      inputRef.value?.focus();
    });
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
}, {
  immediate: true,
});
/*
|--------------------------------------------------------------------------
| 方法定义
|--------------------------------------------------------------------------
*/
const handleAddFolder = () => {
  formRef.value?.validate(async (valid) => {
    if(isStandalone.value && valid){
      const nodeInfo = generateEmptyHttpNode(nanoid())
      nodeInfo.info.name = formData.value.name
      nodeInfo.projectId = route.query.id as string
      nodeInfo.pid = props.pid
      nodeInfo.sort = Date.now()
      nodeInfo.isDeleted = false;
      nodeInfo.info.type = 'folder';
      await apiNodesCache.addNode(nodeInfo)
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
      });
      handleClose();
      return;
    }
    if (valid) {
      loading.value = true;
      const params = {
        name: formData.value.name,
        type: 'folder',
        projectId: route.query.id as string,
        pid: props.pid,
      };
      request.post<CommonResponse<ApidocBanner>, CommonResponse<ApidocBanner>>('/api/project/new_doc', params).then((res) => {
        emits('success', res.data);
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
  modelValue.value = false;
}

</script>

<style lang='scss' scoped></style>
