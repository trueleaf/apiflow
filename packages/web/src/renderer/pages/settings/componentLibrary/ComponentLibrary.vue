<template>
  <div class="component-library">
    <div class="page-title">
      <h2>{{ $t('组件库') }}</h2>
    </div>

    <div class="library-container">
      <div class="search-bar">
        <input type="text" v-model="searchTerm" :placeholder="$t('搜索组件...')" />
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
            <button @click="viewComponentDetails(component)">{{ $t('查看详情') }}</button>
          </div>
        </div>
      </div>
      
      <div v-if="filteredComponents.length === 0" class="no-results">
        {{ $t('未找到匹配的组件') }}
      </div>
      
      <!-- 组件详情区域 -->
      <div v-if="selectedComponent" class="component-detail-container">
        <component :is="getComponentByName(selectedComponent.name)"></component>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// 导入组件
const CardComponent = defineAsyncComponent(() => import('@/components/ui/cleanDesign/card/demo/Card.vue'))
const TabsComponent = defineAsyncComponent(() => import('@/components/ui/cleanDesign/tabs/demo/Tabs.vue'))
const DraggableDialogComponent = defineAsyncComponent(() => import('@/components/ui/cleanDesign/draggableDialog/demo/DraggableDialog.vue'))
const ClDialogComponent = defineAsyncComponent(() => import('@/components/ui/cleanDesign/clDialog/demo/ClDialog.vue'))
const RichInputComponent = defineAsyncComponent(() => import('@/components/ui/cleanDesign/richInput/demo/RichInput.vue'))

// 搜索词
const searchTerm = ref('')

// 选中的组件
const selectedComponent = ref<any>(null)

// 缓存键名
const CACHE_KEY = 'componentLibrary_selectedComponent'

// 从 localStorage 恢复选中的组件
const restoreSelectedComponent = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      const cachedComponent = JSON.parse(cached)
      const foundComponent = components.value.find(comp => comp.name === cachedComponent.name)
      if (foundComponent) {
        selectedComponent.value = foundComponent
      }
    }
  } catch {
    // 恢复缓存失败，忽略错误
  }
}

// 保存选中的组件到 localStorage
const saveSelectedComponent = (component: any) => {
  try {
    if (component) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(component))
    } else {
      localStorage.removeItem(CACHE_KEY)
    }
  } catch {
    // 保存缓存失败，忽略错误
  }
}

// 组件库数据
const components = ref([
  {
    name: 'Card',
    icon: 'iconfont iconanniu',
    description: t('卡片组件，用于展示相关信息的容器，具有清晰的边界和层次结构'),
    category: t('基础组件')
  },
  {
    name: 'Tabs',
    icon: 'iconfont iconbiaoge',
    description: t('标签页组件，允许用户在不同的内容视图之间切换'),
    category: t('导航组件')
  },
  {
    name: 'DraggableDialog',
    icon: 'iconfont iconanniu',
    description: t('可拖拽弹窗组件，支持通过标题栏拖拽移动位置，Tailwind 极简风格'),
    category: t('反馈组件')
  },
  {
    name: 'ClDialog',
    icon: 'iconfont iconanniu',
    description: t('基于 Element Plus 封装的对话框组件，支持亮色/暗色主题切换'),
    category: t('反馈组件')
  },
  {
    name: 'RichInput',
    icon: 'iconfont iconbiaoge',
    description: t('富文本变量输入组件，支持 {{variable}} 语法，可自定义变量样式和 Popover 交互'),
    category: t('表单组件')
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
    case 'card':
      return CardComponent
    case 'tabs':
      return TabsComponent
    case 'draggabledialog':
      return DraggableDialogComponent
    case 'cldialog':
      return ClDialogComponent
    case 'richinput':
      return RichInputComponent
    default:
      return null
  }
}

// 查看组件详情
const viewComponentDetails = (component: any) => {
  selectedComponent.value = component
  saveSelectedComponent(component)
}

// 页面加载时恢复缓存的组件
onMounted(() => {
  restoreSelectedComponent()
})
</script>

<style lang="scss" scoped>
.component-library {
  width: 100%;
  height: 100%;
  padding: 0;

  .page-title {
    margin-bottom: 24px;

    h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #333;
    }
  }
  
  .library-container {
    width: 100%;
    
    .search-bar {
      margin-bottom: 20px;
      
      input {
        width: 100%;
        padding: 10px 15px;
        border: 1px solid var(--el-border-color);
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
            color: var(--el-text-color-regular);
            line-height: 1.5;
          }
        }
        
        .component-actions {
          margin-top: 15px;
          
          button {
            width: 100%;
            padding: 8px 0;
            background-color: #f5f7fa;
            border: 1px solid var(--el-border-color);
            border-radius: 4px;
            color: var(--el-text-color-regular);
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
      color: var(--el-text-color-secondary);
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
