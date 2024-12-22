/*
    创建者：shuxiaokai
    创建时间：2021-09-15 2:48
    模块名称：联想参数
    备注：
*/
<template>
  <div class="s-mind-params">
    <!-- 搜索条件 -->
    <SFieldset :title="t('过滤条件')">
      <div class="d-flex">
        <div class="left">
          <div class="op-item">
            <div class="label">{{ t("字段名") }}：</div>
            <el-input v-model="formInfo.key" :size="config.renderConfig.layout.size" :placeholder="t('参数字段名称')" maxlength="100" class="w-65" clearable></el-input>
          </div>
          <div class="op-item">
            <div class="label">{{ t("类型") }}：</div>
            <el-checkbox-group v-model="formInfo.type">
              <el-checkbox value="paths">{{ t("Path参数") }}</el-checkbox>
              <el-checkbox value="queryParams">{{ t("Query参数") }}</el-checkbox>
              <el-checkbox value="requestBody">{{ t("Body参数") }}</el-checkbox>
              <el-checkbox value="responseParams">{{ t("返回参数") }}</el-checkbox>
              <el-button link type="primary" text class="ml-5" @click="handleClearType">{{ t("清空") }}</el-button>
            </el-checkbox-group>
          </div>
        </div>
        <div class="right">
          <el-descriptions :column="2" border>
            <el-descriptions-item>
              <template #label>
                <span>{{ t("Path参数个数") }}</span>
              </template>
              <span>{{ tableInfo.filter(v => v.paramsPosition === 'paths').length }}</span>
              <span>&nbsp;个</span>
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <span>{{ t("Query参数个数") }}</span>
              </template>
              <span>{{ tableInfo.filter(v => v.paramsPosition === 'queryParams').length }}</span>
              <span>&nbsp;个</span>
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <span>{{ t("Body参数个数") }}</span>
              </template>
              <span>{{ tableInfo.filter(v => v.paramsPosition === 'requestBody').length }}</span>
              <span>&nbsp;个</span>
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <span>{{ t("Response参数个数") }}</span>
              </template>
              <span>{{ tableInfo.filter(v => v.paramsPosition === 'responseParams').length }}</span>
              <span>&nbsp;个</span>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </SFieldset>
    <SFieldset :title="`${t('联想参数')}(${tableInfo.length})`" class="mt-3">
      <el-button type="danger" class="mb-1" :disabled="selectData.length === 0" @click="handleDeleteManyParams">{{ t("批量删除") }}</el-button>
      <el-table :data="tableInfo" stripe border height="calc(100vh - 350px)" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="key" :label="t('参数名称')" align="center">
          <template #default="scope">
            <s-emphasize :value="scope.row.key" :keyword="formInfo.key"></s-emphasize>
          </template>
        </el-table-column>
        <el-table-column prop="type" :label="t('参数类型')" align="center"></el-table-column>
        <el-table-column prop="value" :label="t('参数值')" align="center">
          <template #default="scope">
            <div class="value-wrap">{{ scope.row.value }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="description" :label="t('备注')" align="center"></el-table-column>
        <el-table-column prop="paramsPosition" :label="t('参数位置')" align="center"></el-table-column>
        <el-table-column :label="t('操作')" align="center">
          <template #default="scope">
            <!-- <el-button link type="primary" text @click="handleEditParams(scope.row)">修改</el-button> -->
            <el-button link type="primary" text @click="handleDeleteParams(scope.row)">{{ t("删除") }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </SFieldset>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, Ref } from 'vue'
import 'element-plus/es/components/message-box/style/css';
import { ElMessageBox } from 'element-plus'
import type { ApidocMindParam } from '@src/types/global'
import { store } from '@/store/index'
import { router } from '@/router/index'
import { request } from '@/api/api'
import { t } from 'i18next'

//搜索条件
const formInfo: Ref<{ key: string, type: ApidocMindParam['paramsPosition'][] }> = ref({
  key: '',
  type: [],
})
//表格参数
const tableInfo = computed(() => {
  const allParams: ApidocMindParam[] = [];
  store.state['apidoc/baseInfo'].mindParams.forEach(v => {
    allParams.push(v);
  })
  allParams.sort((a, b) => {
    if (a.key.toLowerCase() > b.key.toLowerCase()) {
      return 1;
    }
    return -1;
  });
  return allParams.filter(v => {
    const matchedKey = !formInfo.value.key || v.key.includes(formInfo.value.key);
    return matchedKey;
  }).filter(v => {
    if (formInfo.value.type.length === 0) {
      return true;
    }
    return formInfo.value.type.includes(v.paramsPosition)
  })
});
//清空checkbox
const handleClearType = () => {
  formInfo.value.type = [];
}
//=====================================操作====================================//
//批量选择
const selectData: Ref<ApidocMindParam[]> = ref([]);
const handleSelectionChange = (data: ApidocMindParam[]) => {
  selectData.value = data;
}
//修改参数
// const handleEditParams = (row: ApidocMindParam) => {
//     console.log(row)
// }
//删除某个参数
const handleDeleteParams = (row: ApidocMindParam) => {
  ElMessageBox.confirm(t('是否删除当前参数'), t('提示'), {
    confirmButtonText: t('确定'),
    cancelButtonText: t('取消'),
    type: 'warning',
  }).then(() => {
    const projectId = router.currentRoute.value.query.id as string;
    const params = {
      projectId,
      ids: [row._id],
    };
    request.delete('/api/project/doc_params_mind', { data: params }).then(() => {
      store.commit('apidoc/baseInfo/deleteMindParamsById', row._id)
    }).catch((err) => {
      console.error(err);
    });
  }).catch((err) => {
    if (err === 'cancel' || err === 'close') {
      return;
    }
    console.error(err);
  });
}
//批量删除
const handleDeleteManyParams = () => {
  ElMessageBox.confirm(t('确定批量删除当前选中节点'), t('提示'), {
    confirmButtonText: t('确定'),
    cancelButtonText: t('取消'),
    type: 'warning',
  }).then(() => {
    const projectId = router.currentRoute.value.query.id as string;
    const params = {
      projectId,
      ids: selectData.value.map(v => v._id),
    };
    request.delete('/api/project/doc_params_mind', { data: params }).then(() => {
      selectData.value.forEach(v => {
        store.commit('apidoc/baseInfo/deleteMindParamsById', v._id)
      })
    }).catch((err) => {
      console.error(err);
    });
  }).catch((err) => {
    if (err === 'cancel' || err === 'close') {
      return;
    }
    console.error(err);
  });
}
</script>

<style  scoped>
.s-mind-params {
    padding: size(20);
    .value-wrap {
        max-height: size(140);
        overflow-y: auto;
    }
    .left {
        padding-left: size(20);
        flex: 0 0 40%;
        border-right: 1px solid $gray-600;
    }
    .right {
        flex: 0 0 50%;
        padding-left: size(30);
    }
    .op-item {
        display: flex;
        align-items: center;
        .label {
            flex: 0 0 size(80);
        }
    }
}
</style>
