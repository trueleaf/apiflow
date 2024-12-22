<template>
  <div class="hook-add-wrap d-flex">
    <SFieldset title="代码编写" class="w-50">
      <SEditor v-model="code" class="editor" @change="handleChangeCode"></SEditor>
      <div class="operation">
        <el-button type="primary" class="mb-2" @click="executeCode">执行代码</el-button>
        <el-button type="primary" class="mb-2" @click="dialogVisible = true">保存代码</el-button>
        <el-button @click="handleResetCode">重置代码</el-button>
      </div>
    </SFieldset>
    <SFieldset title="结果值" class="w-50">
      <div class="json-view-wrap">
        <SJsonEditor :model-value="result" read-only></SJsonEditor>
      </div>
    </SFieldset>
    <SDialog v-model="dialogVisible" title="保存代码">
      <SForm ref="form">
        <SFormItem label="脚本名称" prop="codeName" one-line required></SFormItem>
        <SFormItem label="备注" prop="remark" one-line></SFormItem>
      </SForm>
      <template #footer>
        <div>
          <el-button :loading="loading" type="primary" @click="handleSaveCode">确定</el-button>
          <el-button type="warning" @click="dialogVisible = false">取消</el-button>
        </div>
      </template>
    </SDialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, Ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import 'element-plus/es/components/message/style/css';
import SFieldset from '@/components/common/fieldset/g-fieldset.vue'
import SJsonEditor from '@/components/common/json-editor/g-json-editor.vue'
import SForm from '@/components/common/forms/form/g-form.vue'
import SFormItem from '@/components/common/forms/form/g-form-item.vue'
import SDialog from '@/components/common/dialog/g-dialog.vue'

import {
  apidocFormatUrl,
  apidocFormatQueryParams,
  apidocFormatPathParams,
  apidocFormatJsonBodyParams,
  apidocFormatFormdataParams,
  apidocFormatUrlencodedParams,
  apidocFormatHeaderParams,
  apidocFormatResponseParams,
} from '@/helper';
// import type { ApidocCodeInfo } from "@src/types/global"
import { request } from '@/api/api';
import { router } from '@/router';
import { apidocCache } from '@/cache/apidoc';
import SEditor from '../editor/editor.vue'
import { useApidoc } from '@/store/apidoc/apidoc';

type CodeInfo = {
  codeName: string,
  remark: string
}

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
const code = ref(defaultCode);
const result = ref('');
//错误处理
worker.addEventListener('error', (error) => {
  result.value = error.message;
  console.error(error);
});
//代码更新缓存带啊吗
const handleChangeCode = () => {
  apidocCache.setHookCode(projectId, code.value);
}
//执行代码
const executeCode = () => {
  worker.postMessage({
    type: 'init',
    value: {
      raw: JSON.parse(JSON.stringify(apidocStore.apidoc)),
      url: apidocFormatUrl(apidocStore.apidoc),
      queryParams: apidocFormatQueryParams(apidocStore.apidoc),
      pathParams: apidocFormatPathParams(apidocStore.apidoc),
      jsonParams: apidocFormatJsonBodyParams(apidocStore.apidoc),
      formdataParams: apidocFormatFormdataParams(apidocStore.apidoc),
      urlencodedParams: apidocFormatUrlencodedParams(apidocStore.apidoc),
      headers: apidocFormatHeaderParams(apidocStore.apidoc),
      method: apidocStore.apidoc.item.method,
      response: apidocFormatResponseParams(apidocStore.apidoc),
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
  apidocCache.setHookCode(projectId, defaultCode);
}
//保存代码
const dialogVisible = ref(false);
const loading = ref(false);
const form: Ref<null | { formInfo: CodeInfo }> = ref(null);
const handleSaveCode = () => {
  loading.value = true;
  const params = {
    projectId,
    codeName: form.value?.formInfo.codeName,
    remark: form.value?.formInfo.remark,
    code: code.value
  };
  request.post('/api/apidoc/project/code', params).then(() => {
    ElMessage.success('保存成功');
    dialogVisible.value = false;
  }).catch((err) => {
    console.error(err);
  }).finally(() => {
    loading.value = false;
  });
}

//初始化
onMounted(() => {
  //处理编辑逻辑
  const cacheCode = apidocCache.getHookCodeById(projectId);
  code.value = cacheCode || defaultCode;
})

</script>

<style  scoped>
.hook-add-wrap {
  .SFieldset>.content {
    overflow-y: visible;
  }

  .editor {
    height: calc(100vh - #{size(240)});
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
    height: calc(100vh - #{size(240)});
    // overflow-y: auto;
  }
}
</style>
