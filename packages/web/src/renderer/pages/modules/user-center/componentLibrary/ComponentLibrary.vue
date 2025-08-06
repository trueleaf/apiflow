<template>
  <div class="component-library">
    <h2 class="page-title">组件库</h2>
    
    <div class="library-container">
      <div class="search-bar">
        <input type="text" v-model="searchTerm" placeholder="搜索组件..." />
      </div>
      
      <div class="components-grid">
        <div v-for="(component, index) in filteredComponents" :key="index" class="component-card">
          <div class="component-icon">
            <i :class="component.icon"></i>
          </div>
          <div class="component-info">
            <h3>{{ component.name }}</h3>
            <p>{{ component.description }}</p>
          </div>
          <div class="component-actions">
            <button @click="viewComponentDetails(component)">查看详情</button>
          </div>
        </div>
      </div>
      
      <div v-if="filteredComponents.length === 0" class="no-results">
        未找到匹配的组件
      </div>
      
      <!-- 组件详情区域 -->
      <div v-if="selectedComponent" class="component-detail-container">
        <h3 class="detail-title">{{ selectedComponent.name }} 详情</h3>
        <component :is="getComponentByName(selectedComponent.name)"></component>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from 'vue'

// 导入组件
const ButtonComponent = defineAsyncComponent(() => import('./components/Button.vue'))
const InputComponent = defineAsyncComponent(() => import('./components/Input.vue'))
const DropdownComponent = defineAsyncComponent(() => import('./components/Dropdown.vue'))
const DialogComponent = defineAsyncComponent(() => import('./components/Dialog.vue'))
const AlertComponent = defineAsyncComponent(() => import('./components/Alert.vue'))

// 搜索词
const searchTerm = ref('')

// 选中的组件
const selectedComponent = ref<any>(null)

// 组件库数据
const components = ref([
  {
    name: '按钮',
    icon: 'iconfont iconanniu',
    description: '提供多种样式、状态和尺寸的按钮组件',
    category: '基础组件'
  },
  {
    name: '输入框',
    icon: 'iconfont iconbiaodan',
    description: '用于创建交互式表单的组件集合',
    category: '表单组件'
  },
  {
    name: 'Dropdown',
    icon: 'iconfont iconbiaoge',
    description: '展示和管理数据的高级表格组件',
    category: '数据展示'
  },
  {
    name: '对话框',
    icon: 'iconfont iconduihuakuang',
    description: '模态对话框，用于确认操作或展示重要信息',
    category: '反馈组件'
  },
  {
    name: 'alert提示',
    icon: 'iconfont iconlunbotu',
    description: '循环展示内容的轮播组件',
    category: '数据展示'
  }
])

// 根据搜索词过滤组件
const filteredComponents = computed(() => {
  if (!searchTerm.value) return components.value
  
  const term = searchTerm.value.toLowerCase()
  return components.value.filter(component => 
    component.name.toLowerCase().includes(term) || 
    component.description.toLowerCase().includes(term) ||
    component.category.toLowerCase().includes(term)
  )
})

// 根据组件名称获取对应的组件
const getComponentByName = (name: string) => {
  switch (name.toLowerCase()) {
    case '按钮':
      return ButtonComponent
    case '输入框':
      return InputComponent
    case 'dropdown':
      return DropdownComponent
    case '对话框':
      return DialogComponent
    case 'alert提示':
      return AlertComponent
    default:
      return null
  }
}

// 查看组件详情
const viewComponentDetails = (component: any) => {
  console.log('查看组件详情:', component)
  selectedComponent.value = component
}
</script>

<style lang="scss" scoped>
.component-library {
  width: 100%;
  height: 100%;
  
  .page-title {
    margin-top: 0;
    margin-bottom: 20px;
    font-size: 24px;
    font-weight: 500;
    color: #333;
  }
  
  .library-container {
    width: 100%;
    
    .search-bar {
      margin-bottom: 20px;
      
      input {
        width: 100%;
        padding: 10px 15px;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s;
        
        &:focus {
          border-color: #007aff;
        }
      }
    }
    
    .components-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
      
      .component-card {
        border: 1px solid #ebeef5;
        border-radius: 6px;
        padding: 15px;
        display: flex;
        flex-direction: column;
        background-color: #fff;
        transition: all 0.3s;
        
        &:hover {
          box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }
        
        .component-icon {
          font-size: 32px;
          color: #007aff;
          margin-bottom: 10px;
          text-align: center;
        }
        
        .component-info {
          flex: 1;
          
          h3 {
            margin: 0 0 8px 0;
            font-size: 16px;
            font-weight: 500;
          }
          
          p {
            margin: 0;
            font-size: 14px;
            color: #606266;
            line-height: 1.5;
          }
        }
        
        .component-actions {
          margin-top: 15px;
          
          button {
            width: 100%;
            padding: 8px 0;
            background-color: #f5f7fa;
            border: 1px solid #dcdfe6;
            border-radius: 4px;
            color: #606266;
            cursor: pointer;
            transition: all 0.3s;
            
            &:hover {
              background-color: #ecf5ff;
              color: #007aff;
              border-color: #c6e2ff;
            }
          }
        }
      }
    }
    
    .no-results {
      text-align: center;
      padding: 40px 0;
      color: #909399;
      font-size: 14px;
    }
    
    // 组件详情区域样式
    .component-detail-container {
      margin-top: 40px;
      padding: 20px;
      border: 1px solid #ebeef5;
      border-radius: 6px;
      background-color: #fff;
      
      .detail-title {
        margin-top: 0;
        margin-bottom: 20px;
        font-size: 18px;
        font-weight: 500;
        color: #333;
        padding-bottom: 10px;
        border-bottom: 1px solid #ebeef5;
      }
    }
  }
}
</style>
