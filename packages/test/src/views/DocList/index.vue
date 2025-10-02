<template>
  <div class="doc-list-container">
    <el-container>
      <el-header class="doc-header">
        <el-breadcrumb separator=">">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>API文档管理</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-container>
        <el-aside width="200px" class="doc-sidebar">
          <el-menu
            :default-active="activeMenu"
            @select="handleMenuSelect"
            router
            class="doc-menu"
          >
            <el-menu-item index="/doc-list/projects">
              <el-icon><Tickets /></el-icon>
              <span>项目列表</span>
            </el-menu-item>
            <el-menu-item index="/doc-list/teams">
              <el-icon><School /></el-icon>
              <span>团队管理</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
        <el-main class="doc-main">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Tickets, School } from '@element-plus/icons-vue'

const route = useRoute()

const activeMenu = computed(() => route.path)

const handleMenuSelect = (index: string) => {
  console.log('菜单选择:', index)
}
</script>

<style scoped>
.doc-list-container {
  height: 100vh;
}

.doc-header {
  background: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border-base);
  display: flex;
  align-items: center;
  padding: 0 var(--spacing-xl);
}

.doc-sidebar {
  background: var(--color-bg-secondary);
  border-right: 1px solid var(--color-border-base);
}

.doc-main {
  background: var(--color-bg-card);
  padding: var(--spacing-xl);
}

.doc-menu {
  border: none;
  background: transparent;
}
</style>