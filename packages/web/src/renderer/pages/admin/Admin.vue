<template>
  <div class="s-permission">
    <SUser v-if="!isExpanded" :is-expanded="false" @toggle="isExpanded = true" />
    <el-tabs v-else v-model="activeTab" type="border-card">
      <el-tab-pane :label="t('用户管理')" name="user">
        <SUser :is-expanded="true" @toggle="isExpanded = false" />
      </el-tab-pane>
      <el-tab-pane :label="t('角色管理')" name="role">
        <SRole />
      </el-tab-pane>
      <!-- <el-tab-pane :label="t('菜单管理')" name="menu">
        <SMenu />
      </el-tab-pane> -->
      <el-tab-pane :label="t('客户端路由')" name="clientRoutes">
        <SClientRoutes />
      </el-tab-pane>
      <el-tab-pane :label="t('服务端路由')" name="serverRoutes">
        <SServerRoutes />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'
import SUser from './user/User.vue'
import SRole from './role/Role.vue'
// import SMenu from './menu/Menu.vue'
import SClientRoutes from './clientRoutes/ClientRoutes.vue'
import SServerRoutes from './serverRoutes/ServerRoutes.vue'

const { t } = useI18n()
const isExpanded = ref(false)
const activeTab = ref('user')
</script>

<style lang="scss" scoped>
.s-permission {
  width: 70%;
  margin-top: 20px;
  margin-left: auto;
  margin-right: auto;
}
</style>
