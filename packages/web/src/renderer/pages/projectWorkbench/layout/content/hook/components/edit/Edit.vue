<template>
  <div v-if="codeInfo && codeInfo._id" class="hook-edit-wrap d-flex">
    <SFieldset title="代码编写" class="w-50">
      <SEditor v-model="code" class="editor"></SEditor>
      <div class="operation">
        <el-button type="primary" class="mb-2" @click="executeCode">执行代码</el-button>
        <el-button type="primary" class="mb-2" @click="dialogVisible = true">确认修改</el-button>
        <el-button @click="handleResetCode">重置代码</el-button>
      </div>
    </SFieldset>
    <SFieldset title="结果值" class="w-50">
      <div class="json-view-wrap">
        <SJsonEditor :model-value="result" read-only></SJsonEditor>
      </div>
    </SFieldset>
    <el-dialog v-model="dialogVisible" title="修改代码">
      <SForm ref="form" :edit-data="editData">
        <SFormItem label="脚本名称" prop="codeName" one-line required></SFormItem>
        <SFormItem label="备注" prop="remark" one-line></SFormItem>
      </SForm>
      <template #footer>
        <div>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button :loading="loading" type="primary" @click="handleSaveCode">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
  <el-empty description="代码列表中点击修改按钮进行修改"></el-empty>
</template>

<script lang="ts" setup>
import { ref, Ref, PropType, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import 'element-plus/es/components/message/style/css';
import SFieldset from '@/components/common/fieldset/GFieldset.vue'
import SJsonEditor from '@/components/common/jsonEditor/GJsonEditor.vue'
import SForm from '@/components/common/forms/form/GForm.vue'
import SFormItem from '@/components/common/forms/form/GFormItem.vue'
import {
  getUrlInfo,
  convertApidocPropertyToObject,
  getResponseParamsByHttpNode,
} from '@/helper';
import type { ApidocCodeInfo } from '@src/types'
import { request } from '@/api/api';
import { router } from '@/router';
import SEditor from '../editor/Editor.vue'
import { useApidoc } from '@/store/apidoc/apidocStore';

type CodeInfo = {
  codeName: string,
  remark: string,
  _id: string
}
const props = defineProps({
  codeInfo: {
    type: Object as PropType<ApidocCodeInfo>,
    default() {
      return {};
    }
  }
})

const worker = new Worker('/sandbox/hook/worker.js');
const projectId = router.currentRoute.value.query.id as string; //项目id
const apidocStore = useApidoc()
const defaultCode = `/**
 * 请勿修改函数名,返回值即为处理后结果值
 * 编辑器支持智能提示
 */
function codeHook(docInfo) {
    return docInfo
}
`
const code = ref(defaultCode); //脚本源码
const editData: Ref<ApidocCodeInfo | undefined> = ref(undefined); //编辑中数据
const result = ref(''); //结果值
//错误处理
worker.addEventListener('error', (error) => {
  result.value = error.message;
  console.error(error);
});
//执行代码
const executeCode = async () => {
  worker.postMessage({
    type: 'init',
    value: {
      raw: JSON.parse(JSON.stringify(apidocStore.apidoc)),
      url: await getUrlInfo(apidocStore.apidoc),
      queryParams: await convertApidocPropertyToObject(apidocStore.apidoc.item.queryParams),
      pathParams: await convertApidocPropertyToObject(apidocStore.apidoc.item.paths),
      jsonParams: apidocStore.apidoc.item.requestBody.rawJson,
      formdataParams: await convertApidocPropertyToObject(apidocStore.apidoc.item.requestBody.formdata),
      urlencodedParams: await convertApidocPropertyToObject(apidocStore.apidoc.item.requestBody.urlencoded),
      headers: await convertApidocPropertyToObject(apidocStore.apidoc.item.headers),
      method: apidocStore.apidoc.item.method,
      response: getResponseParamsByHttpNode(apidocStore.apidoc),
    },
  });
  worker.postMessage({
    type: 'generate-code',
    value: code.value
  });
  worker.addEventListener('message', (e) => {
    if (typeof e.data !== 'object') {
      return;
    }
    if (e.data.type === 'success') {
      result.value = e.data.value;
    }
  })
}
//重置代码
const handleResetCode = () => {
  code.value = defaultCode;
}
//保存代码
const dialogVisible = ref(false);
const loading = ref(false);
const form: Ref<null | { formInfo: CodeInfo }> = ref(null);
const handleSaveCode = () => {
  loading.value = true;
  const params = {
    _id: form.value?.formInfo._id,
    projectId,
    codeName: form.value?.formInfo.codeName,
    remark: form.value?.formInfo.remark,
    code: code.value
  };
  request.put('/api/apidoc/project/code', params).then(() => {
    ElMessage.success('修改成功')
    dialogVisible.value = false;
  }).catch((err) => {
    console.error(err);
  }).finally(() => {
    loading.value = false;
  });
}
//初始化
onMounted(() => {
  // const codeInfo = httpNodeCache.getEditCodeInfoById(projectId);
  editData.value = props.codeInfo
  code.value = props.codeInfo?.code;
})
</script>

<style lang='scss' scoped>
.hook-edit-wrap {
  .SFieldset>.content {
    overflow-y: visible;
  }

  .editor {
    height: calc(100vh - 240px);
  }

  .operation {
    position: absolute;
    right: 0;
    top: 50%;
    display: flex;
    flex-direction: column;

    .el-button+.el-button {
      margin-left: 0;
    }
  }

  .json-view-wrap {
    height: calc(100vh - 240px);
    // overflow-y: auto;
  }
}
</style>
