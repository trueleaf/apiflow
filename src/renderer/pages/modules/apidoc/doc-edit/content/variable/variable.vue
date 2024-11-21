<template>
  <div class="s-variable">
    <!-- 新增变量 -->
    <SFieldset :title="t('新增变量')" class="left">
      <el-form ref="form" :model="formInfo" :rules="rules" label-width="120px">
        <el-form-item :label="`${t('变量名称')}：`" prop="name">
          <el-input v-model="formInfo.name" :size="config.renderConfig.layout.size" :placeholder="t('请输入变量名称')"
            class="w-100" show-word-limit maxlength="100" clearable>
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
            maxlength="9999" clearable>
          </el-input>
        </el-form-item>
        <!-- 数字 -->
        <el-form-item v-if="formInfo.type === 'number'" :label="`${t('变量值')}：`" prop="value">
          <el-input-number v-model="formInfo.numberValue" :size="config.renderConfig.layout.size"
            :placeholder="t('请输入任意数字')" class="w-100" :controls="false">
          </el-input-number>
        </el-form-item>
        <!-- 布尔值 -->
        <el-form-item v-if="formInfo.type === 'boolean'" :label="`${t('变量值')}：`" prop="value">
          <el-radio v-model="formInfo.booleanValue" :label="true">ture</el-radio>
          <el-radio v-model="formInfo.booleanValue" :label="false">false</el-radio>
        </el-form-item>
        <!-- 文件值 -->
        <el-form-item v-if="formInfo.type === 'file'" :label="`${t('变量值')}：`" prop="value">
          <el-upload ref="upload" class="upload-demo" @change="handleSelectFile" @exceed="handleExceed" :limit="1"
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
                  <span :title="formInfo.fileValue.fileType" class="text-ellipsis">{{ formInfo.fileValue.fileType }}</span>
                </div>
              </div>
            </template>
          </el-upload>
        </el-form-item>
        <!-- 任意类型 -->
        <el-form-item v-if="formInfo.type === 'any'" :label="`${t('变量值')}：`" prop="value">
          <div class="h-300px w-100 border-gray-400">
            <SJsonEditor 
              v-model="formInfo.anyValue"
              ref="jsonComponent" 
              :config="{
                language: 'javascript',
                lineNumbers: 'off',
                placeholder: `eg: \nMath.random() \n new Date()  \n'i am a string' \n123 \ntrue \nfalse \nnull \n{a: 1} \n[a, 1, 2, 3] \n(() => { 
                const num = 3;
                return Math.random() + num 
                })()`,
              }"
            >
            </SJsonEditor>
          </div>
        </el-form-item>
        <div class="d-flex j-end">
          <el-button :loading="loading" type="primary" @click="handleAddVariable">{{ t("确认添加") }}</el-button>
        </div>
      </el-form>
    </SFieldset>
    <!-- 变量列表 -->
    <SFieldset :title="t('变量列表')" class="right">
      <STable ref="table" url="/api/project/project_variable" delete-many delete-url="/api/project/project_variable"
        :delete-params="{ projectId: route.query.id }" :params="{ projectId: route.query.id }">
        <el-table-column :label="t('变量名称')" align="center">
          <template #default="scope">
            <el-input v-if="scope.row.__active" v-model="scope.row.name" :size="config.renderConfig.layout.size"
              class="w-100" maxlength="100" clearable></el-input>
            <span v-else>{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="t('变量值')" align="center" show-overflow-tooltip>
          <template #default="scope">
            <div v-if="scope.row.type === 'file'">
              <div>
                <span>文件名称：</span>
                <span>{{ scope.row.fileValue.name }}</span>
              </div>
              <div>
                <span>文件路径：</span>
                <span>{{ scope.row.fileValue.path }}</span>
              </div>
              <div>
                <span>mime类型：</span>
                <span>{{ scope.row.fileValue.fileType }}</span>
              </div>
            </div>
            <span v-else>{{ scope.row.value }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="t('变量类型')" align="center">
          <template #default="scope">
            <el-select v-if="scope.row.__active" v-model="scope.row.type" :size="config.renderConfig.layout.size"
              class="w-100">
              <el-option value="string" label="string"></el-option>
              <el-option value="number" label="number"></el-option>
              <el-option value="boolean" label="boolean"></el-option>
              <el-option value="null" label="null"></el-option>
              <el-option value="any" label="any"></el-option>
              <el-option value="file" label="file"></el-option>
            </el-select>
            <span v-else>{{ scope.row.type }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="t('创建者')" align="center" prop="creator"></el-table-column>
        <el-table-column :label="t('操作')" align="center">
          <template #default="scope">
            <el-button link type="primary" text @click="handleEdit(scope.row)">{{ t("编辑") }}</el-button>
            <el-button link type="primary" text @click="handleDelete(scope.row._id)">{{ t("删除") }}</el-button>
          </template>
        </el-table-column>
      </STable>
    </SFieldset>
    <EditDialog v-model="isShowEditDialog" :editData="oldEditingData" @success="getData" @close="handleCloseEditDialog"></EditDialog>
  </div>
</template>

<script lang="ts" setup>
import { useApidocBaseInfo } from '@/store/apidoc/base-info';
import { ApidocProjectVariable } from '@src/types/apidoc/base-info';
import SFieldset from '@/components/common/fieldset/g-fieldset.vue'
import STable from '@/components/common/table/g-table.vue'
import { config } from '@src/config/config'
import { t } from 'i18next'
import { ref } from 'vue';
import { ElMessage, ElMessageBox, FormInstance, genFileId, UploadFile, UploadInstance, UploadProps, UploadRawFile } from 'element-plus';
import { request } from '@/api/api';
import { useRoute } from 'vue-router';
import SJsonEditor from '@/components/common/json-editor/g-json-editor.vue'
import EditDialog from './dialog/edit.vue'



export type AddProjectVariableParams = {
  _id?: string;
  projectId: string,
  name: string,
  value: string,
  type: 'string' | 'number' | 'boolean' | 'null' | 'any' | 'file',
  fileValue: {
    name: string,
    path: string,
    fileType: string,
  }
}
export type AddProjectVariableFormInfo = {
  name: string,
  stringValue: string,
  numberValue: number,
  booleanValue: boolean,
  nullValue: null,
  anyValue: string,
  fileValue: {
    name: string,
    path: string,
    fileType: string,
  },
  type: 'string' | 'number' | 'boolean' | 'null' | 'any' | 'file',
}
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
const rules = ref({
  name: [{ required: true, message: t('请输入变量名称'), trigger: 'blur' }],
})
const oldEditingData = ref<AddProjectVariableParams | null>(null);
const isShowEditDialog = ref(false);
const loading = ref(false);
const route = useRoute()
const table = ref<{
  getData: () => Promise<{
    data: {
      rows: ApidocProjectVariable[]
    }
  }>
}>();
const form = ref<FormInstance>();
const apidocBaseInfoStore = useApidocBaseInfo();
const upload = ref<UploadInstance>()
/*
|--------------------------------------------------------------------------
| 方法定义
|--------------------------------------------------------------------------
*/
const handleSelectFile = (file: UploadFile) => {
  formInfo.value.fileValue = {
    name: file.name,
    path: file.raw!.path,
    fileType: file.raw!.type,
  }
  return false;
}
const handleExceed: UploadProps['onExceed'] = (files) => {
  upload.value!.clearFiles();
  const file = files[0] as UploadRawFile
  file.uid = genFileId()
  upload.value!.handleStart(file)
  formInfo.value.fileValue = {
    name: file.name,
    path: file.path,
    fileType: file.type,
  }
}
const getData = () => {
  table.value?.getData().then((res) => {
    apidocBaseInfoStore.changeVariables(res.data.rows)
  });
}
//新增表格数据
const handleAddVariable = () => {
  form.value?.validate((valid) => {
    if (valid) {
      loading.value = true;
      const params: AddProjectVariableParams =  {
        projectId: route.query.id as string,
        name: formInfo.value.name,
        type: formInfo.value.type,
        value: "",
        fileValue: {
          name: '',
          path: '',
          fileType: '',
        }
      };
      if (formInfo.value.type === 'string') {
        params.value = formInfo.value.stringValue;
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
      request.post('/api/project/project_variable', params).then(() => {
        getData();
      }).catch((err) => {
        console.error(err);
      }).finally(() => {
        loading.value = false;
      });
    }
  });
}
const handleCloseEditDialog = () => {
  isShowEditDialog.value = false;
}
//让当前行处于修改状态
const handleEdit = (row: AddProjectVariableParams) => {
  isShowEditDialog.value = true;
  oldEditingData.value = JSON.parse(JSON.stringify(row));
}
//=====================================删除====================================//
//删除一个数据
const handleDelete = (_id: string) => {
  ElMessageBox.confirm(t('此操作将永久删除该域名, 是否继续?'), t('提示'), {
    confirmButtonText: t('确定'),
    cancelButtonText: t('取消'),
    type: 'warning',
  }).then(() => {
    const params = {
      ids: [_id],
      projectId: route.query.id,
    };
    request.delete('/api/project/project_variable', { data: params }).then(() => {
      ElMessage.success(t('删除成功'));
      getData();
    }).catch((err) => {
      console.error(err);
    });
  });
}
</script>

<style lang="scss" scoped>
.s-variable {
  overflow-y: auto;
  height: calc(100vh - #{size(100)});
  width: 100%;
  padding: size(20) size(30);
  display: flex;

  .left {
    flex: 0 0 size(500);
    margin-right: size(10);
  }

  .right {
    flex: 1;
  }
}
</style>
