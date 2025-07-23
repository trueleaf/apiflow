<template>
  <div class="personal-settings">
    <el-row :gutter="24">
      <!-- 主题设置 -->
      <el-col :span="12">
        <el-card class="setting-card">
          <template #header>
            <div class="card-header">
              <el-icon><Sunny /></el-icon>
              <span>{{ $t('主题设置') }}</span>
            </div>
          </template>
          
          <div class="setting-item">
            <div class="setting-label">{{ $t('主题模式') }}</div>
            <el-radio-group v-model="settings.theme" @change="handleThemeChange">
              <el-radio value="light">{{ $t('浅色主题') }}</el-radio>
              <el-radio value="dark">{{ $t('深色主题') }}</el-radio>
              <el-radio value="auto">{{ $t('跟随系统') }}</el-radio>
            </el-radio-group>
          </div>
          
          <div class="setting-item">
            <div class="setting-label">{{ $t('主题色') }}</div>
            <div class="color-picker-container">
              <el-color-picker 
                v-model="settings.primaryColor" 
                @change="handlePrimaryColorChange"
                :predefine="predefineColors"
              />
              <span class="color-text">{{ settings.primaryColor }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 语言设置 -->
      <el-col :span="12">
        <el-card class="setting-card">
          <template #header>
            <div class="card-header">
              <el-icon><ChatDotRound /></el-icon>
              <span>{{ $t('语言设置') }}</span>
            </div>
          </template>
          
          <div class="setting-item">
            <div class="setting-label">{{ $t('界面语言') }}</div>
            <el-select v-model="settings.language" @change="handleLanguageChange">
              <el-option 
                v-for="lang in languageOptions" 
                :key="lang.value" 
                :label="lang.label" 
                :value="lang.value"
              />
            </el-select>
          </div>
        </el-card>
      </el-col>
      
      <!-- 界面设置 -->
      <el-col :span="12">
        <el-card class="setting-card">
          <template #header>
            <div class="card-header">
              <el-icon><Setting /></el-icon>
              <span>{{ $t('界面设置') }}</span>
            </div>
          </template>
          
          <div class="setting-item">
            <div class="setting-label">{{ $t('字体大小') }}</div>
            <el-slider 
              v-model="settings.fontSize" 
              :min="12" 
              :max="18" 
              :step="1"
              :marks="fontSizeMarks"
              @change="handleFontSizeChange"
            />
          </div>
          
          <div class="setting-item">
            <div class="setting-label">{{ $t('紧凑模式') }}</div>
            <el-switch 
              v-model="settings.compactMode" 
              @change="handleCompactModeChange"
            />
          </div>
          
          <div class="setting-item">
            <div class="setting-label">{{ $t('显示侧边栏') }}</div>
            <el-switch 
              v-model="settings.showSidebar" 
              @change="handleSidebarChange"
            />
          </div>
        </el-card>
      </el-col>
      
      <!-- 其他设置 -->
      <el-col :span="12">
        <el-card class="setting-card">
          <template #header>
            <div class="card-header">
              <el-icon><Tools /></el-icon>
              <span>{{ $t('其他设置') }}</span>
            </div>
          </template>
          
          <div class="setting-item">
            <div class="setting-label">{{ $t('自动保存') }}</div>
            <el-switch 
              v-model="settings.autoSave" 
              @change="handleAutoSaveChange"
            />
          </div>
          
          <div class="setting-item">
            <div class="setting-label">{{ $t('启动时恢复标签页') }}</div>
            <el-switch 
              v-model="settings.restoreTabs" 
              @change="handleRestoreTabsChange"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <div class="setting-actions">
      <el-button type="primary" @click="saveAllSettings">
        {{ $t('保存所有设置') }}
      </el-button>
      <el-button @click="resetSettings">
        {{ $t('恢复默认') }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useTranslation } from 'i18next-vue'
import { Sunny, ChatDotRound, Setting, Tools } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import i18next from 'i18next'

const { t } = useTranslation()

// 设置数据
const settings = reactive({
  theme: 'light',
  primaryColor: '#409EFF',
  language: 'zh-cn',
  fontSize: 14,
  compactMode: false,
  showSidebar: true,
  autoSave: true,
  restoreTabs: true
})

// 预定义颜色
const predefineColors = [
  '#409EFF',
  '#67C23A',
  '#E6A23C',
  '#F56C6C',
  '#909399',
  '#c71585',
  '#ff8c00',
  '#ffd700'
]

// 语言选项
const languageOptions = [
  { label: '简体中文', value: 'zh-cn' },
  { label: 'English', value: 'en' },
  { label: '繁體中文', value: 'zh-tw' }
]

// 字体大小标记
const fontSizeMarks = {
  12: '小',
  14: '中',
  16: '大',
  18: '特大'
}

// 主题变更
const handleThemeChange = (theme: string) => {
  console.log('主题变更:', theme)
  ElMessage.success(`已切换到${theme === 'light' ? '浅色' : theme === 'dark' ? '深色' : '自动'}主题`)
}

// 主题色变更
const handlePrimaryColorChange = (color: string) => {
  console.log('主题色变更:', color)
  ElMessage.success(`主题色已更改为 ${color}`)
}

// 语言变更
const handleLanguageChange = (language: string) => {
  console.log('语言变更:', language)
  i18next.changeLanguage(language)
  ElMessage.success('语言设置已更新')
}

// 字体大小变更
const handleFontSizeChange = (fontSize: number) => {
  console.log('字体大小变更:', fontSize)
  document.documentElement.style.fontSize = `${fontSize}px`
}

// 紧凑模式变更
const handleCompactModeChange = (compact: boolean) => {
  console.log('紧凑模式变更:', compact)
  ElMessage.success(`${compact ? '启用' : '禁用'}紧凑模式`)
}

// 侧边栏显示变更
const handleSidebarChange = (show: boolean) => {
  console.log('侧边栏显示变更:', show)
  ElMessage.success(`${show ? '显示' : '隐藏'}侧边栏`)
}

// 自动保存变更
const handleAutoSaveChange = (autoSave: boolean) => {
  console.log('自动保存变更:', autoSave)
  ElMessage.success(`${autoSave ? '启用' : '禁用'}自动保存`)
}

// 恢复标签页变更
const handleRestoreTabsChange = (restore: boolean) => {
  console.log('恢复标签页变更:', restore)
  ElMessage.success(`${restore ? '启用' : '禁用'}启动时恢复标签页`)
}

// 保存所有设置
const saveAllSettings = () => {
  console.log('保存所有设置:', settings)
  localStorage.setItem('userSettings', JSON.stringify(settings))
  ElMessage.success('所有设置已保存')
}

// 恢复默认设置
const resetSettings = () => {
  Object.assign(settings, {
    theme: 'light',
    primaryColor: '#409EFF',
    language: 'zh-cn',
    fontSize: 14,
    compactMode: false,
    showSidebar: true,
    autoSave: true,
    restoreTabs: true
  })
  ElMessage.success('已恢复默认设置')
}

onMounted(() => {
  // 加载保存的设置
  const savedSettings = localStorage.getItem('userSettings')
  if (savedSettings) {
    try {
      Object.assign(settings, JSON.parse(savedSettings))
    } catch (error) {
      console.error('加载设置失败:', error)
    }
  }
})
</script>

<style lang="scss" scoped>
.personal-settings {
  .setting-card {
    margin-bottom: 24px;
    
    .card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      font-size: 16px;
    }
  }
  
  .setting-item {
    margin-bottom: 20px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .setting-label {
      margin-bottom: 8px;
      font-weight: 500;
      color: var(--gray-700);
    }
    
    .color-picker-container {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .color-text {
        font-family: monospace;
        color: var(--gray-600);
      }
    }
  }
  
  .setting-actions {
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid var(--gray-200);
    display: flex;
    gap: 12px;
  }
}
</style>
