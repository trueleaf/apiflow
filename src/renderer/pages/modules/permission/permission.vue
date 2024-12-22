
<template>
  <div class="s-permission">
    <el-tabs v-model="activeName" @tab-change="handleChangeTabs">
      <el-tab-pane :label="t('用户')" name="SUser"></el-tab-pane>
      <el-tab-pane :label="t('角色维护')" name="SRole"></el-tab-pane>
      <el-tab-pane :label="t('菜单维护')" name="SMenu"></el-tab-pane>
      <el-tab-pane :label="t('前端路由')" name="SClientRoutes"></el-tab-pane>
      <el-tab-pane :label="t('后端路由(接口)')" name="SServerRoutes"></el-tab-pane>
    </el-tabs>
    <component :is="getComponent()"></component>
  </div>
</template>

<script lang="ts" setup>

import SUser from './user/user.vue'
import SRole from './role/role.vue'
import SMenu from './menu/menu.vue'
import SClientRoutes from './client-routes/client-routes.vue'
import SServerRoutes from './server-routes/server-routes.vue'
import { onMounted, ref } from 'vue'
import { t } from 'i18next'

const activeName = ref('SUser')
/*
|--------------------------------------------------------------------------
| 方法定义
|--------------------------------------------------------------------------
*/
const getComponent = () => {
  if (activeName.value === 'SUser') {
    return SUser;
  } else if (activeName.value === 'SRole') {
    return SRole;
  } else if (activeName.value === 'SMenu') {
    return SMenu
  } else if (activeName.value === 'SClientRoutes') {
    return SClientRoutes
  } else if (activeName.value === 'SServerRoutes') {
    return SServerRoutes
  }
}
//恢复上次访问的tab
const restoreLastVisitTab = () => {
  const localTab = localStorage.getItem('permission/activeTab');
  if (localTab) {
    activeName.value = localTab;
  }
}
//缓存上一次访问的tab
const handleChangeTabs = () => {
  localStorage.setItem('permission/activeTab', activeName.value)
}
onMounted(() => {
  restoreLastVisitTab();
})

</script>

<style lang='scss' scoped>
.s-permission {
    width: 70%;
    margin-top: 20px;
    margin-left: auto;
    margin-right: auto;
}
</style>
