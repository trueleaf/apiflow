<template>
  <div class="user-center">
    <div class="user-center-header">
      <h2>{{ $t('个人中心') }}</h2>
    </div>
    
    <div class="user-center-content">
      <el-tabs v-model="activeTab" class="user-center-tabs">
        <el-tab-pane :label="$t('基本信息')" name="userInfo">
          <UserInfo />
        </el-tab-pane>
        
        <el-tab-pane :label="$t('个人设置')" name="settings">
          <PersonalSettings />
        </el-tab-pane>
        
        <el-tab-pane :label="$t('缓存管理')" name="cache">
          <CacheManagement />
        </el-tab-pane>
        
        <el-tab-pane :label="$t('密码修改')" name="password">
          <PasswordChange />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import UserInfo from './components/UserInfo.vue'
import PersonalSettings from './components/PersonalSettings.vue'
import CacheManagement from './components/CacheManagement.vue'
import PasswordChange from './components/PasswordChange.vue'


const activeTab = ref('userInfo')

onMounted(() => {
  // 恢复上次访问的tab
  const lastTab = localStorage.getItem('userCenter/activeTab')
  if (lastTab) {
    activeTab.value = lastTab
  }
})

// 监听tab变化并保存
watch(activeTab, (newTab) => {
  localStorage.setItem('userCenter/activeTab', newTab)
})
</script>

<style lang="scss" scoped>
.user-center {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  
  &-header {
    margin-bottom: 24px;
    
    h2 {
      margin: 0;
      color: var(--gray-800);
      font-size: 24px;
      font-weight: 600;
    }
  }
  
  &-content {
    background: var(--white);
    border-radius: var(--border-radius-base);
    box-shadow: var(--box-shadow-sm);
    overflow: hidden;
  }
  
  &-tabs {
    :deep(.el-tabs__header) {
      margin: 0;
      background: var(--gray-100);
      padding: 0 20px;
    }
    
    :deep(.el-tabs__nav-wrap) {
      &::after {
        display: none;
      }
    }
    
    :deep(.el-tabs__item) {
      padding: 0 20px;
      height: 50px;
      line-height: 50px;
      border: none;
      
      &.is-active {
        background: var(--white);
        color: var(--theme-color);
      }
      
      &:hover {
        color: var(--theme-color);
      }
    }
    
    :deep(.el-tabs__content) {
      padding: 24px;
    }
  }
}
</style>
