<template>
  <el-dialog :model-value="modelValue" top="10vh" :title="t('修改变量')" :before-close="handleClose">
    <el-form ref="formInstance" :model="formInfo" :rules="rules" label-width="120px">
      <el-form-item :label="`${t('变量名称')}：`" prop="name">
        <el-input v-model="formInfo.name" :size="config.renderConfig.layout.size" :placeholder="t('请输入变量名称')"
          class="w-100" show-word-limit maxlength="100" clearable @keydown.enter="handleEditVariable">
        </el-input>
      </el-form-item>
      <el-form-item :label="`${t('值类型')}：`" prop="type">
        <el-select v-model="formInfo.type" :size="config.renderConfig.layout.size" class="w-100">
          <el-option value="string" label="string"></el-option>
          <el-option value="number" label="number"></el-option>
          <el-option value="boolean" label="boolean"></el-option>
          <el-option value="null" label="null"></el-option>
          <el-option value="file" label="file"></el-option>
          <el-option value="any" label="any"></el-option>
        </el-select>
      </el-form-item>
      <!-- 字符串 -->
      <el-form-item v-if="formInfo.type === 'string'" :label="`${t('变量值')}：`" prop="value">
        <el-input v-model="formInfo.stringValue" type="textarea" :autosize="{ minRows: 10, maxRows: 10 }"
          :size="config.renderConfig.layout.size" show-word-limit :placeholder="t('请输入任意字符')" class="w-100"
          @keydown.enter="handleEditVariable" maxlength="9999" clearable>
        </el-input>
      </el-form-item>
      <!-- 数字 -->
      <el-form-item v-if="formInfo.type === 'number'" :label="`${t('变量值')}：`" prop="value">
        <el-input-number v-model="formInfo.numberValue" :size="config.renderConfig.layout.size"
          @keydown.enter="handleEditVariable" :placeholder="t('请输入任意数字')" class="w-100" :controls="false">
        </el-input-number>
      </el-form-item>
      <!-- 布尔值 -->
      <el-form-item v-if="formInfo.type === 'boolean'" :label="`${t('变量值')}：`" prop="value">
        <el-radio v-model="formInfo.booleanValue" :label="true">ture</el-radio>
        <el-radio v-model="formInfo.booleanValue" :label="false">false</el-radio>
      </el-form-item>
      <!-- 文件值 -->
      <el-form-item v-if="formInfo.type === 'file'" :label="`${t('变量值')}：`" prop="value">
        <el-upload ref="uploadInstance" class="upload-demo" @change="handleSelectFile" @exceed="handleExceed" :limit="1"
          :auto-upload="false" :show-file-list="false">
          <template #trigger>
            <el-button size='small'>选择文件</el-button>
          </template>
          <template #default>
            <div v-if="formInfo.fileValue.name">
              <div class="d-flex a-center">
                <span class="flex0 theme-color">文件名称：</span>
                <span :title="formInfo.fileValue.name" class="text-ellipsis">{{ formInfo.fileValue.name }}</span>
              </div>
              <div class="d-flex a-center">
                <span class="flex0 theme-color">文件路径：</span>
                <span :title="formInfo.fileValue.path" class="text-ellipsis">{{ formInfo.fileValue.path }}</span>
              </div>
              <div class="d-flex a-center">
                <span class="flex0 theme-color">mime类型：</span>
                <span :title="formInfo.fileValue.fileType" class="text-ellipsis">{{ formInfo.fileValue.fileType
                }}</span>
              </div>
            </div>
          </template>
        </el-upload>
      </el-form-item>
      <!-- 任意类型 -->
      <el-form-item v-if="formInfo.type === 'any'" :label="`${t('变量值')}：`" prop="value">
        <div class="h-300px w-100 border-gray-400">
          <SJsonEditor v-model="formInfo.anyValue" ref="jsonComponent" :config="{
            language: 'javascript',
            lineNumbers: 'off',
            placeholder: `eg: \nMath.random() \n new Date()  \n'i am a string' \n123 \ntrue \nfalse \nnull \n{a: 1} \n[a, 1, 2, 3] \n(() => { 
                const num = 3;
                return Math.random() + num 
                })()`,
          }">
          </SJsonEditor>
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">{{ t("取消") }}</el-button>
      <el-button :loading="loading" type="primary" @click="handleEditVariable">{{ t("确定") }}</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { request } from '@/api/api';
