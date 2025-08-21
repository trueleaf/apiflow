<template>
  <div class="websocket-info">
    <!-- 上方展示基本信息 -->
    <SBaseInfo></SBaseInfo>
    
    <!-- 下方展示空白页面 -->
    <div class="empty-content">
      <el-empty description="WebSocket 响应信息展示区域">
        <template #image>
          <div class="websocket-icon">
            <i class="iconfont iconwebsocket"></i>
          </div>
        </template>
      </el-empty>
    </div>
  </div>
</template>

<script lang="ts" setup>
import SBaseInfo from './base-info/base-info.vue'
</script>

<style lang="scss" scoped>
.websocket-info {
  height: 100%;
  display: flex;
  flex-direction: column;

  .empty-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #fafafa;

    .websocket-icon {
      font-size: 64px;
      color: #d3d3d3;
      margin-bottom: 16px;
    }
  }
}
</style>
