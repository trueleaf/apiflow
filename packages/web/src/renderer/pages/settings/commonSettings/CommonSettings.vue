<template>
  <div class="user-info-container">
    <!-- 页面标题区域 -->
    <div class="page-title">
      <h2>{{ $t('通用配置') }}</h2>
    </div>
    
    <div class="info-card">
      <div class="avatar-section">
        <div class="avatar">
          <img :src="userInfo.avatar || defaultAvatar" :alt="$t('用户头像')">
        </div>
      </div>
      
      <div class="info-section">
        <div class="info-row">
          <div class="info-label">{{ $t('用户名') }}</div>
          <div class="info-value">
            <span>{{ userInfo.realName }}</span>
          </div>
        </div>
        <div class="info-row">
          <div class="info-label">{{ $t('邮箱') }}</div>
          <div class="info-value">
            <span v-if="isLocalMode" class="local-mode-value">/</span>
            <span v-else>/</span>
          </div>
        </div>
        <div class="info-row">
          <div class="info-label">{{ $t('所属团队') }}</div>
          <div class="info-value">
            <span class="local-mode-value">/</span>
          </div>
        </div>
        <div class="info-row">
          <div class="info-label">{{ $t('注册时间') }}</div>
          <div class="info-value">/</div>
        </div>
        <div class="info-row">
          <div class="info-label">{{ $t('最后登录') }}</div>
          <div class="info-value">/</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRuntime } from '@/store/runtime/runtimeStore'
import defaultAvatarImg from '@/assets/imgs/logo.png'

const defaultAvatar = defaultAvatarImg
const runtimeStore = useRuntime()
const isLocalMode = computed(() => runtimeStore.networkMode === 'offline')
const userInfo = computed(() => runtimeStore.userInfo)

</script>

<style lang="scss" scoped>
.user-info-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .page-title {
    margin-bottom: 24px;

    h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #333;
    }
  }
  
  .info-card {
    background: white;
    border: 1px solid #eaeaea;
    padding: 24px;
    display: flex;
    flex: 1;
    min-height: calc(100% - 60px);
    
    .avatar-section {
      margin-right: 40px;
      display: flex;
      flex-direction: column;
      align-items: center;

      .avatar {
        width: 120px;
        height: 120px;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }
    
    .info-section {
      flex: 1;
      
      .info-row {
        display: flex;
        margin-bottom: 20px;
        align-items: center;
        
        .info-label {
          width: 100px;
          color: #606266;
          font-weight: 500;
        }
        
        .info-value {
          flex: 1;
          
          .local-mode-value {
            color: #909399;
            cursor:  not-allowed;
            position: relative;
            
            &:hover {
              text-decoration: underline dotted;
            }
          }
        }
      }
    }
  }
}
</style>
