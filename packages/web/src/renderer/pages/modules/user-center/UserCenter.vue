<template>
  <div class="user-center">
    <div class="tab-container">
      <div class="vertical-tabs">
        <div class="sidebar-title">
          <span>账号信息</span>
        </div>

        <div class="menu-group">
          <div v-for="(tab, index) in tabs" :key="index" class="tab-item" :class="{ active: activeTab === index }"
            @click="activeTab = index">
            <i :class="tab.icon"></i>
            <span>{{ tab.name }}</span>
          </div>
        </div>

        <div class="sidebar-title sidebar-settings-title">
          <span>偏好设置</span>
        </div>

        <div class="menu-group">
          <div class="tab-item">
            <i class="iconfont iconCookies"></i>
            <span>通用</span>
          </div>

          <div class="tab-item">
            <i class="iconfont iconCookies"></i>
            <span>快捷键</span>
          </div>
        </div>
      </div>

      <div class="content-area">
        <UserInfo v-if="activeTab === 0" />
        <CacheManagement v-if="activeTab === 1" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CacheManagement from './cacheManager/CacheManagement.vue'
import UserInfo from './userInfo/UserInfo.vue'

const activeTab = ref(0)
const tabs = [
  { name: '基本信息', icon: 'iconfont icongerenzhongxin' },
  { name: '本地数据', icon: 'iconfont iconCookies' }
]
</script>

<style lang="scss" scoped>
.user-center {
  display: flex;
  height: 100%;
  width: 100%;

  .tab-container {
    display: flex;
    height: 100%;
    width: 100%;

    .vertical-tabs {
      width: 240px;
      height: 100%;
      border-right: 1px solid #eee;
      background-color: #ffffff;
      overflow-y: auto;

      .sidebar-title {
        padding: 15px 24px 5px;
        color: #909399;
        font-size: 13px;

        &.sidebar-settings-title {
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px solid #eee;
        }
      }

      .menu-group {
        margin-bottom: 10px;
      }

      .tab-item {
        padding: 12px 24px;
        cursor: pointer;
        display: flex;
        align-items: center;
        transition: background-color 0.3s ease;
        position: relative;

        &:hover {
          background-color: #f5f5f5;
        }

        &.active {
          background-color: rgba(0, 122, 255, 0.1);
          color: #007aff;
          border-right: 3px solid #007aff;
        }

        i {
          margin-right: 10px;
          font-size: 18px;
        }
      }
    }

    .content-area {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      position: relative;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
  }
}

// Transition effects
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
