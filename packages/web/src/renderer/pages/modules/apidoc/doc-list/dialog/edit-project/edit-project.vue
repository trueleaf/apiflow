<template>
  <el-dialog :model-value="modelValue" top="10vh" width="35vw" :title="t('修改项目')" :before-close="handleClose">
    <el-form ref="form" :model="formInfo" :rules="rules" label-width="150px" @submit.prevent="() => {}">
      <el-form-item :label="`${t('项目名称')}`" prop="projectName">
        <el-input v-model="formInfo.projectName" v-focus-select :size="config.renderConfig.layout.size"
          :placeholder="t('请输入项目名称')" @keydown.enter="handleEditProject"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :loading="loading" type="primary" @click="handleEditProject">{{ t("确定") }}</el-button>
      <el-button type="warning" @click="handleClose">{{ t("取消") }}</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { request } from '@/api/api';
import { config } from '@src/config/config';
import { ElMessage, FormInstance } from 'element-plus';
import { useI18n } from 'vue-i18n'
import { computed, nextTick, ref, watch } from 'vue';
import { standaloneCache } from '@/cache/standalone';
import { useRuntime } from '@/store/runtime/runtime';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  projectId: {
    type: String,
    default: '',
  },
  projectName: {
    type: String,
    default: '',
  },
})
const emits = defineEmits(['update:modelValue', 'success'])
const { t } = useI18n()

const runtimeStore = useRuntime();
const isStandalone = computed(() => runtimeStore.networkMode === 'offline')
const formInfo = ref({
  projectName: '',
})
const rules = ref({
  projectName: [{ required: true, trigger: 'blur', message: t('请填写项目名称') }],
})
const loading = ref(false);
const form = ref<FormInstance>();

watch(() => props.projectName, (val) => {
  formInfo.value.projectName = val
}, { immediate: true })

const handleClose = () => {
  emits('update:modelValue', false)
}
//修改项目
const handleEditProject = () => {
  form.value?.validate(async (valid) => {
    if(isStandalone.value && valid){
      await standaloneCache.updateProject(props.projectId, {
        projectName: formInfo.value.projectName,
      });
      handleClose();
      // 在standalone模式下也传递编辑后的数据
      emits('success', {
        id: props.projectId,
        name: formInfo.value.projectName,
      });
      return;
    }
    if (valid) {
      loading.value = true;
      const params = {
        projectName: formInfo.value.projectName,
        _id: props.projectId,
      };
      request.put('/api/project/edit_project', params).then((res) => {
        handleClose();
        emits('success', {
          id: res.data,
          name: formInfo.value.projectName,
        });
      }).catch((err) => {
        console.error(err);
      }).finally(() => {
        loading.value = false;
      });
    } else {
      nextTick(() => {
        const input: HTMLInputElement = document.querySelector('.el-form-item.is-error input') as HTMLInputElement;
        if (input) {
          input.focus();
        }
      });
      ElMessage.warning(t('请完善必填信息'));
      loading.value = false;
    }
  })
}
</script>
