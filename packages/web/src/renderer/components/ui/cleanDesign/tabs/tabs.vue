<template>
  <div class="clean-tabs">
    <div class="tabs-header">
      <div 
        v-for="(tab, index) in tabs" 
        :key="index"
        class="tab-item"
        :class="{ active: activeTab === index }"
        @click="switchTab(index)"
      >
        {{ tab.label }}
      </div>
    </div>
    <div class="tabs-content">
      <div class="tab-panel">
        <h4>{{ tabs[activeTab].label }}</h4>
        <p>{{ tabs[activeTab].content }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 活跃的标签页索引
const activeTab = ref(0)

// 标签页数据
const tabs = ref([
  {
    label: '基础信息',
    content: '这是基础信息标签页的内容。标签页组件允许用户在不同的内容视图之间切换，是常见的界面组织方式。'
  },
  {
    label: '详细设置',
    content: '这是详细设置标签页的内容。通过点击不同的标签，可以查看相应的内容区域，提供了良好的信息分组和导航体验。'
  },
  {
    label: '高级选项',
    content: '这是高级选项标签页的内容。标签页组件支持多种样式和交互方式，可以根据需要进行定制和扩展。'
  }
])

// 切换标签页
const switchTab = (index: number) => {
  activeTab.value = index
}
</script>

<style lang="scss" scoped>
.clean-tabs {
  background: #fff;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  overflow: hidden;
  
  .tabs-header {
    display: flex;
    background: #f8f9fa;
    border-bottom: 1px solid #e1e5e9;
    
    .tab-item {
      flex: 1;
      padding: 12px 16px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s ease;
      color: #666;
      font-size: 14px;
      border-right: 1px solid #e1e5e9;
      
      &:last-child {
        border-right: none;
      }
      
      &:hover {
        background: #e9ecef;
        color: #333;
      }
      
      &.active {
        background: #007aff;
        color: white;
        font-weight: 500;
        
        &:hover {
          background: #0056cc;
        }
      }
    }
  }
  
  .tabs-content {
    padding: 20px;
    
    .tab-panel {
      h4 {
        margin: 0 0 12px 0;
        font-size: 16px;
        font-weight: 600;
        color: #333;
      }
      
      p {
        margin: 0;
        line-height: 1.6;
        color: #666;
        font-size: 14px;
      }
    }
  }
}
</style>