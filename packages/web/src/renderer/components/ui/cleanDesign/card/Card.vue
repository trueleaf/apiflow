<template>
  <div class="clean-card">
    <div class="card-header">
      <h3 class="card-title">卡片标题</h3>
    </div>
    <div class="card-body">
      <p class="card-content">
        这是一个简单的卡片组件示例。卡片组件通常用于展示相关信息的容器，
        具有清晰的边界和层次结构。可以包含标题、内容、图片、按钮等元素。
      </p>
      <div class="card-actions">
        <button class="card-btn primary">主要操作</button>
        <button class="card-btn secondary">次要操作</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 简单的卡片组件，用于展示
</script>

<style lang="scss" scoped>
.clean-card {
  background: #fff;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
  
  .card-header {
    padding: 16px 20px;
    border-bottom: 1px solid #f0f0f0;
    background: #fafafa;
    
    .card-title {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
  }
  
  .card-body {
    padding: 20px;
    
    .card-content {
      margin: 0 0 16px 0;
      line-height: 1.6;
      color: #666;
      font-size: 14px;
    }
    
    .card-actions {
      display: flex;
      gap: 8px;
      
      .card-btn {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s ease;
        
        &.primary {
          background: #007aff;
          color: white;
          
          &:hover {
            background: #0056cc;
          }
        }
        
        &.secondary {
          background: #f5f5f5;
          color: #666;
          border: 1px solid #ddd;
          
          &:hover {
            background: #e8e8e8;
            color: #333;
          }
        }
      }
    }
  }
}
</style>