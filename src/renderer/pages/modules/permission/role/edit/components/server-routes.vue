
<template>
  <SLoading :loading="loading" class="server-routes">
    <div v-for="(item, title) in serverRoutes" :key="title">
      <el-divider content-position="left">{{ title }}</el-divider>
      <div class="pl-5">
        <el-checkbox
          v-model="item.selected"
          :indeterminate="checkServerRoutesIsIndeterminate(item)"
          :value="t('全选')"
          @change="handleSelectAllServerRoutes(item)"
        >
        </el-checkbox>
        <el-checkbox-group v-model="selectedData" @change="handleSelectServerRoutes(item)">
          <el-checkbox v-for="(item2, index) in item.values" :key="index" :value="item2._id">{{ item2.name }}</el-checkbox>
        </el-checkbox-group>
      </div>
    </div>
  </SLoading>
</template>

<script lang="ts" setup>
import { request } from '@/api/api';
import type { PermissionServerRoute, Response } from '@src/types/global'
import { t } from 'i18next'
import { onMounted, ref, watch } from 'vue';
import SLoading from '@/components/common/loading/g-loading.vue'

type RouteInfo = {
  selected: boolean,
  values: PermissionServerRoute[]
}
type ServerGroupRoutes = {
  [propName: string]: RouteInfo
}

const emits = defineEmits(['change']);
const selectedData = ref<string[]>([]); //------------当前选中的后端路由
const serverRoutes = ref<ServerGroupRoutes>({}); //---后端路由列表
const loading = ref(false);

watch(selectedData, (val) => {
  emits('change', val);
}, {
  deep: true,
});
/*
|--------------------------------------------------------------------------
| 方法定义
|--------------------------------------------------------------------------
*/
//获取后端路由信息
const getServerRoutes = () => {
  loading.value = true;
  request.get<Response<PermissionServerRoute[]>, Response<PermissionServerRoute[]>>('/api/security/server_routes').then((res) => {
    res.data.forEach((val) => {
      if (!serverRoutes.value[val.groupName || '__default']) {
        serverRoutes.value[val.groupName || '__default'] = {
          selected: false,
          values: [],
        };
      }
      serverRoutes.value[val.groupName || '__default'].values.push({
        ...val,
      });
    });
  }).catch((err) => {
    console.error(err);
  }).finally(() => {
    loading.value = false;
  });
}
//选择全部后端路由
const handleSelectAllServerRoutes = (item: RouteInfo) => {
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
//选择某个后端路由
const handleSelectServerRoutes = (item: RouteInfo) => {
  const isSelectAll = item.values.every((val) => selectedData.value.find((v) => v === val._id));
  item.selected = isSelectAll
}
//检查后端路由是否全选
const checkServerRoutesIsIndeterminate = (item: RouteInfo) => {
  const hasOne = selectedData.value.find((val) => item.values.find(i => i._id === val));
  const hasAll = item.values.every((val) => selectedData.value.find(i => i === val._id));
  return !!hasOne && !hasAll
}
onMounted(() => {
  getServerRoutes()
})
</script>

<style lang="scss" scoped>
.server-routes {
    min-height: size(300);
    height: 40vh;
    overflow-y: auto;
}
</style>
