<template>
  <div class="package-wrap">
    <SResizeX :min="600" :max="600" :width="600" name="package" tabindex="1">
      <div class="package-upload">
        <el-form ref="form" :model="formInfo" :rules="rules" label-width="150px">
          <el-form-item label="包名(不允许重复)" prop="name">
            <el-input v-model="formInfo.name" placeholder="请输入包名称" maxlength="125" clearable show-word-limit></el-input>
          </el-form-item>
          <el-form-item label="上传js文件" prop="code">
            <el-upload
              class="w-100"
              drag
              action=""
              accept="text/javascript"
              :show-file-list="false"
              :before-upload="handleBeforeUpload"
              :http-request="requestHook"
            >
              <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            </el-upload>
          </el-form-item>
          <el-form-item label="源码展示">
            <pre class="code-wrap pre">{{ formInfo.code }}</pre>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleAddScript">确定添加</el-button>
          </el-form-item>
        </el-form>
      </div>
    </SResizeX>
    <div class="flex1">
      <el-table :data="tableInfo" stripe border size="small" height="450px">
        <el-table-column prop="name" label="包名" align="center"></el-table-column>
        <el-table-column label="源码" align="center">
          <template #default="scope">
            <el-button type="primary" text @click="handleOpenCodeDialog(scope.row)">源码</el-button>
            <el-button type="primary" text @click="handleDeletepackage(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <SDialog v-model="codeVisible" :title="title">
      <pre class="code-wrap pre">{{ code }}</pre>
    </SDialog>
  </div>
</template>

<script lang="ts" setup>
import { ElMessage, ElMessageBox, UploadRequestHandler, UploadRequestOptions } from 'element-plus';
import { onMounted, Ref, ref } from 'vue';
import db from '@/cache/database';
import SDialog from '@/components/common/dialog/g-dialog.vue'
import SResizeX from '@/components/common/resize/g-resize-x.vue'
import type { FormInstance } from 'element-plus/lib/components/form';
import { $t } from '@/i18n/i18n';

//获取脚本列表
const tableInfo: Ref<{ name: string, code: string }[]> = ref([]);
const getScriptList = () => {
  db.scriptList.toArray().then(res => {
    tableInfo.value = res;
  })
}
/*
|--------------------------------------------------------------------------
| 表单填写
|--------------------------------------------------------------------------
*/
const form: Ref<FormInstance | null> = ref(null);
const formInfo = ref({
  code: '',
  name: '',
});
const rules = ref({
  name: [{ required: true, message: '请输入包名', trigger: 'blur' }],
  code: [{ required: true, message: '请上传js文件', trigger: 'change' }],
});
//检查文件格式和文件大小
const handleBeforeUpload = (file: File) => {
  const standerFileType = file.type; //标准类型
  const matchSuffix = file.name.match(/(?<=\.)[^.]+$/); //根据后缀获取类型
  const suffixFileType = matchSuffix ? matchSuffix[0] : '';
  if (!standerFileType && !suffixFileType) {
    ElMessage({
      message: $t('未知的文件格式，无法解析'),
      grouping: true,
      type: 'error',
    })
    return false;
  }
  if (standerFileType !== 'text/javascript') {
    ElMessage({
      message: $t('仅支持js文件上传'),
      grouping: true,
      type: 'error',
    })
    return false;
  }
  if (file.size > 1024 * 1024 * 20) {
    ElMessage({
      message: $t('文件大小不超过20M'),
      grouping: true,
      type: 'error',
    })
    return false;
  }
  return true;
}
//发送请求钩子
const requestHook: UploadRequestHandler = (options: UploadRequestOptions) => {
  const { file } = options;
  return new Promise((resolve, reject) => {
    file.text().then((stringScript) => {
      formInfo.value.code = stringScript
      resolve(stringScript)
    }).catch(err => {
      reject(err)
    })
  })
}
//新增脚本
const handleAddScript = () => {
  if (form.value) {
    form.value.validate(async (valid) => {
      if (valid) {
        const scriptList = await db.scriptList.toArray();
        if (scriptList.find(v => v.name === formInfo.value.name)) {
          ElMessage.warning('当前安装包名称已存在')
        } else {
          db.scriptList.add({
            name: formInfo.value.name,
            code: formInfo.value.code
          })
          getScriptList();
        }
      }
    })
  }
}
/*
|--------------------------------------------------------------------------
| table操作相关
|--------------------------------------------------------------------------
*/
const codeVisible = ref(false);
const code = ref('');
const title = ref('');
//打开安装包弹窗
const handleOpenCodeDialog = (info: { name: string, code: string }) => {
  codeVisible.value = true;
  code.value = info.code;
  title.value = info.name;
}
//删除包
const handleDeletepackage = async (info: { name: string, code: string }) => {
  ElMessageBox.confirm('此操作将永久删除此条记录, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await db.scriptList.where('name').anyOf(info.name).delete();
    getScriptList();
  }).catch((err) => {
    console.error(err);
  });
}
//读取脚本信息
onMounted(() => {
  getScriptList();
})
</script>

<style lang='scss' scoped>
.package-wrap {
    display: flex;
    height: calc(100vh - #{size(100)});
    overflow-y: auto;
    .drag-wrap {
        border-right: 1px solid var(--gray-500);
    }
    .package-upload {
        padding: size(20);
        height: 100%;
    }
}
.code-wrap {
    width: 100%;
    min-height: size(200);
    max-height: size(400);
    overflow-y: auto;
}
</style>
