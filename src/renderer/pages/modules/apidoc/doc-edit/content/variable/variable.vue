
<template>
  <div class="s-variable">
    <!-- 新增变量 -->
    <SFieldset :title="t('新增变量')" class="left">
      <el-form ref="form" :model="formInfo" :rules="rules" label-width="120px">
        <el-form-item :label="`${t('变量名称')}：`" prop="name">
          <el-input v-model="formInfo.name" :size="config.renderConfig.layout.size" :placeholder="t('请输入变量名称')" class="w-100" maxlength="100" clearable></el-input>
        </el-form-item>
        <el-form-item :label="`${t('变量值')}：`" prop="value">
          <el-input v-model="formInfo.value" type="textarea" :autosize="{ minRows: 10, maxRows: 10 }" :size="config.renderConfig.layout.size" :placeholder="t('请输入变量值')" class="w-100" maxlength="9999" clearable></el-input>
        </el-form-item>
        <el-form-item :label="`${t('值类型')}：`" prop="type">
          <el-select v-model="formInfo.type" :size="config.renderConfig.layout.size" class="w-100">
            <el-option value="string" label="string"></el-option>
            <el-option value="number" label="number"></el-option>
            <el-option value="boolean" label="boolean"></el-option>
          </el-select>
        </el-form-item>
        <div class="d-flex j-end">
          <el-button :loading="loading" type="primary" @click="handleAddVariable">{{ t("确认添加") }}</el-button>
        </div>
      </el-form>
    </SFieldset>
    <!-- 变量列表 -->
    <SFieldset :title="t('变量列表')" class="right">
      <STable
        ref="table"
        url="/api/project/project_variable"
        delete-many
        delete-url="/api/project/project_variable"
        :delete-params="{ projectId: route.query.id }"
        :params="{ projectId: route.query.id }"
      >
        <el-table-column :label="t('变量名称')" align="center">
          <template #default="scope">
            <el-input v-if="scope.row.__active" v-model="scope.row.name" :size="config.renderConfig.layout.size" class="w-100" maxlength="100" clearable></el-input>
            <span v-else>{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="t('变量值')" align="center" show-overflow-tooltip>
          <template #default="scope">
            <el-input v-if="scope.row.__active" v-model="scope.row.value" type="textarea" :autosize="{ minRows: 2, maxRows: 10 }" :size="config.renderConfig.layout.size" class="w-100" maxlength="9999" clearable></el-input>
            <span v-else>{{ scope.row.value }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="t('变量类型')" align="center">
          <template #default="scope">
            <el-select v-if="scope.row.__active" v-model="scope.row.type" :size="config.renderConfig.layout.size" class="w-100">
              <el-option value="string" label="string"></el-option>
              <el-option value="number" label="number"></el-option>
              <el-option value="boolean" label="boolean"></el-option>
            </el-select>
            <span v-else>{{ scope.row.type }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="t('创建者')" align="center" prop="creator"></el-table-column>
        <el-table-column :label="t('操作')" align="center">
          <template #default="scope">
            <el-button v-show="!scope.row.__active && !isEditing" link type="primary" text @click="handleEdit(scope.row)">{{ t("编辑") }}</el-button>
            <el-button v-show="scope.row.__active" link type="primary" text @click="handleSubmitEdit(scope.row)">{{ t("确认") }}</el-button>
            <el-button v-show="scope.row.__active" link type="primary" text @click="handleCancelEdit(scope.row)">{{ t("取消") }}</el-button>
            <el-button link type="primary" text @click="handleDelete(scope.row._id)">{{ t("删除") }}</el-button>
          </template>
        </el-table-column>
      </STable>
    </SFieldset>
  </div>
</template>

<script lang="ts" setup>
import { useApidocBaseInfo } from '@/store/apidoc/base-info';
import { ApidocProjectVariable } from '@src/types/apidoc/base-info';
import SFieldset from '@/components/common/fieldset/g-fieldset.vue'
import STable from '@/components/common/table/g-table.vue'
import type { ApidocVariable } from '@src/types/global'
import { config } from '@src/config/config'
import { t } from 'i18next'
import { ref } from 'vue';
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus';
import { request } from '@/api/api';
import { useRoute } from 'vue-router';

type EditApidocVariable = ApidocVariable & {
  __active?: boolean,
}

const formInfo = ref({
  name: '', //------------变量名称
  value: '', //-----------变量值
  type: 'string', //------变量类型
})
const oldEditingData = ref<EditApidocVariable | null>(null);
const rules = ref({
  name: [{ required: true, message: t('请输入变量名称'), trigger: 'blur' }],
  value: [{ required: true, message: t('请输入变量值'), trigger: 'blur' }],
})
const isEditing = ref(false);
const loading = ref(false);
const route = useRoute()
const table = ref<{ getData: () => Promise<{
  data: {
    rows: ApidocProjectVariable[]
  }
}> }>();
const form = ref<FormInstance>();
const apidocBaseInfoStore = useApidocBaseInfo();
/*
|--------------------------------------------------------------------------
| 方法定义
|--------------------------------------------------------------------------
*/
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
      const params = Object.assign(formInfo.value, {
        projectId: route.query.id,
      });
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
//让当前行处于修改状态
const handleEdit = (row: EditApidocVariable) => {
  row.__active = true;
  isEditing.value = true;
  oldEditingData.value = JSON.parse(JSON.stringify(row));
}
//确认修改当前行
const handleSubmitEdit = (row: EditApidocVariable) => {
  row.__active = false;
  const params = {
    ...row,
    projectId: route.query.id,
  };
  request.put('/api/project/project_variable', params).then(() => {
    ElMessage.success(t('修改成功'));
    getData();
    isEditing.value = false;
  }).catch((err) => {
    console.error(err);
  });
}
//取消修改
const handleCancelEdit = (row: EditApidocVariable) => {
  Object.assign(row, oldEditingData)
  row.__active = false;
  isEditing.value = false;
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
        flex: 0 0 size(400);
        margin-right: size(10);
    }
    .right {
        flex: 1;
    }
}
</style>
