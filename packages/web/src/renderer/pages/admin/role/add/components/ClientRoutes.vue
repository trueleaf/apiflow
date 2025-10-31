<template>
  <SLoading :loading="loading" class="client-routes">
    <div v-for="(item, title) in clientRoutes" :key="title">
      <el-divider content-position="left">{{ title }}</el-divider>
      <div class="pl-5">
        <el-checkbox
          v-model="item.selected"
          :indeterminate="checkClientRoutesIsIndeterminate(item)"
          :label="t('全选')"
          @change="handleSelectAllClientRoutes(item)"
        >
        </el-checkbox>
        <el-checkbox-group v-model="selectedData" @change="handleSelectClientRoutes(item)">
          <el-checkbox v-for="(item2, index) in item.values" :key="index" :value="item2._id">{{ item2.name }}</el-checkbox>
        </el-checkbox-group>
      </div>
    </div>
  </SLoading>
</template>

<script lang="ts" setup>
import { request } from '@/api/api';
import { PermissionClientRoute, CommonResponse } from '@src/types'
import { useI18n } from 'vue-i18n'
import SLoading from '@/components/common/loading/GLoading.vue'
import { onMounted, ref, watch } from 'vue';

type RouteInfo = {
  selected: boolean,
  values: PermissionClientRoute[]
}
type ClientGroupRoutes = {
  [propName: string]: RouteInfo
}

const { t } = useI18n()

const emits = defineEmits(['change']);
const selectedData = ref<string[]>([]); //------------当前选中的前端路由
const clientRoutes = ref<ClientGroupRoutes>({}); //---前端路由列表
const loading = ref<boolean>(false);

watch(selectedData, (val) => {
  emits('change', val)
}, {
  deep: true,
})
/*
|--------------------------------------------------------------------------
| 函数定义
|--------------------------------------------------------------------------
*/
//获取前端路由
const getClientRoutes = () => {
  loading.value = true;
  request.get<CommonResponse<PermissionClientRoute[]>, CommonResponse<PermissionClientRoute[]>>('/api/security/client_routes').then((res) => {
    res.data.forEach((val) => {
      if (!clientRoutes.value[val.groupName || '__default']) {
        clientRoutes.value[val.groupName || '__default'] = {
          selected: false,
          values: [],
        };
      }
      clientRoutes.value[val.groupName || '__default'].values.push({
        ...val,
      });
    });
  }).catch((err) => {
    console.error(err);
  }).finally(() => {
    loading.value = false;
  });
}
//选择全部前端路由
const handleSelectAllClientRoutes = (item: RouteInfo) => {
  if (item.selected === true) {
    item.values.forEach((route) => {
      if (!selectedData.value.find((val) => val === route._id)) {
        selectedData.value.push(route._id);
      }
    });
  } else {
    item.values.forEach((route) => {
      const index = selectedData.value.findIndex((val) => val === route._id);
      selectedData.value.splice(index, 1);
    });
  }
}
//选择某个前端路由
const handleSelectClientRoutes = (item: RouteInfo) => {
  const isSelectAll = item.values.every((val) => selectedData.value.find((v) => v === val._id));
  item.selected = isSelectAll
}
//检查前端路由是否全选
const checkClientRoutesIsIndeterminate = (item: RouteInfo) => {
  const hasOne = selectedData.value.find((val) => item.values.find(i => i._id === val));
  const hasAll = item.values.every((val) => selectedData.value.find(i => i === val._id));
  return !!hasOne && !hasAll
}
onMounted(() => {
  getClientRoutes();
})
</script>

<style lang='scss' scoped>
.client-routes {
    min-height: 300px;
    height: 40vh;
    overflow-y: auto;
}
</style>
