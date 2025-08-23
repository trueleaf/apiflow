/*
<template>
  <SDialog :model-value="modelValue" top="10vh" width="85%" :title="t('域名、接口前缀')" @close="handleClose">
    <div class="host-wrap">
      <!-- 左侧新增数据 -->
      <SResizeX :min="450" :max="700" :width="450" name="curd-host" tabindex="1" class="add-host">
        <SFieldset :title="t('什么是接口前缀')">
          <img :src="require('@/assets/imgs/apidoc/prefix.png')" alt="接口前缀" class="px-2 border-gray-400">
          <img :src="require('@/assets/imgs/apidoc/prefix.gif')" alt="接口前缀" class="px-2 border-gray-400">
        </SFieldset>
        <el-form ref="form" :model="formInfo" :rules="rules" label-width="140px" class="mt-2">
          <el-form-item :label="`${t('前缀名称')}：`" prop="name">
            <el-input v-model="formInfo.name" placeholder="例如：张三本地" :size="config.renderConfig.layout.size"
              class="w-100" maxlength="15" clearable show-word-limit></el-input>
          </el-form-item>
          <el-form-item :label="`${t('前缀值')}：`" prop="name">
            <el-input v-model="formInfo.url" placeholder="例如：http://192.168.0.31:8080"
              :size="config.renderConfig.layout.size" class="w-100" maxlength="255" clearable
              show-word-limit></el-input>
          </el-form-item>
          <el-form-item :label="`${t('是否共享')}：`" prop="name">
            <el-radio-group v-model="formInfo.isLocal">
              <el-radio :value="true">{{ t("仅自身可见") }}</el-radio>
              <el-radio :value="false">{{ t("项目内成员可见") }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <div class="d-flex j-end">
            <el-button v-success="isSuccess" :loading="loading" type="primary" @click="handleAddHost">确认添加</el-button>
          </div>
        </el-form>
      </SResizeX>
      <!-- 右侧数据展示 -->
      <div class="flex1">
        <STable ref="table" url="/api/project/doc_service" :params="{ projectId}" delete-many
          delete-url="/api/project/doc_service" :res-hook="handleHookResponse" @deleteMany="getTableData">
          <el-table-column :label="t('前缀名称')" align="center">
            <template #default="scope">
              <el-input v-if="editItem?._id === scope.row._id" v-model="scope.row.name" type="textarea"
                :autosize="{ minRows: 3 }" :size="config.renderConfig.layout.size" class="w-100" maxlength="15"
                clearable show-word-limit></el-input>
              <span v-else>{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="t('接口前缀')" align="center" width="300px">
            <template #default="scope">
              <el-input v-if="editItem?._id === scope.row._id" v-model="scope.row.url" placeholder="接口前缀必填"
                type="textarea" :autosize="{ minRows: 3 }">
              </el-input>
              <div v-else class="url-wrap">{{ scope.row.url }}</div>
            </template>
          </el-table-column>
          <el-table-column :label="t('是否共享')" align="center">
            <template #default="scope">
              <span v-if="scope.row.isLocal" class="orange">{{ t("仅自身可见") }}</span>
              <span v-else class="green">{{ t("项目内成员可见") }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="t('操作')" align="center">
            <template #default="scope">
              <el-button v-if="!editItem" type="primary" text @click="handleChangeEditNode(scope.row)">{{ t("编辑")
                }}</el-button>
              <el-button v-if="editItem?._id === scope.row._id" type="primary" text
                @click="handleSubmitEdit(scope.row)">{{ t("确认") }}</el-button>
              <el-button v-if="editItem?._id === scope.row._id" type="primary" text
                @click="handleCancelEdit(scope.row)">{{ t("取消") }}</el-button>
              <el-button link type="primary" text @click="handleDeleteHost(scope.row)">{{ t("删除") }}</el-button>
            </template>
          </el-table-column>
        </STable>
      </div>
    </div>
    <template #footer>
      <el-button type="warning" @click="handleClose">{{ t("关闭") }}</el-button>
    </template>
  </SDialog>
</template>

<script lang="ts" setup>
import { ResponseTable } from '@src/types'
import { httpNodeCache } from '@/cache/httpNode'
import SFieldset from '@/components/common/fieldset/g-fieldset.vue'
import SDialog from '@/components/common/dialog/g-dialog.vue'
import SResizeX from '@/components/common/resize/g-resize-x.vue'
import STable from '@/components/common/table/g-table.vue'
import { ApidocProjectHost } from '@src/types/apidoc/base-info'
import { useRoute } from 'vue-router'
import { useApidocBaseInfo } from '@/store/apidoc/base-info'
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus'
import { uuid } from '@/helper'
import { request } from '@/api/api'
import { useApidoc } from '@/store/apidoc/apidoc'
import { useTranslation } from 'i18next-vue'
import { config } from '@src/config/config'
import { Ref, ref } from 'vue'


type HostInfo = ApidocProjectHost & {
  _originValue?: string,
  isLocal?: boolean,
};

type HookThis = {
  tableData: Ref<HostInfo[]>,
  total: Ref<number>,
}

defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})
const emits = defineEmits(['update:modelValue'])
const { t } = useTranslation()

const formInfo = ref({
  name: '', //-------------------前缀名称
  url: '', //--------------------接口前缀地址
  isLocal: true, //--------------是否为本地
})
const rules = ref({
  name: [{ required: true, message: '请输入前缀名称', trigger: 'blur' }],
})
const errorInfo = ref({
  error: false,
  message: '',
})
const editItem = ref<HostInfo | null>(null) //当前正在被编辑的数据
const isSuccess = ref(false)
const loading = ref(false);
const route = useRoute()
const projectId = route.query.id as string;
const table = ref<InstanceType<typeof STable>>();
const apidocBaseInfoStore = useApidocBaseInfo();
const apidocStore = useApidoc()
const form = ref<FormInstance>()
/*
|--------------------------------------------------------------------------
| 方法定义
|--------------------------------------------------------------------------
*/
//返回钩子
const handleHookResponse = (res: ResponseTable<HostInfo[]>, _this: HookThis) => {
  const localData = httpNodeCache.getApidocServer(projectId);
  _this.tableData.value = res.data.rows.concat(localData);
  _this.total.value = res.data.total + localData.length
}
//获取data数据
const getTableData = () => {
  table.value?.getData().then((res: any) => {
    apidocBaseInfoStore.changeProjectHosts(res.data.rows)
  });
}
//确认添加host
const handleAddHost = () => {
  form.value?.validate((valid) => {
    if (valid) {
      const { url } = formInfo.value;
      //保存为本地
      if (formInfo.value.isLocal) {
        const serverInfo = {
          url,
          name: formInfo.value.name,
          isLocal: true,
          _id: uuid(),
        }
        isSuccess.value = true;
        setTimeout(() => {
          isSuccess.value = false;
        }, 300)
        httpNodeCache.addApidocServer(serverInfo, projectId);
        getTableData();
        return;
      }
      loading.value = true;
      const params = {
        name: formInfo.value.name,
        url,
        projectId,
      };
      isSuccess.value = false;
      request.post('/api/project/doc_service', params).then(() => {
        isSuccess.value = true;
        getTableData();
      }).catch((err) => {
        console.error(err);
      }).finally(() => {
        loading.value = false;
      });
    }
  });
}
//=====================================节点编辑====================================//
//改变正在编辑的节点
const handleChangeEditNode = (row: HostInfo) => {
  editItem.value = row;
  editItem.value._originValue = row.url;
}
//提交编辑
const handleSubmitEdit = (row: HostInfo) => {
  if (!errorInfo.value.error) {
    const originHost = apidocStore.apidoc.item.url.prefix;
    const isEditCurrenSelectedHost = originHost === row._originValue;
    if (row.isLocal) {
      const serverInfo = {
        url: row.url,
        name: row.name,
        isLocal: true,
        _id: uuid(),
      }
      httpNodeCache.deleteApidocServer(row._originValue as string, projectId);
      httpNodeCache.addApidocServer(serverInfo, projectId);
      editItem.value = null;
      if (isEditCurrenSelectedHost) { //同时修改本地server
        apidocStore.changeApidocPrefix(row.url)
      }
      getTableData()
      return;
    }
    const params = {
      _id: row._id,
      name: row.name,
      url: row.url,
      isLocal: row.isLocal
    };
    request.put('api/project/doc_service', params).then(() => {
      ElMessage.success(t('修改成功'));
      apidocBaseInfoStore.updateHostById(params);
      if (isEditCurrenSelectedHost) { //同时修改本地server
        apidocStore.changeApidocPrefix(row.url)
      }
      editItem.value = null;
    }).catch((err) => {
      console.error(err);
    });
  }
}
//取消编辑
const handleCancelEdit = (row: HostInfo) => {
  row.url = editItem.value?._originValue as string;
  editItem.value = null;
}
//删除一个host
const handleDeleteHost = (row: HostInfo) => {
  const params = {
    ids: [row._id]
  };
  ElMessageBox.confirm(t('此操作将永久删除此条记录, 是否继续?'), t('提示'), {
    confirmButtonText: t('确定'),
    cancelButtonText: t('取消'),
    type: 'warning',
  }).then(() => {
    if (row.isLocal) {
      httpNodeCache.deleteApidocServer(row.url, projectId);
      editItem.value = null;
      getTableData()
      return;
    }
    request.delete('/api/project/doc_service', { data: params }).then(() => {
      getTableData();
    }).catch((err) => {
      console.error(err);
    }).finally(() => {
      editItem.value = null;
    });
  }).catch((err: Error | string) => {
    if (err === 'cancel' || err === 'close') {
      return;
    }
    console.error(err);
  });
}
//=====================================其他操作====================================//
//关闭弹窗
const handleClose = () => {
  emits('update:modelValue', false);
}


</script>

<style lang='scss' scoped>
.host-wrap {
  display: flex;

  // overflow-y: auto;
  .add-host {
    flex: 0 0 auto;
    padding-right: 10px;
    margin-right: 10px;
    border-right: 1px solid var(--gray-400);
  }

  .url-wrap {
    height: 45px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
