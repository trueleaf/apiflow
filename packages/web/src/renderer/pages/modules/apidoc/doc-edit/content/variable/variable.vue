<template>
  <div class="s-variable">
    <!-- 新增变量 -->
    <SFieldset :title="t('新增变量')" class="left">
      <el-form ref="form" :model="formInfo" :rules="rules" label-width="120px">
        <el-form-item :label="`${t('变量名称')}：`" prop="name">
          <el-input 
            v-model="formInfo.name" 
            :size="config.renderConfig.layout.size" 
            :placeholder="t('请输入变量名称')"
            class="w-100" 
            show-word-limit 
            maxlength="100" 
            clearable>
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
        <el-form-item v-if="formInfo.type === 'string'" :label="`${t('变量值')}：`" prop="stringValue">
          <el-input v-model="formInfo.stringValue" type="textarea" :autosize="{ minRows: 10, maxRows: 10 }"
            :size="config.renderConfig.layout.size" show-word-limit :placeholder="t('请输入任意字符')" class="w-100"
            maxlength="9999" clearable>
          </el-input>
        </el-form-item>
        <!-- 数字 -->
        <el-form-item v-if="formInfo.type === 'number'" :label="`${t('变量值')}：`" prop="numberValue">
          <el-input-number v-model="formInfo.numberValue" :size="config.renderConfig.layout.size"
            :placeholder="t('请输入任意数字')" class="w-100" :controls="false">
          </el-input-number>
        </el-form-item>
        <!-- 布尔值 -->
        <el-form-item v-if="formInfo.type === 'boolean'" :label="`${t('变量值')}：`" prop="booleanValue">
          <el-radio v-model="formInfo.booleanValue" :label="true">ture</el-radio>
          <el-radio v-model="formInfo.booleanValue" :label="false">false</el-radio>
        </el-form-item>
        <!-- 文件值 -->
        <el-form-item v-if="formInfo.type === 'file'" :label="`${t('变量值')}：`" prop="value">
          <el-upload ref="upload" class="upload-demo" @change="handleSelectFile" @exceed="handleExceed" :limit="1"
            :auto-upload="false" :show-file-list="false">
            <template #trigger>
              <el-button size='small'>{{ t('选择文件') }}</el-button>
            </template>
            <template #default>
              <div v-if="formInfo.fileValue.name">
                <div class="d-flex a-center">
                  <span class="flex0 theme-color">{{ t('文件名称：') }}</span>
                  <span :title="formInfo.fileValue.name" class="text-ellipsis gray-600">{{ formInfo.fileValue.name }}</span>
                </div>
                <div class="d-flex a-center">
                  <span class="flex0 theme-color">{{ t('文件路径：') }}</span>
                  <span :title="formInfo.fileValue.path" class="text-ellipsis gray-600">{{ formInfo.fileValue.path }}</span>
                </div>
                <div class="d-flex a-center">
                  <span class="flex0 theme-color">{{ t('mime类型：') }}</span>
                  <span :title="formInfo.fileValue.fileType" class="text-ellipsis gray-600">{{ formInfo.fileValue.fileType }}</span>
                </div>
                <div class="d-flex a-center">
                  <span class="flex0 theme-color">{{ t('注意：') }}&nbsp;&nbsp;&nbsp;</span>
                  <span class="file-notice gray-600">{{ t('若file类型变量大于10kb则会自动转换为本地文件地址\n若协作者无此路径附件则会导致无法获取附件变量\n这也可能导致隐私泄露，请仅添加授信成员') }}</span>
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
      <!-- 在线模式 -->
      <STable
        v-if="!isStandalone"
        ref="table"
        url="/api/project/project_variable"
        delete-many
        delete-url="/api/project/project_variable"
        @delete-many="getData"
        :delete-params="{ projectId: route.query.id }"
        :params="{ projectId: route.query.id }">
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

      <!-- 独立模式 -->
      <el-table
        v-else
        :data="standaloneVariables"
        v-loading="standaloneLoading"
        class="w-100"
      >
        <el-table-column :label="t('变量名称')" align="center">
          <template #default="scope">
            <span>{{ scope.row.name }}</span>
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
            <span>{{ scope.row.type }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="t('创建者')" align="center" prop="creator"></el-table-column>
        <el-table-column :label="t('操作')" align="center">
          <template #default="scope">
            <el-button link type="primary" text @click="handleEdit(scope.row)">{{ t("编辑") }}</el-button>
            <el-button link type="primary" text @click="handleStandaloneDelete(scope.row._id)">{{ t("删除") }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </SFieldset>
    <EditDialog v-model="isShowEditDialog" :editData="oldEditingData" @success="getData" @close="handleCloseEditDialog"></EditDialog>
  </div>
</template>

<script lang="ts" setup>
import SFieldset from '@/components/common/fieldset/g-fieldset.vue'
import STable from '@/components/common/table/g-table.vue'
import { config } from '@src/config/config'
import { useI18n } from 'vue-i18n'
import { computed, ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox, FormInstance, genFileId, UploadFile, UploadInstance, UploadProps, UploadRawFile } from 'element-plus';
import { request } from '@/api/api';
import { useRoute } from 'vue-router';
import SJsonEditor from '@/components/common/json-editor/g-json-editor.vue'
import EditDialog from './dialog/edit.vue'
import { useVariable } from '@/store/apidoc/variables';
import { Response, ApidocVariable } from '@src/types';
import { request as axiosInstance } from '@/api/api'
import { standaloneCache } from '@/cache/standalone';
import { useRuntime } from '@/store/runtime/runtime';


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
const { t } = useI18n()
const rules = ref({
  name: [{ required: true, message: t('请输入变量名称'), trigger: 'blur' }],
  stringValue: [{ required: true, message: t('请输入变量值'), trigger: 'blur' }],
})
const runtimeStore = useRuntime();
const isStandalone = computed(() => runtimeStore.networkMode === 'offline')
const oldEditingData = ref<AddProjectVariableParams | null>(null);
const isShowEditDialog = ref(false);
const loading = ref(false);
const route = useRoute()
const table = ref<{
  getData: () => Promise<{
    data: {
      rows: ApidocVariable[]
    }
  }>
}>();
const form = ref<FormInstance>();
const variableStore = useVariable()
const upload = ref<UploadInstance>()

// 独立模式的数据状态
const standaloneVariables = ref<ApidocVariable[]>([])
const standaloneLoading = ref(false)
/*
|--------------------------------------------------------------------------
| 方法定义
|--------------------------------------------------------------------------
*/
const handleSelectFile = (file: UploadFile) => {
  const filePath = window.electronAPI?.getFilePath(file.raw as File);
  formInfo.value.fileValue = {
    name: file.name,
    path: filePath || '',
    fileType: file.raw!.type,
  }
  return false;
}
const handleExceed: UploadProps['onExceed'] = (files) => {
  upload.value!.clearFiles();
  const file = files[0] as UploadRawFile
  file.uid = genFileId()
  const filePath = window.electronAPI?.getFilePath(file);
  upload.value!.handleStart(file)
  formInfo.value.fileValue = {
    name: file.name,
    path: filePath || '',
    fileType: file.type,
  }
}
const getData = () => {
  if (isStandalone.value) {
    getStandaloneVariables();
  } else {
    table.value?.getData()
    getVariableEnum();
  }
}

// 获取独立模式的变量数据
const getStandaloneVariables = async () => {
  try {
    standaloneLoading.value = true;
    const response = await standaloneCache.getAllVariables(route.query.id as string);
    if (response.code === 0) {
      standaloneVariables.value = response.data;
      // 更新变量枚举
      variableStore.replaceVariables(response.data);
    } else {
      ElMessage.error(response.msg || '获取变量列表失败');
    }
  } catch (error) {
    console.error('获取变量列表失败:', error);
    ElMessage.error('获取变量列表失败');
  } finally {
    standaloneLoading.value = false;
  }
}
//获取变量枚举用于更新全部变量值
const getVariableEnum = () => {
  axiosInstance.get<Response<ApidocVariable[]>, Response<ApidocVariable[]>>('/api/project/project_variable_enum', { params: {
    projectId: route.query.id as string
  } }).then((res) => {
    variableStore.replaceVariables(res.data)
  }).catch((err) => {
    console.error(err);
  })
}
//新增表格数据
const handleAddVariable = () => {
  form.value?.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      const params: AddProjectVariableParams =  {
        projectId: route.query.id as string,
        name: formInfo.value.name.trim(),
        type: formInfo.value.type,
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
          const response = await standaloneCache.addVariable(params);
          if (response.code === 0) {
            ElMessage.success('添加成功');
            getData();
          } else {
            ElMessage.error(response.msg || '添加失败');
          }
        } else {
          // 在线模式
          await request.post('/api/project/project_variable', params);
          getData();
        }
      } catch (err) {
        console.error(err);
        ElMessage.error('操作失败');
      } finally {
        loading.value = false;
      }
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
  ElMessageBox.confirm(t('此操作将永久删除该变量, 是否继续?'), t('提示'), {
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

// 独立模式删除变量
const handleStandaloneDelete = (_id: string) => {
  ElMessageBox.confirm(t('此操作将永久删除该变量, 是否继续?'), t('提示'), {
    confirmButtonText: t('确定'),
    cancelButtonText: t('取消'),
    type: 'warning',
  }).then(async () => {
    try {
      const response = await standaloneCache.deleteVariables([_id]);
      if (response.code === 0) {
        ElMessage.success(t('删除成功'));
        getData();
      } else {
        ElMessage.error(response.msg || '删除失败');
      }
    } catch (err) {
      console.error(err);
      ElMessage.error('删除失败');
    }
  });
}

// 组件挂载时初始化
onMounted(() => {
  try {
    getData();
  } catch (error) {
    console.error('初始化独立缓存失败:', error);
    ElMessage.error('初始化失败');
  }
});
</script>

<style lang='scss' scoped>
.s-variable {
  overflow-y: auto;
  overflow-x: hidden;
  height: calc(100vh - var(--apiflow-doc-nav-height));
  width: 100%;
  padding: 20px 30px;
  display: flex;

  .left {
    flex: 0 0 500px;
    margin-right: 10px;
    .file-notice {
      white-space: pre-line;
      line-height: 1.2;
    }
  }

  .right {
    flex: 1;
  }
}
</style>
