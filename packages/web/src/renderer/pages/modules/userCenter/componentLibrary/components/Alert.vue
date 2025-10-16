<template>
  <div class="component-demo">
    <h3 class="component-title">Alert 提示组件</h3>
    <div class="component-description">
      <p>循环展示内容的轮播组件</p>
    </div>
    <div class="component-showcase">
      <div class="alert success">
        <div class="alert-icon">✓</div>
        <div class="alert-content">
          <div class="alert-title">成功提示</div>
          <div class="alert-message">操作已成功完成</div>
        </div>
      </div>
      
      <div class="alert info">
        <div class="alert-icon">i</div>
        <div class="alert-content">
          <div class="alert-title">信息提示</div>
          <div class="alert-message">这是一条信息提示</div>
        </div>
      </div>
      
      <div class="alert warning">
        <div class="alert-icon">!</div>
        <div class="alert-content">
          <div class="alert-title">警告提示</div>
          <div class="alert-message">请注意此操作的风险</div>
        </div>
      </div>
      
      <div class="alert error">
        <div class="alert-icon">×</div>
        <div class="alert-content">
          <div class="alert-title">错误提示</div>
          <div class="alert-message">操作失败，请重试</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Alert 提示组件实现
</script>

<style lang="scss" scoped>
.component-demo {
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  background-color: #fff;
  
  .component-title {
    margin-top: 0;
    margin-bottom: 16px;
    font-size: 18px;
    font-weight: 500;
    color: #333;
  }
  
  .component-description {
    margin-bottom: 20px;
    
    p {
      margin: 0;
      font-size: 14px;
      color: #606266;
      line-height: 1.5;
    }
  }
  
  .component-showcase {
    display: flex;
    flex-direction: column;
    gap: 16px;
    
    .alert {
      display: flex;
      align-items: flex-start;
      padding: 12px 16px;
      border-radius: 4px;
      
      .alert-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        margin-right: 10px;
        font-weight: bold;
      }
      
      .alert-content {
        flex: 1;
        
        .alert-title {
          font-weight: 500;
          font-size: 14px;
          margin-bottom: 4px;
        }
        
        .alert-message {
          font-size: 13px;
          line-height: 1.5;
        }
      }
      
      &.success {
        background-color: #f0f9eb;
        border: 1px solid #e1f3d8;
        
        .alert-icon {
          color: #67c23a;
          background-color: rgba(103, 194, 58, 0.1);
        }
        
        .alert-title {
          color: #67c23a;
        }
        
        .alert-message {
          color: #85ce61;
        }
      }
      
      &.info {
        background-color: #f4f4f5;
        border: 1px solid #e9e9eb;
        
        .alert-icon {
          color: #909399;
          background-color: rgba(144, 147, 153, 0.1);
        }
        
        .alert-title {
          color: #909399;
        }
        
        .alert-message {
          color: #a6a9ad;
        }
      }
      
      &.warning {
        background-color: #fdf6ec;
        border: 1px solid #faecd8;
        
        .alert-icon {
          color: #e6a23c;
          background-color: rgba(230, 162, 60, 0.1);
        }
        
        .alert-title {
          color: #e6a23c;
        }
        
        .alert-message {
          color: #ebb563;
        }
      }
      
      &.error {
        background-color: #fef0f0;
        border: 1px solid #fde2e2;
        
        .alert-icon {
          color: #f56c6c;
          background-color: rgba(245, 108, 108, 0.1);
        }
        
        .alert-title {
          color: #f56c6c;
        }
        
        .alert-message {
          color: #f78989;
        }
      }
    }
  }
}
</style>