import { config } from '@src/config/config';
import { ElMessage, FormInstance, genFileId, UploadFile, UploadInstance, UploadProps, UploadRawFile } from 'element-plus';
import { useI18n } from 'vue-i18n'
import { computed, nextTick, PropType, ref, watch } from 'vue';
import { AddProjectVariableFormInfo, AddProjectVariableParams } from '../variable.vue';
import SJsonEditor from '@/components/common/json-editor/g-json-editor.vue'
import { useRoute } from 'vue-router';
import { standaloneCache } from '@/cache/standalone';
import { useRuntime } from '@/store/runtime/runtime';
import { useVariable } from '@/store/apidoc/variables';


const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  editData: {
    type: Object as PropType<AddProjectVariableParams | null>,
    default: () => ({}),
  },
})
const emits = defineEmits(['update:modelValue', 'success'])
const formInfo = ref<AddProjectVariableFormInfo>({
  name: '',
  stringValue: '',
  numberValue: 0,
  booleanValue: true,
  nullValue: null,
  anyValue: '',
  fileValue: {
    name: "",
    path: '',
    fileType: '',
  },
  type: 'string',
})
const { t } = useI18n()

const rules = ref({
  name: [{ required: true, message: t('请输入变量名称'), trigger: 'blur' }],
})
const loading = ref(false);
const formInstance = ref<FormInstance>();
const uploadInstance = ref<UploadInstance>()
const route = useRoute()
const runtimeStore = useRuntime();
const isStandalone = computed(() => runtimeStore.networkMode === 'offline')

watch(() => props.editData, (val) => {
  if (!val) {
    return
  }
  formInfo.value.name = val.name
  formInfo.value.type = val.type
  if (val.type === 'string') {
    formInfo.value.stringValue = val.value
  } else if (val.type === 'number') {
    formInfo.value.numberValue = Number(val.value)
  } else if (val.type === 'boolean') {
    formInfo.value.booleanValue = JSON.parse(val.value)
  } else if (val.type === 'any') {
    formInfo.value.anyValue = val.value
  } else if (val.type === 'file') {
    formInfo.value.fileValue = {
      name: val.fileValue.name,
      path: val.fileValue.path,
      fileType: val.fileValue.fileType,
    }
  }
}, { immediate: true })
/*
|--------------------------------------------------------------------------
| 方法定义
|--------------------------------------------------------------------------
*/
const handleSelectFile = (file: UploadFile) => {
  const filePath = window.electronAPI?.fileManager.getFilePath(file.raw as File);
  formInfo.value.fileValue = {
    name: file.name,
    path: filePath || '',
    fileType: file.raw!.type,
  }
  return false;
}
const handleExceed: UploadProps['onExceed'] = (files) => {
  uploadInstance.value!.clearFiles();
  const file = files[0] as UploadRawFile
  const filePath = window.electronAPI?.fileManager.getFilePath(file);
  file.uid = genFileId()
  uploadInstance.value!.handleStart(file)
  formInfo.value.fileValue = {
    name: file.name,
    path: filePath || '',
    fileType: file.type,
  }
}
const handleClose = () => {
  emits('update:modelValue', false)
}
//修改变量
const handleEditVariable = () => {
  formInstance.value?.validate(async (valid) => {
    if (valid && props.editData) {
      loading.value = true;
      const params: AddProjectVariableParams = {
        projectId: route.query.id as string,
        name: formInfo.value.name.trim(),
        type: formInfo.value.type,
        _id: props.editData._id,
        value: "",
        fileValue: {
          name: '',
          path: '',
          fileType: '',
        }
      };
      if (formInfo.value.type === 'string') {
        params.value = formInfo.value.stringValue.trim();
      } else if (formInfo.value.type === 'number') {
        params.value = formInfo.value.numberValue.toString();
      } else if (formInfo.value.type === 'boolean') {
        params.value = formInfo.value.booleanValue.toString();
      } else if (formInfo.value.type === 'null') {
        params.value = 'null';
      } else if (formInfo.value.type === 'any') {
        params.value = formInfo.value.anyValue;
      } else if (formInfo.value.type === 'file') {
        params.fileValue = formInfo.value.fileValue;
      }

      try {
        if (isStandalone.value) {
          // 独立模式
          const response = await standaloneCache.updateVariable(props.editData._id!, {
            name: params.name,
            type: params.type,
            value: params.value,
            fileValue: params.fileValue
          });
          if (response.code === 0) {
            ElMessage.success('修改成功');
            handleClose();
            emits('success');
          } else {
            ElMessage.error(response.msg || '修改失败');
          }
        } else {
          // 在线模式
          await request.put('/api/project/project_variable', params);
          handleClose();
          emits('success');
        }
      } catch (err) {
        console.error(err);
        ElMessage.error('操作失败');
      } finally {
        loading.value = false;
      }
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
